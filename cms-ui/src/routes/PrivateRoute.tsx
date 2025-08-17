// import {UserType} from "@/library/interfaces.ts";
// import {useSelector} from "react-redux";
// import {useNavigate} from "react-router-dom";
// import {useEffect} from "react";
//
// export const PrivateRoute: React.FC<{element: React.ReactNode}> = ({element}) => {
//     const user: UserType = useSelector((state: any) => state.user.value)
//
//     const navigate = useNavigate()
//
//     useEffect(() => {
//         if(!user){
//             navigate("/login")
//         }
//     }, [user]);
//
//     return element
// }

import {useSelector} from "react-redux"
import {Navigate} from "react-router-dom"
import {UserType} from "@/library/interfaces"

export const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({element}) => {
    const user: UserType = useSelector((state: any) => state.user.value)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return <>{element}</>
}
