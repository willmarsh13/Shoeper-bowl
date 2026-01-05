import {getURL} from "../../../../Shared/getURL";

async function resetPassword(token: string, newPassword: string) {
    return await fetch(`${getURL()}/api/auth/reset-password`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            token,
            newPassword,
        }),
        credentials: 'include',
    })
        .then(res => res.json())
}
