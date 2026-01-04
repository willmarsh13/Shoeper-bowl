import {getURL} from "../../../Shared/getURL";


export default async function CheckLogin(username: string, password: string) {
    const resp = await fetch(`${getURL()}/api/auth/login`, {
        body: JSON.stringify({
            username: username,
            password: password,
        }),
        method: 'POST',
        headers: {'content-type': 'application/json'},
        credentials: 'include'
    });
    return await resp.json();
}