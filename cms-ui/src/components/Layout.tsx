import "bootstrap/dist/css/bootstrap.min.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "react-confirm-alert/src/react-confirm-alert.css"
import "react-toastify/dist/ReactToastify.css"
import "@/styles/style.css"
import {AppNav} from "./AppNav"
import {UserType} from "@/library/interfaces"
import {useDispatch, useSelector} from "react-redux"
import {useEffect, useState} from "react"
import {fromStorage, removeStorage} from "@/library/function"
import http from "@/http"
import {setUser} from "@/store"
import {Loading} from "./Loading"
import { Outlet } from "react-router-dom"

export const Layout: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [loading, setLoading] = useState<boolean>(true)
    const dispatch = useDispatch()
    useEffect(() => {
        if (!user) {
            const token = fromStorage('m3pmctoken')
            if (token) {
                http.get('/profile/details').then(({ data }) => dispatch(setUser(data))).catch(() => removeStorage('m3pmctoken')).finally(() => setLoading(false))
            } else setLoading(false)
        } else setLoading(false)
    }, [user, dispatch])
    return loading ? <Loading /> : <div className="d-flex admin-shell"><AppNav /><main className="admin-main"><Outlet /></main></div>
}
