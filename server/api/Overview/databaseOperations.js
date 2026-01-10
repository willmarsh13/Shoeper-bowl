const client = require("../MongoClient");
const {getGameInfo} = require("../Game/databaseOperations");

async function getOverview(req) {
    await client.connect();
    const userPicksCollection = client.db('FantasyFootball').collection('UserPicks');

    const {status: gameStatus, round: currentRound} = await getGameInfo(req);

    if (!currentRound) {
        return {
            status: 400,
            variant: 'error',
            message: 'No active round found',
            data: null,
        };
    }

    if (gameStatus !== 'Locked') {
        return {
            status: 200,
            variant: 'info',
            message: 'Picks are not available until after kickoff of the first game of this round',
            data: null
        };
    }

    // Pull everyone’s picks for current round
    const picks = await userPicksCollection
        .find({round: currentRound})
        .project({_id: 0, email: 1, firstName: 1, lastName: 1, roster: 1, timestamp: 1})
        .toArray();

    return {
        status: 200,
        variant: 'success',
        data: {
            picks,
        }
    };
}

module.exports = {
    getOverview
};
