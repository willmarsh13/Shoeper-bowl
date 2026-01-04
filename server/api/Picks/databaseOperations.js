const client = require("../MongoClient");
const {checkAdmin} = require("../Auth/authorization");
const {ROUND_CONFIG} = require("../logic/roundRules"); // mirror of frontend config
const {getGameInfo} = require('../Game/databaseOperations');

async function postPicks(req) {
    const {Email, firstName, lastName} = await checkAdmin(req)
    const {roster, round, timestamp, saved} = req.body;

    /* ----------------------------------
       Basic presence checks
    ---------------------------------- */
    if (!Array.isArray(roster) || roster.length === 0) {
        return {
            message: 'Roster is required and must be a non-empty array',
            status: 400,
            variant: 'error',
        }
    }

    if (!round || !ROUND_CONFIG[round]) {
        return {
            message: 'Invalid or missing round',
            status: 400,
            variant: 'error',
        };
    }

    if (!timestamp || isNaN(Date.parse(timestamp))) {
        return {
            message: 'Invalid or missing timestamp',
            status: 400,
            variant: 'error',
        };
    }

    const roundConfig = ROUND_CONFIG[round];

    /* ----------------------------------
       Validate roster completeness
    ---------------------------------- */
    const emptySlots = roster.filter(s => !s.player);
    if (emptySlots.length > 0) {
        return {
            message: 'All roster slots must be filled before saving',
            status: 400,
            variant: 'error',
        };
    }

    /* ----------------------------------
       Validate positions & counts
    ---------------------------------- */
    const allowedPositionCounts = roundConfig.allowedPositions.reduce((acc, pos) => {
        acc[pos] = (acc[pos] || 0) + 1;
        return acc;
    }, {});

    const usedPositionCounts = {};

    for (const slot of roster) {
        const {position, player} = slot;

        if (
            !player ||
            typeof player.full_name !== 'string' ||
            typeof player.team !== 'string' ||
            typeof player.position !== 'string'
        ) {
            return {
                message: 'Invalid player data in roster',
                status: 400,
                variant: 'error',
            };
        }

        if (player.position !== position) {
            return {
                message: `Player position mismatch for ${player.full_name}`,
                status: 400,
                variant: 'error',
            };
        }

        if (!allowedPositionCounts[position]) {
            return {
                message: `Position ${position} is not allowed in ${round}`,
                status: 400,
                variant: 'error',
            };
        }

        usedPositionCounts[position] = (usedPositionCounts[position] || 0) + 1;
    }

    for (const pos of Object.keys(usedPositionCounts)) {
        if (usedPositionCounts[pos] > allowedPositionCounts[pos]) {
            return {
                message: `Too many players selected for position ${pos}`,
                status: 400,
                variant: 'error',
            };
        }
    }

    /* ----------------------------------
       Validate max players per team
    ---------------------------------- */
    const teamCounts = {};

    for (const slot of roster) {
        const team = slot.player.team;
        teamCounts[team] = (teamCounts[team] || 0) + 1;

        if (teamCounts[team] > roundConfig.maxPlayersPerTeam) {
            return {
                message: `Too many players selected from team ${team}`,
                status: 400,
                variant: 'error',
            };
        }
    }

    /* ----------------------------------
       Validate duplicate players
    ---------------------------------- */
    const playerKeys = roster.map(s =>
        `${s.player.full_name}|${s.player.team}|${s.player.position}`
    );

    const uniquePlayerKeys = new Set(playerKeys);

    if (uniquePlayerKeys.size !== playerKeys.length) {
        return {
            message: 'Duplicate player detected in roster',
            status: 400,
            variant: 'error',
        };
    }

    /* ----------------------------------
       Persist to database
    ---------------------------------- */
    await client.connect();
    const userPicksCollection = client.db('FantasyFootball').collection('UserPicks');

    await userPicksCollection.updateOne(
        {email: Email, round: round},
        {
            $set: {
                email: Email,
                firstName: firstName,
                lastName: lastName,
                roster,
                round,
                timestamp,
                saved: !!saved,
            },
        },
        {upsert: true}
    );

    return {
        message: 'Successfully saved picks!',
        status: 200,
        variant: 'success',
    };
}

async function getPicks(req) {
    const {Email} = await checkAdmin(req)

    await client.connect();
    const {round: currentRound} = await getGameInfo(req)
    const userPicksCollection = client.db('FantasyFootball').collection('UserPicks');

    const results = await userPicksCollection.findOne({email: Email, round: currentRound})

    return {
        roster: results?.roster,
        round: results?.round,
        saved: results?.saved,
        timestamp: results?.timestamp,
    }
}

module.exports = {
    postPicks,
    getPicks,
};
