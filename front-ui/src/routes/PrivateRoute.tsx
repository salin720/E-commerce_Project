import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import http from "@/http";
import { UserType } from "@/library/interfaces";
import { setUser } from "@/store";
import { fromStorage } from "@/library/function";

export const PrivateRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [loading, setLoading] = useState(true)
    const dispatch = useDispatch()

    useEffect(() => {
        const token = fromStorage('m3pmftoken')
        if (!user && token) {
            setLoading(true)
            http.get('/profile/details')
                .then(({ data }) => {
                    dispatch(setUser(data))
                })
                .catch(() => {})
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [user, dispatch])

    if (loading) return null
    if (!user) return <Navigate to="/login" replace />
    return <>{element}</>
}
