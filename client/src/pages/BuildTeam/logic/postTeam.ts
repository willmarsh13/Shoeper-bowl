import {getURL} from "../../../Shared/getURL";
import {PlayoffRound} from "./roundRules";
import {Position} from "../../../Interfaces/Player";
import checkUnauthorized from "../../../Shared/handleCheckUnauth";

export interface PostPickPlayer {
    id: string;
    full_name: string;
    team: string;
    position: Position;
}

export interface PostPickSlot {
    slotId: string;
    position: Position;
    player: PostPickPlayer | null;
}

export interface PostTeamPayload {
    roster: PostPickSlot[];
    round: PlayoffRound;
    timestamp: string;
    saved: boolean;
}


export default async function postTeam(payload: PostTeamPayload) {

    return await fetch(`${getURL()}/api/picks`, {
        method: 'POST',
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        credentials: 'include',
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            checkUnauthorized(data.status);
            return data
        })
}