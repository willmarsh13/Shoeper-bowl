const { STAT_DEFINITIONS } = require("../Scores/scoringStats");

function calculateEntityScore(category, rawStats = {}) {
    const definitions = STAT_DEFINITIONS[category] || [];

    let totalPoints = 0;
    const breakdown = {};

    for (const def of definitions) {
        const statValue = rawStats[def.name];

        if (statValue === undefined || statValue === null) continue;

        const ruleResult = def.getPoints(statValue);

        let statPoints = 0;

        /*
           If getPoints returns a number, that number is the final score
           (used for bucketed stats like pointsAllowed, yardsAllowed)
        */
        if (typeof ruleResult === "number") {
            statPoints = ruleResult;
        }

        breakdown[def.name] = {
            value: statValue,
            points: statPoints,
        };

        totalPoints += statPoints;
    }

    return {
        totalPoints,
        breakdown,
    };
}

module.exports = {
    calculateEntityScore,
};
