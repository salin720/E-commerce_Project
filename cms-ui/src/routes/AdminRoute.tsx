// import {UserType} from "@/library/interfaces.ts";
// import {useSelector} from "react-redux";
// import {useNavigate} from "react-router-dom";
// import {useEffect} from "react";
//
// export const AdminRoute: React.FC<{element: React.ReactNode}> = ({element}) => {
//     const user: UserType = useSelector((state: any) => state.user.value)
//
//     const navigate = useNavigate()
//
//     useEffect(() => {
//         if(user?.role != 'admin'){
//             navigate("/")
//         }
//     }, [user]);
//
//     return element
// }

import {useSelector} from "react-redux"
import {Navigate} from "react-router-dom"
import {UserType} from "@/library/interfaces"

export const AdminRoute: React.FC<{ element: React.ReactNode }> = ({element}) => {
    const user: UserType = useSelector((state: any) => state.user.value)

    console.log("AdminRoute user:", user)

    if (!user || user.role?.toLowerCase() !== 'admin') {
        return <Navigate to="/" replace />
    }

    return <>{element}</>
}
