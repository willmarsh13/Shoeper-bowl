import {getURL} from "../../../../Shared/getURL";

async function requestPasswordReset(email: string) {
    return await fetch(`${getURL()}/api/auth/forgot-password`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email}),
        credentials: 'include',
    })
        .then(res => res.json())
}