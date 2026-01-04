import { Player } from '../../../Interfaces/Player';
import { getURL } from '../../../Shared/getURL';

export interface GetPlayersParams {
    search?: string;
    page?: number;
    pageSize?: number;
    positions?: string[];
    teams?: string[];
}

export interface GetPlayersResponse {
    page: number;
    pageSize: number;
    total: number;
    results: Player[];
}

export async function getPlayers(
    params: GetPlayersParams = {},
    delayMs = 200
): Promise<GetPlayersResponse> {
    if (delayMs) {
        await new Promise(res => setTimeout(res, delayMs));
    }

    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (!value) return;
        if (Array.isArray(value)) {
            value.forEach(v => query.append(key, v));
        } else {
            query.append(key, String(value));
        }
    });

    const res = await fetch(`${getURL()}/api/playerSearch?${query}`, {
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        credentials: 'include'
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch players (${res.status})`);
    }

    return res.json();
}
