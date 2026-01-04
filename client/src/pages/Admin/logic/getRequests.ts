import {getURL} from "../../../Shared/getURL";

export const getRequests = () => {

    return fetch(`${getURL()}/api/admin/requests`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(resp => resp.json())
}