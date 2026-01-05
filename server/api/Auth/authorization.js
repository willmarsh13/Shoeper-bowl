const crypto = require('crypto');
const client = require('./../MongoClient');
const bcrypt = require('bcryptjs');

const {SendEmail} = require("../services/emailService");


async function generateToken() {
    let token = crypto.randomBytes(48).toString('hex');

    return {
        token: token
    };
}

async function checkToken(token) {
    await client.connect();
    const userCollection = client.db('Authorization').collection('ActiveSessions');

    let user = await userCollection.findOne({Token: token});
    await userCollection.updateOne(
        {"Token": token},
        {$set: {"SessionLastActive": `${new Date()}`}}
    )
    return user;
}

async function logout(req, res) {
    let cookies = req?.headers?.cookie?.split('=');
    let token = '';
    for (let i = 0; i < cookies?.length; i++) {
        if (cookies[i] === 'secure-token-mfa') {
            token = cookies[i + 1];
            break;
        }
    }

    res.clearCookie('secure-token-mfa')

    await client.connect();
    const userCollection = client.db('Authorization').collection('ActiveSessions');
    const filter = {Token: token}
    await userCollection.findOneAndDelete(filter);

    return {
        message: 'success!'
    }
}

/* checks to see if there is a cookie */
async function checkLogin(req) {

    let cookies = req?.headers?.cookie?.split(';');
    let token = '';
    for (let i = 0; i < cookies?.length; i++) {
        let key = cookies[i]?.split('=')[0]?.trim() || null
        const value = cookies[i]?.split('=')[1]?.trim() || null
        if (key === 'secure-token-mfa') {
            token = value
            break;
        }
    }
    const secureTokenMfa = token;

    if (secureTokenMfa) {
        try {
            const user = await checkToken(secureTokenMfa);
            if (user === null) {
                return {
                    status: 400,
                    message: "Token expired"
                };
            } else {
                return {
                    status: 200,
                    message: 'Welcome!',
                    results: secureTokenMfa,
                    user: user
                };
            }
        } catch (error) {
            console.error("Error verifying token:", error);
            throw error; // Throw error to be caught by the middleware
        }
    } else {
        return {
            status: 401,
            message: "Unauthorized"
        };
    }
}

async function SignUserIn(req, res) {
    const COOKIE_EXPIRY_HOURS = 24
    // Sign user in
    let username = req.body?.username;
    let password = req.body?.password;

    // Missing data
    if (!username || username?.length <= 0 || typeof (username) != "string") {
        return {
            status: 400,
            message: 'Username is missing'
        };
    }

    if (!password || password?.length <= 0 || typeof (password) != "string") {
        return {
            status: 400,
            message: 'Password is missing'
        };
    }

    await client.connect();
    const userCollection = client.db('Authorization').collection('Users');

    const user = await userCollection.findOne({Email: username});

    if (!user) {
        return {
            status: 400,
            message: 'Incorrect Username or Password'
        };
    }

    if (user.approved === false) {
        return {
            status: 400,
            message: 'Account has not yet been approved.',
        }
    }

    // Compare the provided password hash with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.PasswordHash);
    const host = req.headers.host;

    if (isPasswordMatch) {
        // Generate token
        const token = (await generateToken()).token;

        res.cookie('secure-token-mfa', token, {
            host: host,
            secure: true,
            sameSite: 'strict',
            httpOnly: true,
            maxAge: COOKIE_EXPIRY_HOURS * 1000 * 60 * 60,
        });

        // Update active sessions
        const sessionCollection = client.db('Authorization').collection('ActiveSessions');
        await sessionCollection.updateOne(
            {"Email": username},
            {
                $set: {
                    "Token": token,
                    "SessionStart": `${new Date()}`,
                    "SessionLastActive": `${new Date()}`,
                    "Active": "true",
                    "Email": username
                }
            }, {upsert: true}
        );

        return {
            status: 200,
            message: 'Welcome!',
            results: token,
        };
    } else {
        return {
            status: 400,
            message: 'Incorrect Username or Password'
        };
    }
}

