import {getURL} from "../../../Shared/getURL";
import checkUnauthorized from "../../../Shared/handleCheckUnauth";

// Define a type for the user object you send
export interface RequestUser {
    id: string;          // or whatever fields you need
    firstName: string;
    lastName: string;
    Email: string;
    // add any other fields used by the API
}

// Define the shape of the API response
export interface UpdateRequestResponse {
    message?: string;
    variant?: 'success' | 'error' | 'info' | 'warning';
}

export async function UpdateRequest(
    user: RequestUser,
    isApproved: boolean
): Promise<UpdateRequestResponse> {
    return await fetch(`${getURL()}/api/admin/requests/update`, {
        method: 'POST',
        body: JSON.stringify({user, isApproved}),
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
        .then(resp => resp.json())
        .then(data => {
            checkUnauthorized(data.status);
            return data
        })
}
