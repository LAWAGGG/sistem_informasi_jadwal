import { Navigate } from "react-router-dom";
import { getToken } from "../utils/utils";

export default function RedirectRoute({children}){
    const token = getToken()

    if(token){
        return <Navigate to='/dashboard' replace/>
    }

    return children
}