import {Loading, ProductSection} from "@/components"
import {useEffect, useState} from "react"
import {ProductData, UserType} from "@/library/interfaces.ts"
import http from "@/http"
import {useSearchParams} from "react-router-dom"
import { useSelector } from "react-redux"

export const Search: React.FC = () => {
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [query] = useSearchParams()
    const user: UserType = useSelector((state: any) => state.user.value)
    const term = query.get('term') || ''

    useEffect(() => {
        setLoading(true)
        http.get(`/products/search`, { params: { term } })
            .then(({data}) => {
                const items = data.product || data.products || []
                setProducts(items)
                if (user && term.trim()) {
                    http.post('/activity/search', { query: term, resultCount: items.length }).catch(() => {})
                }
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [term, user])

    return loading ? <Loading /> : <div className="col-12 px-3 px-lg-4 py-4">
        <ProductSection data={products} title={`Search Results for "${term}"`} size="sm" emptyText="No matching products found. Try a different keyword." />
    </div>
}
