const STAT_DEFINITIONS = {
    offense: [
        'passYards',
        'passTD',
        'passInt',
        'pass2pt',
        'rushYards',
        'rushTD',
        'rush2pt',
        'recYards',
        'receptions',
        'recTD',
        'rec2pt',
        'fumbleLost',
    ],
    dst: [
        'kickReturnTD',
        'puntReturnTD',
        'intReturnTD',
        'blockedReturnTD',
        'twoPtReturn',
        'onePtSafety',
        'sacks',
        'blockedKick',
        'interceptions',
        'fumbleRecovery',
        'forcedFumble',
        'safeties',
        'pointsAllowed',
        'yardsAllowed',
    ],
    kicker: [
        'patMade',
        'patMiss',
        'fgMiss',
        'fg39',
        'fg49',
        'fg50',
    ],
};

const ALLOWED_STAT_KEYS = new Set(
    Object.values(STAT_DEFINITIONS).flat()
);

module.exports = {
    ALLOWED_STAT_KEYS,
};
