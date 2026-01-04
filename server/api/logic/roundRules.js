const ROUND_CONFIG = {
    WILD_CARD: {
        key: 'WILD_CARD',
        displayName: 'Wild Card',
        allowedPositions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'K', 'DST'],
        maxPlayersPerTeam: 1,
    },

    DIVISIONAL: {
        key: 'DIVISIONAL',
        displayName: 'Divisional Round',
        allowedPositions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'K', 'DST'],
        maxPlayersPerTeam: 1,
    },

    CONFERENCE_CHAMPIONSHIP: {
        key: 'CONFERENCE_CHAMPIONSHIP',
        displayName: 'Conference Championship',
        allowedPositions: ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'K', 'DST'],
        maxPlayersPerTeam: 2,
    },
};

module.exports = {
    ROUND_CONFIG,
}