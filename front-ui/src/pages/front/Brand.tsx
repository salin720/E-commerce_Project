import {Loading, ProductSection} from "@/components"
import {useEffect, useState} from "react"
import {CatBrandData, ProductData} from "@/library/interfaces.ts"
import http from "@/http"
import { imgUrl } from "@/library/function"
import {useParams} from "react-router-dom"

export const Brand: React.FC = () => {

    const [brand, setBrand] = useState<CatBrandData>()
    const [products, setProducts] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const params = useParams()

    useEffect(() => {
        setLoading(true)
        Promise.all([
            http.get(`/brands/${params.id}`),
            http.get(`/brands/${params.id}/products`)
        ])
        .then(([{data: cData}, {data: pData}]) => {
            setBrand(cData)
            setProducts(pData)
        })
        .catch(() => {})
        .finally(() => {
            setLoading(false)
        })
    }, [params.id]);

    return loading ? <Loading /> : <div className="col-12 px-3 px-lg-4 py-4"><div className="bg-white rounded-4 shadow-sm p-4 border-soft mb-4 d-flex align-items-center gap-3">{brand?.image ? <img src={imgUrl(brand.image)} alt={brand.name} style={{width:56,height:56,objectFit:'cover',borderRadius:16}} /> : <div style={{width:56,height:56,borderRadius:16,background:'#f3f4f6'}}></div>}<div><div className="section-kicker mb-1">Brand</div><h2 className="mb-0">{brand?.name || ''}</h2></div></div><ProductSection data={products} title={`${brand?.name || ''} Products`} size="sm" /></div>
}