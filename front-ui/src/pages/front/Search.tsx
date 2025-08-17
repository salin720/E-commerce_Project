import {Loading, ProductSection} from "@/components"
import {useEffect, useState} from "react"
import {ProductData} from "@/library/interfaces.ts"
import http from "@/http"
import {useSearchParams} from "react-router-dom"

export const Search: React.FC = () => {
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [query] = useSearchParams()

    useEffect(() => {
        setLoading(true)

        http.get(`/products/search`, {
            params: {
                term: query.get('term')
            }
        })
        .then(({data}) => {
            setProducts(data.product)
        })
        .catch(() => {})
        .finally(() => {setLoading(false)})
    }, [query.get('term')])

    return loading ? <Loading /> : <>
        <ProductSection data = {products} title={'Search'} size="sm" />
    </>
}