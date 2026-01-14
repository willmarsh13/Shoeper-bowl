const STAT_DEFINITIONS = {
    offense: [
        {
            name: 'passYards',
            getPoints: (num) => num * 0.04,
        },
        {
            name: 'passTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'passInt',
            getPoints: (num) => num * -2,
        },
        {
            name: 'pass2pt',
            getPoints: (num) => num * 2,
        },
        {
            name: 'rushYards',
            getPoints: (num) => num * 0.1,
        },
        {
            name: 'rushTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'rush2pt',
            getPoints: (num) => num * 2,
        },
        {
            name: 'recYards',
            getPoints: (num) => num * 0.1,
        },
        {
            name: 'receptions',
            getPoints: (num) => num * 1,
        },
        {
            name: 'recTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'rec2pt',
            getPoints: (num) => num * 2,
        },
        {
            name: 'fumbleLost',
            getPoints: (num) => num * -2,
        },
    ],
    dst: [
        {
            name: 'kickReturnTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'puntReturnTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'intReturnTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'fumbleReturnTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'blockedReturnTD',
            getPoints: (num) => num * 6,
        },
        {
            name: 'twoPtReturn',
            getPoints: (num) => num * 2,
        },
        {
            name: 'onePtSafety',
            getPoints: (num) => num * 1,
        },
        {
            name: 'sacks',
            getPoints: (num) => num * 2,
        },
        {
            name: 'blockedKick',
            getPoints: (num) => num * 2,
        },
        {
            name: 'interceptions',
            getPoints: (num) => num * 2,
        },
        {
            name: 'fumbleRecovery',
            getPoints: (num) => num * 2,
        },
        {
            name: 'forcedFumble',
            getPoints: (num) => num * 1,
        },
        {
            name: 'safeties',
            getPoints: (num) => num * 2,
        },
        {
            name: 'pointsAllowed',
            getPoints: (pointsAllowed) => {
                if (pointsAllowed === 0) return 5;
                if (pointsAllowed >= 1 && pointsAllowed <= 6) return 4;
                if (pointsAllowed >= 7 && pointsAllowed <= 13) return 3;
                if (pointsAllowed >= 14 && pointsAllowed <= 17) return 2;
                if (pointsAllowed >= 18 && pointsAllowed <= 21) return 1;
                if (pointsAllowed >= 22 && pointsAllowed <= 27) return 0;
                if (pointsAllowed >= 28 && pointsAllowed <= 34) return -1;
                if (pointsAllowed >= 35 && pointsAllowed <= 45) return -3;
                if (pointsAllowed >= 46) return -5;
            },
        },
        {
            name: 'yardsAllowed',
            getPoints: (yardsAllowed) => {
                if (yardsAllowed < 100) return 5;
                if (yardsAllowed >= 100 && yardsAllowed <= 199) return 3;
                if (yardsAllowed >= 200 && yardsAllowed <= 299) return 1;
                if (yardsAllowed >= 300 && yardsAllowed <= 349) return 0;
                if (yardsAllowed >= 350 && yardsAllowed <= 399) return -1;
                if (yardsAllowed >= 400 && yardsAllowed <= 449) return -3;
                if (yardsAllowed >= 450 && yardsAllowed <= 499) return -5;
                if (yardsAllowed >= 500 && yardsAllowed <= 549) return -6;
                if (yardsAllowed >= 550) return -7;
            },
        },
    ],
    kicker: [
        {
            name: 'patMade',
            getPoints: (num) => num * 1,
        },
        {
            name: 'patMiss',
            getPoints: (num) => num * -1,
        },
        {
            name: 'fgMiss',
            getPoints: (num) => num * -2,
        },
        {
            name: 'fg39',
            getPoints: (num) => num * 3,
        },
        {
            name: 'fg49',
            getPoints: (num) => num * 4,
        },
        {
            name: 'fg50',
            getPoints: (num) => num * 5,
        },
    ],
};

const ALLOWED_STAT_KEYS = new Set(
    Object.values(STAT_DEFINITIONS).flat().map(doc => doc.name)
);

module.exports = {
    ALLOWED_STAT_KEYS,
    STAT_DEFINITIONS,
};
