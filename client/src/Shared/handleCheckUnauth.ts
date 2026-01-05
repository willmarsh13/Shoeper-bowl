import {allowedPages} from "./logic/getGameInfo";


export default function checkUnauthorized(status: number) {
    if (status === 401 && !allowedPages.includes(window.location.pathname)) {
        // Redirect to login or display a message
        window.location.href = "/shoeper-bowl/login";
        return;
    }
    return;
}