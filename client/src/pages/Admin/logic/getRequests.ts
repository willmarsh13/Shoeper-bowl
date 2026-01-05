import {getURL} from "../../../Shared/getURL";
import checkUnauthorized from "../../../Shared/handleCheckUnauth";

export const getRequests = () => {

    return fetch(`${getURL()}/api/admin/requests`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(resp => resp.json())
        .then(data => {
            checkUnauthorized(data.status);
            return data
        })
}