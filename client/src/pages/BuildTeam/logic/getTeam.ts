import {getURL} from "../../../Shared/getURL"

export default async function getTeam() {

    return await fetch(`${getURL()}/api/picks`, {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        credentials: 'include',
    })
        .then(res => res.json())
}