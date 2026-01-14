const {checkAdmin} = require("../../Auth/authorization");
const client = require("../../MongoClient");
const {ALLOWED_STAT_KEYS} = require("../../Scores/scoringStats");

async function updateScores(req, res) {
    const {Role} = await checkAdmin(req, res);
    const {round} = req.body

    if (Role !== 'Admin' && Role !== 'admin') {
        return {
            status: 403,
            message: 'User is not authorized to update scoring.',
            variant: 'error',
        };
    }

    await client.connect();
    const scoresCollection = client.db('FantasyFootball').collection('Scores');

    const {changes} = req.body;

    if (!changes || typeof changes !== 'object') {
        return {
            status: 400,
            variant: 'error',
            message: 'Invalid score payload',
        };
    }

    if (!round) {
        return {
            status: 400,
            variant: 'error',
            message: 'No active round found',
        };
    }

    const bulkOps = [];
    const now = new Date();
    const invalidStats = [];

    for (const [key, scoreChanges] of Object.entries(changes)) {
        if (!scoreChanges || typeof scoreChanges !== 'object') continue;

        const setPayload = {
            updatedAt: now,
        };

        for (const [statKey, value] of Object.entries(scoreChanges)) {
            if (!ALLOWED_STAT_KEYS.has(statKey)) {
                invalidStats.push({key, statKey});
                continue;
            }

            if (typeof value !== 'number') {
                invalidStats.push({key, statKey});
                continue;
            }

            setPayload[`scores.${statKey}`] = value;
        }

        if (Object.keys(setPayload).length > 1) {
            bulkOps.push({
                updateOne: {
                    filter: {key, round},
                    update: {$set: setPayload},
                    upsert: true,
                },
            });
        }
    }

    if (invalidStats.length) {
        return {
            status: 400,
            variant: 'error',
            message: 'Invalid stat keys or values detected',
            data: {invalidStats},
        };
    }

    if (!bulkOps.length) {
        return {
            status: 400,
            variant: 'error',
            message: 'No valid score updates found',
        };
    }

    await scoresCollection.bulkWrite(bulkOps);

    return {
        status: 200,
        variant: 'success',
        message: 'Scores updated',
        count: bulkOps.length,
    };
}

module.exports = {
    updateScores,
};
