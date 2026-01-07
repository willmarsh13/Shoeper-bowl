const client = require("../MongoClient");


async function getGameInfo() {

    await client.connect();
    const gameInfoCollection = client.db('FantasyFootball').collection('GameInfo');

    let gameInfo = await gameInfoCollection.findOne({ status: { $in: ['Active', 'Locked'] } }, {
        projection: {_id: 0},
    });

    return {
        round: gameInfo.round || 'WILD_CARD',
        teams: gameInfo.teams || [],
        status: gameInfo.status || 'Active',
    }
}

module.exports = {
    getGameInfo,
}