import {getURL} from "../../../Shared/getURL"
import checkUnauthorized from "../../../Shared/handleCheckUnauth";

export default async function getTeam() {

    return await fetch(`${getURL()}/api/picks`, {
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
        },
        credentials: 'include',
    })
        .then(res => res.json())
        .then(data => {
            checkUnauthorized(data.status);
            return data
        })
}