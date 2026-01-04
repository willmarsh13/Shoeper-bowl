const { MongoClient, ServerApiVersion } = require('mongodb');
const creds = require('./databaseCreds')

const client = new MongoClient(creds, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

module.exports = client