import axios from "axios"
import {toast} from "react-toastify"
import {fromStorage} from "@/library/function"

const http = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
})

//middlewares
http.interceptors.response.use(response => {
    if(response?.data?.message) {
        toast.success(response.data.message)
    }
    return response
}, error => {
    if(error?.response?.data?.message) {
        toast.error(error.response.data.message)
    }

    return Promise.reject(error)
})

http.interceptors.request.use(config =>{
    const token = fromStorage('m3pmctoken')

    if(token){
        config.headers.setAuthorization(`Bearer ${token}`)
    }

    return config
})
export default http