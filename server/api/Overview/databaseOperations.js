const client = require("../MongoClient");
const { getGameInfo } = require("../Game/databaseOperations");
const { POSITION_CATEGORY_MAP } = require("../Admin/Scoring/helpers/scoringCategoryMap");
const { calculateEntityScore } = require("../services/calculateFantasyPoints");
const { ROUND_CONFIG } = require("../logic/roundRules");

async function getOverview(req) {
    await client.connect();

    const db = client.db("FantasyFootball");
    const userPicksCollection = db.collection("UserPicks");
    const scoresCollection = db.collection("Scores");

    const { round: currentRound } = await getGameInfo(req);
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

module.exports = {
    getOverview,
};
