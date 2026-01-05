import {getURL} from "../../../Shared/getURL";

export async function SignUserUp(firstName: string, lastName: string, email: string, password: string) {

    return await fetch(`${getURL()}/api/auth/signup`, {
        method: 'POST',
        body: JSON.stringify({
            firstName: firstName,
            lastName: lastName,
            username: email,
            password: password,
        }),
        headers: {
            'Content-type': 'application/json'
        },
        credentials: 'include',
    })
        .then(resp => resp.json())
}