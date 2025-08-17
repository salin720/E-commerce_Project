import { Outlet } from "react-router-dom"
import { AppNav } from "./AppNav"
import { UserType } from "@/library/interfaces"
import { useDispatch, useSelector } from "react-redux"
import { useEffect, useState } from "react"
import { fromStorage, removeStorage } from "@/library/function"
import http from "@/http"
import { setUser } from "@/store"
import { Loading } from "./Loading"

export const Layout: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [loading, setLoading] = useState<boolean>(true)

    const dispatch = useDispatch()

    useEffect(() => {
        setLoading(true)
        if (!user) {
            const token = fromStorage("m3pmctoken")

            if (token) {
                http
                    .get("/profile/details")
                    .then(({ data }) => {
                        dispatch(setUser(data))
                    })
                    .catch(() => {
                        removeStorage("m3pmctoken")
                    })
                    .finally(() => setLoading(false))
            } else {
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [user])

    if (loading) return <Loading />

    return (
        <div>
            <AppNav />
            <main>
                <Outlet />
            </main>
        </div>
    )
}
