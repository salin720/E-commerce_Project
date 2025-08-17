import dayjs from 'dayjs'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import RelativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(LocalizedFormat)
dayjs.extend(RelativeTime)

export const inStorage = (key: string, value: string, remember: boolean = false) => {
    remember ? localStorage.setItem(key, value) : sessionStorage.setItem(key, value)
}

export const fromStorage = (key: string): string|null => {
    return localStorage.getItem(key) || sessionStorage.getItem(key)
}

export const removeStorage = (key: string) => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
}

export const dtFormat = (dt: string, format: string = 'lll'): string => {
    return dayjs(dt).format(format)
}

export const dtDiff = (dt: string) => {
    return dayjs(dt).fromNow()
}

export const imgUrl = (filename: string) => {
    return `${import.meta.env.VITE_API_URL}/image/${filename}`
}