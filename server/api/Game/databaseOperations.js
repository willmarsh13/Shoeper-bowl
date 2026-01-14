const client = require("../MongoClient");

const LOCKED_ROUND_PRIORITY = [
    "CONFERENCE_CHAMPIONSHIP",
    "DIVISIONAL",
    "WILD_CARD",
];

async function getGameInfo() {
    await client.connect();

    const gameInfoCollection = client
        .db("FantasyFootball")
        .collection("GameInfo");

    /* Step 1: Prefer any Active round */
    const activeGame = await gameInfoCollection.findOne(
        { status: "Active" },
        { projection: { _id: 0 } }
    );

    if (activeGame) {
        return {
            round: activeGame.round || "WILD_CARD",
            teams: activeGame.teams || [],
            status: activeGame.status || "Active",
        };
    }

    /* Step 2: Fall back to Locked rounds in priority order */
    const lockedGames = await gameInfoCollection
        .find(
            {
                status: "Locked",
                round: { $in: LOCKED_ROUND_PRIORITY },
            },
            { projection: { _id: 0 } }
        )
        .toArray();

    if (lockedGames.length) {
        const selectedLockedGame = LOCKED_ROUND_PRIORITY
            .map(round =>
                lockedGames.find(game => game.round === round)
            )
            .find(Boolean);

        if (selectedLockedGame) {
            return {
                round: selectedLockedGame.round,
                teams: selectedLockedGame.teams || [],
                status: selectedLockedGame.status || "Locked",
            };
        }
    }

    /* Step 3: Safe fallback */
    return {
        round: "WILD_CARD",
        teams: [],
        status: "Active",
    };
}

module.exports = {
    getGameInfo,
};
