const {getPlayers} = require("../services/playerService");
const {getGameInfo} = require("../Game/databaseOperations");
const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'K', 'DST'];

/**
 * Players to exclude regardless of search/filtering.
 * Matching is case-insensitive.
 */
const PLAYER_EXCLUDE_OVERRIDES = new Set([
    'michael|badgley|k|buf',
]);


const positionRank = (pos) => {
    const idx = POSITION_ORDER.indexOf(pos);
    return idx === -1 ? POSITION_ORDER.length : idx;
};

const compareNames = (a, b) => {
    const lastA = a.lastName.toLowerCase();
    const lastB = b.lastName.toLowerCase();

    if (lastA !== lastB) return lastA.localeCompare(lastB);

    const firstA = a.firstName.toLowerCase();
    const firstB = b.firstName.toLowerCase();

    return firstA.localeCompare(firstB);
};

const buildDefensePlayers = (teams) =>
    teams?.map(team => ({
        id: `DST_${team}`,
        full_name: `${team} D/ST`,
        firstName: team,
        lastName: 'D/ST',
        team,
        position: 'DST',
    }));


async function playerSearch(req, res) {
    const gameInfo = await getGameInfo();
    const playoffTeams = gameInfo.teams;

    const {
        search = '',
        page = 1,
        pageSize = 100,
        positions,
        teams: teamsQuery,
        excludePositions,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const size = Math.min(parseInt(pageSize, 10), 500);

    let players = await getPlayers();

    // Inject D/ST for each playoff team
    const defensePlayers = buildDefensePlayers(playoffTeams);
    players = players.concat(defensePlayers);

    /* ---------- Normalize inputs ---------- */

    const searchTerm = search.toLowerCase().trim();

    const positionFilter = positions
        ? Array.isArray(positions) ? positions : [positions]
        : null;

    const frontendTeams = teamsQuery
        ? Array.isArray(teamsQuery) ? teamsQuery : [teamsQuery]
        : null;

    const excludedPositions = excludePositions
        ? Array.isArray(excludePositions) ? excludePositions : [excludePositions]
        : [];

    let effectiveTeams = playoffTeams;
    if (frontendTeams) {
        effectiveTeams = playoffTeams.filter(team =>
            frontendTeams.includes(team)
        );
    }

    const buildPlayerKey = (p) =>
        `${p.firstName}|${p.lastName}|${p.position}|${p.team}`.toLowerCase();

    /* ---------- Filtering BEFORE pagination ---------- */

    players = players.filter((p) => {
        // ---------- Override exclusion ----------
        if (PLAYER_EXCLUDE_OVERRIDES.has(buildPlayerKey(p))) {
            return false;
        }

        // ---------- Existing filters ----------
        if (!effectiveTeams.includes(p.team)) return false;
        if (excludedPositions.includes(p.position)) return false;
        if (positionFilter && !positionFilter.includes(p.position)) return false;

        if (searchTerm) {
            const full = p.full_name.toLowerCase();
            const first = p.firstName.toLowerCase();
            const last = p.lastName.toLowerCase();

            return (
                full.includes(searchTerm) ||
                last.includes(searchTerm) ||
                first.includes(searchTerm)
            );
        }

        return true;
    });


    /* ---------- Relevance sort ---------- */

    if (searchTerm) {
        players.sort((a, b) => {
            const rank = (p) => {
                const full = p.full_name.toLowerCase();
                const first = p.firstName.toLowerCase();
                const last = p.lastName.toLowerCase();

                if (full === searchTerm) return 0;
                if (last === searchTerm) return 1;
                if (first === searchTerm) return 2;
                if (full.startsWith(searchTerm)) return 3;
                if (last.startsWith(searchTerm)) return 4;
                if (first.startsWith(searchTerm)) return 5;
                return 6;
            };

            const relevanceDiff = rank(a) - rank(b);
            if (relevanceDiff !== 0) return relevanceDiff;

            players.sort((a, b) => {
                // 1. Position
                const posDiff = positionRank(a.position) - positionRank(b.position);
                if (posDiff !== 0) return posDiff;

                // 2. Last name, then first name
                return compareNames(a, b);
            });

        });
    } else {
        // No search term → pure position sort
        players.sort((a, b) => {
            // 1. Position
            const posDiff = positionRank(a.position) - positionRank(b.position);
            if (posDiff !== 0) return posDiff;

            // 2. Last name, then first name
            return compareNames(a, b);
        });

    }


    /* ---------- Pagination ---------- */

    const total = players.length;
    const start = (pageNum - 1) * size;
    const end = start + size;

    return {
        page: pageNum,
        pageSize: size,
        total,
        results: players.slice(start, end),
    };
}

module.exports = playerSearch;
