const client = require("../MongoClient");
const { getGameInfo } = require("../Game/databaseOperations");
const { POSITION_CATEGORY_MAP } = require("../Admin/Scoring/helpers/scoringCategoryMap");

async function getScores(req, res) {
    await client.connect();

    const { round: currentRound } = await getGameInfo(req);

    const db = client.db('FantasyFootball');
    const userPicksCollection = db.collection('UserPicks');
    const scoresCollection = db.collection('Scores');

    const allPicks = await userPicksCollection
        .find({ round: currentRound })
        .toArray();

    const draftCountMap = new Map(); // key -> count
    for (const user of allPicks) {
        for (const slot of user.roster || []) {
            if (!slot.position || !slot.player) continue;

            const category = POSITION_CATEGORY_MAP[slot.position];
            if (!category) continue;

            let key;
            if (category === 'dst') {
                key = slot.player.team;
            } else {
                key = `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;
            }

            draftCountMap.set(key, (draftCountMap.get(key) || 0) + 1);
        }
    }

    const scoreDocs = await scoresCollection
        .find({ round: currentRound })
        .project({ _id: 0, key: 1, scores: 1, updatedAt: 1 })
        .toArray();

    const scoreMap = new Map();
    for (const doc of scoreDocs) {
        scoreMap.set(doc.key, {
            scores: doc.scores || {},
            updatedAt: doc.updatedAt || null
        });
    }

    const offense = new Map();
    const kicker = new Map();
    const dst = new Map();

    for (const user of allPicks) {
        for (const slot of user.roster || []) {
            if (!slot.position || !slot.player) continue;

            const category = POSITION_CATEGORY_MAP[slot.position];
            if (!category) continue;

            if (category === 'dst') {
                const team = slot.player.team;
                if (!team || dst.has(team)) continue;

                const scoreData = scoreMap.get(team) || {};
                dst.set(team, {
                    entityId: team,
                    displayName: `${team} D/ST`,
                    team,
                    position: 'DST',
                    category: 'dst',
                    scores: scoreData.scores || {},
                    updatedAt: scoreData.updatedAt || null,
                    draftCount: draftCountMap.get(team) || 0
                });

            } else {
                const entityId =
                    `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;

                const targetMap =
                    category === 'offense' ? offense : kicker;

                if (targetMap.has(entityId)) continue;

                const scoreData = scoreMap.get(entityId) || {};
                targetMap.set(entityId, {
                    entityId,
                    displayName: slot.player.full_name,
                    team: slot.player.team,
                    position: slot.player.position,
                    category,
                    scores: scoreData.scores || {},
                    updatedAt: scoreData.updatedAt || null,
                    draftCount: draftCountMap.get(entityId) || 0
                });
            }
        }
    }

    return {
        status: 200,
        message: 'success',
        results: {
            round: currentRound,
            offense: Array.from(offense.values()),
            kicker: Array.from(kicker.values()),
            dst: Array.from(dst.values()),
        },
    };
}

module.exports = {
    getScores,
};
