const client = require('../../MongoClient');
const {checkAdmin} = require("../../Auth/authorization");

async function CreateServiceAccount(req, res) {
    const {accountID} = req.body;

    if (!accountID) {
        return {
            message: 'Missing accountID',
            status: 400,
            results: [],
            variant: 'error',
        }
    }

    const serviceCollection = (await client.connect()).db('Authorization').collection('ServiceAccount');
    const {Email, firstName, lastName} = await checkAdmin(req, res)
    const token = generateString(32);

    const results = await serviceCollection.findOneAndUpdate(
        {accountID},
        {
            $set: {
                active: true,
                token,
                updatedBy: {
                    Email,
                    firstName,
                    lastName,
                },
                created: new Date(),
                lastAccessed: null,
            }
        },
        { upsert: true, returnDocument: 'after' }
    )

    if (results) {
        return {
            status: 200,
            message: 'Successfully created service account',
            results,
            variant: 'success',
        }
    }

}

async function DeleteServiceAccount(req, res) {

    const {accountID} = req.body;

    if (!accountID) {
        return {
            message: 'Missing accountID',
            status: 400,
            results: [],
            variant: 'error',
        }
    }

    const serviceCollection = (await client.connect()).db('Authorization').collection('ServiceAccount');
    const {Email, firstName, lastName} = await checkAdmin(req, res)

    const results = await serviceCollection.findOneAndUpdate(
        {accountID},
        {
            $set: {
                active: false,
                deletedBy: {
                    Email,
                    firstName,
                    lastName,
                    updated: new Date(),
                },
                lastAccessed: null,
            },
        },
        { returnDocument: 'after' }
    )

    if (results) {
        return {
            status: 200,
            message: 'Successfully deleted service account',
            results,
            variant: 'success',
        }
    }

}

async function ResetServiceAccount(req, res) {

    const {accountID} = req.body;
    const token = generateString(32);

    const serviceCollection = (await client.connect()).db('Authorization').collection('ServiceAccount');
    const {Email, firstName, lastName} = await checkAdmin(req, res)

    const results = await serviceCollection.findOneAndUpdate(
        {accountID},
        {
            $set: {
                token,
                resetBy: {
                    Email,
                    firstName,
                    lastName,
                    updated: new Date(),
                },
                lastAccessed: null,
            }
        },
        { returnDocument: 'after' }
    )

    if (results) {
        return {
            status: 200,
            message: 'Successfully deleted service account',
            results,
            token,
            variant: 'success',
        }
    }


}

async function GetServiceAccounts(req, res) {

    const serviceCollection = (await client.connect()).db('Authorization').collection('ServiceAccount');

    const results = await serviceCollection.find().sort({ created: 1, active: -1, }).toArray();

    if (results) {
        return {
            status: 200,
            message: 'Successfully found service accounts',
            results,
            variant: 'success',
        }
    }

    return {
        status: 500,
        message: 'Unable to find service accounts',
        results: [],
        variant: 'error',
    }

}


function generateString(length) {
    const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = ' ';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
}

module.exports = {
    CreateServiceAccount,
    DeleteServiceAccount,
    ResetServiceAccount,
    GetServiceAccounts
}