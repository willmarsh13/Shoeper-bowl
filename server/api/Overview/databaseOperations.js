const client = require("../MongoClient");
const { getGameInfo, LOCKED_ROUND_PRIORITY} = require("../Game/databaseOperations");
const { POSITION_CATEGORY_MAP } = require("../Admin/Scoring/helpers/scoringCategoryMap");
const { calculateEntityScore } = require("../services/calculateFantasyPoints");
const { ROUND_CONFIG } = require("../logic/roundRules");

async function getOverview(req) {
    await client.connect();

    const db = client.db("FantasyFootball");
    const userPicksCollection = db.collection("UserPicks");
    const scoresCollection = db.collection("Scores");

    const { round: currentRound } = await getRoundForOverview(req);
    const allRounds = Object.keys(ROUND_CONFIG);

    const picks = await userPicksCollection.find({}).toArray();
    const scores = await scoresCollection.find({}).toArray();

    const scoreMap = new Map();
    for (const doc of scores) {
        scoreMap.set(`${doc.round}|${doc.key}`, doc.scores || {});
    }

    const userMap = new Map();

    for (const pick of picks) {
        const { email, firstName, lastName, round, roster = [] } = pick;

        if (!userMap.has(email)) {
            const perRoundScores = {};
            const perRoundRoster = {};

            for (const r of allRounds) {
                perRoundScores[r] = 0;
                perRoundRoster[r] = [];
            }

            userMap.set(email, {
                email,
                firstName,
                lastName,
                perRoundScores,
                perRoundRoster,
                totalScore: 0,
            });
        }

        const user = userMap.get(email);
        let roundTotal = 0;

        for (const slot of roster) {
            const category = POSITION_CATEGORY_MAP[slot.position];
            if (!category || !slot.player) continue;

            const entityKey =
                category === "dst"
                    ? slot.player.team
                    : `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;

            const rawStats =
                scoreMap.get(`${round}|${entityKey}`) || {};

            const scoring = calculateEntityScore(category, rawStats);
            roundTotal += scoring.totalPoints;

            user.perRoundRoster[round].push({
                slotId: slot.slotId,
                position: slot.position,
                player: slot.player,
                scoring,
            });
        }

        user.perRoundScores[round] = roundTotal;
    }

    for (const user of userMap.values()) {
        user.totalScore = Object.values(user.perRoundScores).reduce(
            (sum, val) => sum + val,
            0
        );
    }

    return {
        status: 200,
        data: {
            currentRound,
            rounds: allRounds,
            users: Array.from(userMap.values()),
        },
    };
}

async function getRoundForOverview() {
    await client.connect();

    const db = client.db("FantasyFootball");
    const gameInfoCollection = db.collection("GameInfo");
    const scoresCollection = db.collection("Scores");

    const allRounds = Object.keys(ROUND_CONFIG);

    async function roundHasScores(round) {
        const count = await scoresCollection.countDocuments({ round });
        return count > 0;
    }

    /* Step 1: Prefer any Active round WITH scores */
    const activeGame = await gameInfoCollection.findOne(
        { status: "Active" },
        { projection: { _id: 0 } }
    );

    if (activeGame) {
        const round = activeGame.round || "WILD_CARD";

        if (await roundHasScores(round)) {
            return {
                round,
                teams: activeGame.teams || [],
                status: activeGame.status || "Active",
            };
        }
    }

    /* Step 2: Locked rounds in priority order WITH scores */
    const lockedGames = await gameInfoCollection
        .find(
            {
                status: "Locked",
                round: { $in: LOCKED_ROUND_PRIORITY },
            },
            { projection: { _id: 0 } }
        )
        .toArray();

    for (const round of LOCKED_ROUND_PRIORITY) {
        const game = lockedGames.find(g => g.round === round);
        if (!game) continue;

        if (await roundHasScores(round)) {
            return {
                round,
                teams: game.teams || [],
                status: game.status || "Locked",
            };
        }
    }

    /* Step 3: Walk backward through rounds until scores exist */
    for (const round of allRounds.slice().reverse()) {
        if (await roundHasScores(round)) {
            return {
                round,
                teams: [],
                status: "Locked",
            };
        }
    }

    /* Step 4: Absolute safe fallback */
    return {
        round: "WILD_CARD",
        teams: [],
        status: "Active",
    };
}


module.exports = {
    getOverview,
};
