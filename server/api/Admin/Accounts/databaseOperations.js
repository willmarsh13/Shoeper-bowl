const client = require('../../MongoClient');
const {checkAdmin} = require("../../Auth/authorization");
const {getGameInfo} = require("../../Game/databaseOperations");

async function getAccounts(req, res) {
    try {
        // Verify admin role
        const {Role} = await checkAdmin(req, res);

        if (Role !== 'Admin' && Role !== 'admin') {
            return {
                status: 401,
                message: 'User is not authorized to view accounts.',
                variant: 'error',
                count: 0,
                results: [],
            };
        }

        // Get active game round
        const {round} = await getGameInfo();

        const db = await client.connect();

        // Fetch Requests + join Users in Authorization database
        const requestsCollection = db.db('Authorization').collection('Requests');

        const requests = await requestsCollection.aggregate([
            {$sort: {created: 1}},
            {
                $lookup: {
                    from: 'Users',
                    localField: 'Email',
                    foreignField: 'Email',
                    as: 'user'
                }
            },
            {$unwind: {path: '$user', preserveNullAndEmptyArrays: true}},
            {
                $project: {
                    _id: 0,
                    Email: 1,
                    created: 1,
                    firstName: '$user.firstName',
                    lastName: '$user.lastName',
                    status: 1,
                }
            }
        ]).toArray();

        // Fetch UserPicks from FantasyFootball database for the active round
        const picksCollection = db.db('FantasyFootball').collection('UserPicks');
        const picks = await picksCollection.find({round}, {
            projection: {_id: 0},
        }).toArray();

        // Map picks by email for easy lookup
        const picksByEmail = {};
        picks.forEach(p => {
            const emailKey = p.email.toLowerCase();
            if (!picksByEmail[emailKey]) picksByEmail[emailKey] = [];
            picksByEmail[emailKey].push(p);
        });

        // Merge picks into requests
        const results = requests.map(r => {
            const emailKey = r.Email.toLowerCase();
            const userPicks = picksByEmail[emailKey] || [];
            return {
                ...r,
                round,
                hasPicks: userPicks.length > 0,
                picks: userPicks
            };
        });

        return {
            message: 'Successfully retrieved account requests',
            count: results.length,
            results,
            status: 200,
            variant: 'success',
            round,
        };

    } catch (err) {
        console.error('getAccounts error:', err);
        return {
            status: 500,
            variant: 'error',
            message: 'Failed to retrieve requests',
            count: 0,
            results: [],
        };
    }
}

module.exports = {
    getAccounts,
};
