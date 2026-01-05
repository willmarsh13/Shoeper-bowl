const client = require('../../MongoClient');
const {checkLogin, checkAdmin, sendSignupApprovedEmail} = require("../../Auth/authorization");

async function getRequests(req, res) {

    const requestCollection = (await client.connect()).db('Authorization').collection('Requests');

    const results = await requestCollection.find(
        {status: 'submitted'},
        {projection: {_id: 0}}
    ).toArray()

    const sortedResults = await results.sort((a, b) => a.toLowerCase() - b.toLowerCase())

    return {
        message: 'Successfully found sortedResults',
        count: await sortedResults.length,
        results: await sortedResults,
        status: 200,
    }

}

async function updateRequest(req, res) {

    const user = req.body.user
    const isApproved = req.body.isApproved;

    if (!user || isApproved === null || isApproved === undefined) {
        return {
            status: 400,
            message: 'Missing user or isApproved value',
            variant: 'error',
        }
    }

    const requestCollection = (await client.connect()).db('Authorization').collection('Requests');
    const userCollection = (await client.connect()).db('Authorization').collection('Users');

    const {Email, firstName, lastName, Role, approved} = await checkAdmin(req, res)

    if (!Email || !firstName || !lastName || !Role || !approved) {
        return {
            status: 400,
            message: `Incomplete user information or user doesn't exist.`,
            variant: 'error',
        }
    }

    if (Role !== 'Admin' && Role !== 'admin') {
        return {
            status: 400,
            message: `User is not authorized to approve/reject users.`,
            variant: 'error',
        }
    }

    const timeStamp = new Date()

    const results = await requestCollection.findOneAndUpdate(
        {Email: user.Email},
        {
            $set: {
                status: isApproved ? 'Approved' : 'Denied',
                updatedBy: {
                    Email, firstName, lastName, timeStamp
                },
            }
        }
    )

    const userResults = await userCollection.findOneAndUpdate(
        {Email: await results.Email},
        {
            $set: {
                active: isApproved ?? false,
                approved: isApproved ?? false,
            }
        }
    )

    if (results && userResults) {
        if (isApproved) await sendSignupApprovedEmail({userEmail: results.Email})

        return {
            message: 'Successfully updated user',
            status: 200,
            variant: 'success',
        }
    } else {
        return {
            message: 'There was an error finding the user',
            status: 500,
            variant: 'error',
        }
    }

}

module.exports = {
    getRequests,
    updateRequest,
}