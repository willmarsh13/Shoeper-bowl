import {getURL} from "./getURL";

export default async function logout() {

    await fetch(`${getURL()}/api/auth/logout`, {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        credentials: 'include'
    })
        .then(() => window.location.href = "/shoeper-bowl/login")
}