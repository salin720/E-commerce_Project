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

import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Navigate} from "react-router-dom";
import http from "@/http";
import {UserType} from "@/library/interfaces"
import { setUser } from "@/store";

export const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({element}) => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Only run on mount
        const token = localStorage.getItem('m3pmftoken');
        if (!user && token) {
            setLoading(true);
            http.get('/profile/details')
                .then(({data}) => {
                    setUser(data);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []); // Only run on mount

    if (loading) return null; // or a loading spinner
    if (!user) {
        return <Navigate to="/login" replace />
    }
    return <>{element}</>;
}
