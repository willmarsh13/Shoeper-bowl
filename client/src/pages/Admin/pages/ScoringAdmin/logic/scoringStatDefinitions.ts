export type ScoringCategory = 'offense' | 'dst' | 'kicker';

export interface StatDefinition {
    key: string;
    label: string;
}

export const STAT_DEFINITIONS: Record<ScoringCategory, StatDefinition[]> = {
    offense: [
        { key: 'passYards', label: 'Pass Yds' },
        { key: 'passTD', label: 'Pass TD' },
        { key: 'passInt', label: 'INT Thrown' },
        { key: 'pass2pt', label: '2PT Pass' },
        { key: 'rushYards', label: 'Rush Yds' },
        { key: 'rushTD', label: 'Rush TD' },
        { key: 'rush2pt', label: '2PT Rush' },
        { key: 'recYards', label: 'Rec Yds' },
        { key: 'receptions', label: 'Receptions' },
        { key: 'recTD', label: 'Rec TD' },
        { key: 'rec2pt', label: '2PT Rec' },
        { key: 'fumbleLost', label: 'Fumbles Lost' },
    ],

    dst: [
        { key: 'kickReturnTD', label: 'Kick Ret TD' },
        { key: 'puntReturnTD', label: 'Punt Ret TD' },
        { key: 'intReturnTD', label: 'INT Ret TD' },
        { key: 'blockedReturnTD', label: 'Blk Kick TD' },
        { key: 'twoPtReturn', label: '2PT Ret' },
        { key: 'onePtSafety', label: '1PT Safety' },
        { key: 'sacks', label: 'Sacks' },
        { key: 'blockedKick', label: 'Blk Kick' },
        { key: 'interceptions', label: 'INT' },
        { key: 'fumbleRecovery', label: 'FR' },
        { key: 'forcedFumble', label: 'FF' },
        { key: 'safeties', label: 'Safeties' },
        { key: 'pointsAllowed', label: 'Pts Allowed' },
        { key: 'yardsAllowed', label: 'Yds Allowed' },
    ],

    kicker: [
        { key: 'patMade', label: 'PAT Made' },
        { key: 'patMiss', label: 'PAT Miss' },
        { key: 'fgMiss', label: 'FG Miss' },
        { key: 'fg39', label: 'FG 1–39' },
        { key: 'fg49', label: 'FG 40–49' },
        { key: 'fg50', label: 'FG 50+' },
    ],
};