async function updatePassword(req) {
    let username = req.body.username;
    let password = req.body.password;

    await client.connect();
    const userCollection = client.db('Authorization').collection('Users');

    let resp = await userCollection.updateOne(
        {"Email": username},
        {$set: {"PasswordHash": await bcrypt.hash(password, 10)}}
    );

    client.close();

    if (resp?.acknowledged && resp?.modifiedCount === 1) {
        return {
            status: 200,
            message: "Successfully reset password."
        };
    }

    if (resp?.acknowledged && resp?.modifiedCount === 0) {
        return {
            status: 401,
            message: "User not found."
        };
    }

    return {
        status: 500,
        message: "There was an issue with your request. Try again later"
    };
}

async function getUserInfo(req) {

    const userResp = await checkLogin(req)

    if (userResp && userResp.user && userResp.user.Email) {
        const userFilter = {Email: userResp.user.Email}

        const userCollection = client.db('Authorization').collection('Users');
        return await userCollection.findOne(userFilter)
    } else {
        return null
    }
}

async function signUp(req) {

    const email = req.body.username;
    const password = req.body.password;

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    await client.connect();
    const userCollection = client.db('Authorization').collection('Users');
    const requestCollection = client.db('Authorization').collection('Requests');

    const createAccountResp = await userCollection.updateOne(
        {"Email": email},
        {
            $setOnInsert: {
                "PasswordHash": await bcrypt.hash(password, 10),
                "Role": "User",
                "firstName": firstName,
                "lastName": lastName,
                "active": false,
                "approved": false,
            }
        },
        {upsert: true}
    );

    const createRequestResp = await requestCollection.updateOne(
        {"Email": email},
        {
            $setOnInsert: {
                "firstName": firstName,
                "lastName": lastName,
                "created": new Date(),
                "status": "submitted",
            }
        },
        {upsert: true}
    )

    if (createRequestResp.acknowledged && createRequestResp.matchedCount === 1) {
        return {
            status: 400,
            variant: 'warning',
            message: 'Account already created but has not been approved yet.',
        }
    } else if (createAccountResp?.acknowledged && createAccountResp?.matchedCount === 1) {
        return {
            status: 400,
            variant: 'warning',
            message: "User already exists. Please log in."
        };
    } else if (createAccountResp.acknowledged && createAccountResp.upsertedCount === 1 && createRequestResp.acknowledged && createRequestResp.upsertedCount === 1) {

        await sendSignupApprovalEmail({
            firstName,
            lastName,
            userEmail: email,
            approveUrl: "https://willmarsh.dev/shoeper-bowl?linkto=adminApproveSignUp",
            rejectUrl: "https://willmarsh.dev/shoeper-bowl?linkto=adminRejectSignUp",
        })

        return {
            status: 200,
            variant: 'success',
            message: 'Successfully created account. Please wait for Admin to approve.'
        }
    } else {
        return {
            status: 500,
            variant: 'error',
            message: "There was an issue with your request. Try again later"
        };
    }
}

async function sendSignupApprovalEmail({
                                           firstName,
                                           lastName,
                                           userEmail,
                                           approveUrl,
                                           rejectUrl,
                                       }) {
    return SendEmail({
        toEmails: [
            "willmarsh13@gmail.com",
            "prestonshoe21@gmail.com",
        ],
        subject: "New Shoeper-bowl Signup Pending Approval",
        body: `
            A new user has signed up for Shoeper-bowl and is awaiting approval.

            Name: ${firstName} ${lastName}
            Email: ${userEmail}

            Please review the request below.
        `,
        ctaText: "Approve Signup",
        ctaUrl: approveUrl,
        secondaryText: "Reject signup",
        secondaryUrl: rejectUrl,
    });
}

module.exports = {
    checkLogin,
    updatePassword,
    SignUserIn,
    logout,
    checkAdmin: getUserInfo,
    signUp,
    sendSignupApprovalEmail,
};
