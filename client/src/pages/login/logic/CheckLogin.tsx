import {getURL} from "../../../Shared/getURL";
import checkUnauthorized from "../../../Shared/handleCheckUnauth";


export default async function CheckLogin(username: string, password: string) {
    return await fetch(`${getURL()}/api/auth/login`, {
        body: JSON.stringify({
            username: username,
            password: password,
        }),
        method: 'POST',
        headers: {'content-type': 'application/json'},
        credentials: 'include'
    })
        .then(resp => resp.json())
}