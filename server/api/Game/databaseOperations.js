const client = require("../MongoClient");


async function getGameInfo() {

    await client.connect();
    const gameInfoCollection = client.db('FantasyFootball').collection('GameInfo');

    let gameInfo = await gameInfoCollection.findOne({status: 'Active'}, {
        projection: {_id: 0},
    });

    return {
        round: gameInfo.round || 'WILD_CARD',
        teams: gameInfo.teams || [],
    }
}

module.exports = {
    getGameInfo,
}