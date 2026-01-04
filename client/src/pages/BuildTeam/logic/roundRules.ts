import {Player} from "../../../Interfaces/Player";

export type PlayoffRound =
    | 'WILD_CARD'
    | 'DIVISIONAL'
    | 'CONFERENCE_CHAMPIONSHIP';

export interface RoundConfig {
    key: PlayoffRound;
    displayName: string;
    allowedPositions: string[];
    maxPlayersPerTeam: number;
}

export const ROUND_CONFIG: Record<PlayoffRound, RoundConfig> = {
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

export const deriveAllowedTeams = (
    aliveTeams: string[],
    selectedPlayers: Player[],
    roundConfig: RoundConfig
): string[] => {
    const counts = selectedPlayers.reduce<Record<string, number>>((acc, p) => {
        acc[p.team] = (acc[p.team] || 0) + 1;
        return acc;
    }, {});

    return aliveTeams.filter(team => {
        const used = counts[team] ?? 0;
        return used < roundConfig.maxPlayersPerTeam;
    });
};
