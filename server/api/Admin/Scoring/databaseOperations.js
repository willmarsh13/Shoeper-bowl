const { checkAdmin } = require("../../Auth/authorization");
const client = require("../../MongoClient");
const { POSITION_CATEGORY_MAP } = require("./helpers/scoringCategoryMap");
const { getGameInfo } = require("../../Game/databaseOperations");

async function getScores(req, res) {
    const { Role } = await checkAdmin(req, res);

    if (Role !== 'Admin' && Role !== 'admin') {
        return {
            status: 403,
            message: 'User is not authorized to view scoring.',
            variant: 'error',
        };
    }

    await client.connect();

    const { round: currentRound } = await getGameInfo(req);
    const userPicksCollection = client
        .db('FantasyFootball')
        .collection('UserPicks');

    const allPicks = await userPicksCollection
        .find({ round: currentRound })
        .toArray();

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

                dst.set(team, {
                    entityId: team,
                    displayName: `${team} D/ST`,
                    team,
                    position: 'DST',
                    category: 'dst',
                });

            } else {
                const entityId = `${slot.player.full_name}|${slot.player.team}|${slot.player.position}`;

                const targetMap =
                    category === 'offense' ? offense : kicker;

                if (targetMap.has(entityId)) continue;

                targetMap.set(entityId, {
                    entityId,
                    displayName: slot.player.full_name,
                    team: slot.player.team,
                    position: slot.player.position,
                    category,
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

async function updateScores(req, res) {
    const { Role } = await checkAdmin(req, res);

    if (Role !== 'Admin' && Role !== 'admin') {
        return {
            status: 403,
            message: 'User is not authorized to update scoring.',
            variant: 'error',
        };
    }

    return {
        status: 200,
        message: 'successfully updated scoring',
        variant: 'success',
    };
}

module.exports = {
    getScores,
    updateScores,
};
