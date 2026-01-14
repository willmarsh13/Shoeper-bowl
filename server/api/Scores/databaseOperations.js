const client = require("../MongoClient");
const { getGameInfo } = require("../Game/databaseOperations");
const { POSITION_CATEGORY_MAP } = require("../Admin/Scoring/helpers/scoringCategoryMap");

/*
    GET /api/scores?round=ROUND_ID

    Returns:
    {
        round,
        offense[],
        kicker[],
        dst[]
    }
*/
async function getScores(req, res) {
    await client.connect();

    const gameInfo = await getGameInfo(req);
    const round = req.query.round || gameInfo.round;

    const db = client.db("FantasyFootball");
    const userPicksCollection = db.collection("UserPicks");
    const scoresCollection = db.collection("Scores");

    /*
        Pull all rosters for the requested round
    */
    const allPicks = await userPicksCollection
        .find({ round })
        .toArray();

    /*
        Count draft frequency per entity
    */
    const draftCountMap = new Map();

    for (const user of allPicks) {
        for (const slot of user.roster || []) {
            if (!slot.position || !slot.player) continue;

            const category = POSITION_CATEGORY_MAP[slot.position];
            if (!category) continue;

            const key =
                category === "dst"
                    ? slot.player.team
                    : `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;

            draftCountMap.set(key, (draftCountMap.get(key) || 0) + 1);
        }
    }

    /*
        Pull saved scores for the round
    */
    const scoreDocs = await scoresCollection
        .find({ round })
        .project({ _id: 0, key: 1, scores: 1, updatedAt: 1 })
        .toArray();

    const scoreMap = new Map();
    for (const doc of scoreDocs) {
        scoreMap.set(doc.key, {
            scores: doc.scores || {},
            updatedAt: doc.updatedAt || null,
        });
    }

    const offense = new Map();
    const kicker = new Map();
    const dst = new Map();

    /*
        Build entities directly from roster
    */
    for (const user of allPicks) {
        for (const slot of user.roster || []) {
            if (!slot.position || !slot.player) continue;

            const category = POSITION_CATEGORY_MAP[slot.position];
            if (!category) continue;

            if (category === "dst") {
                const team = slot.player.team;
                if (!team || dst.has(team)) continue;

                const scoreData = scoreMap.get(team) || {};
                dst.set(team, {
                    entityId: team,
                    displayName: `${team} D/ST`,
                    team,
                    position: "DST",
                    category: "dst",
                    scores: scoreData.scores || {},
                    updatedAt: scoreData.updatedAt,
                    draftCount: draftCountMap.get(team) || 0,
                });
            } else {
                const entityId =
                    `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;

                const targetMap =
                    category === "offense" ? offense : kicker;

                if (targetMap.has(entityId)) continue;

                const scoreData = scoreMap.get(entityId) || {};
                targetMap.set(entityId, {
                    entityId,
                    displayName: slot.player.full_name,
                    team: slot.player.team,
                    position: slot.player.position,
                    category,
                    scores: scoreData.scores || {},
                    updatedAt: scoreData.updatedAt,
                    draftCount: draftCountMap.get(entityId) || 0,
                });
            }
        }
    }

    res.json({
        status: 200,
        message: "success",
        results: {
            round,
            offense: Array.from(offense.values()),
            kicker: Array.from(kicker.values()),
            dst: Array.from(dst.values()),
        },
    });
}

module.exports = {
    getScores,
};
