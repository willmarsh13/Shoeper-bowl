import {PlayoffRound} from "../pages/BuildTeam/logic/roundRules";


export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'D/ST';

export interface Player {
    id: string;
    full_name: string;
    firstName: string;
    lastName: string;
    position: Position;
    team: string; // team abbreviation uppercase
}

export interface ProfilePick {
    id: string;
    round: PlayoffRound;
    position: Position;
    player: Player;
}

export interface SavedPick {
    slotId: string;
    position: string;
    player: Player;
    round: PlayoffRound;
}
