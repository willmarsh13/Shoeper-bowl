import {GameInfo} from "../../Interfaces/App";
import {getURL} from "../getURL";

export const allowedPages: string[] = ['/login', '/signup', '/forgotPW']

export default async function getGameInfo(): Promise<GameInfo> {

    return await fetch(`${getURL()}/api/game/info`, {
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 401 && !allowedPages.includes(window.location.pathname)) {
                // Redirect to login or display a message
                window.location.href = "/shoeper-bowl/login";
                return {
                    round: 'WILD_CARD',
                    teams: [''],
                };
            }
            return data
        })
}