import {Carousel} from "react-bootstrap"
import {ProductData, UserType} from "@/library/interfaces.ts"
import {useEffect, useState} from "react"
import http from "@/http"
import {Loading, ProductSection} from "@/components"
import { useSelector } from "react-redux"

const HERO_SLIDES = [
    { className: "hero-clean-slide hero-clean-1" },
    { className: "hero-clean-slide hero-clean-2" },
    { className: "hero-clean-slide hero-clean-3" },
]

export const Home:React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [flashSale, setFlashSale] = useState<ProductData[]>([])
    const [latest, setLatest] = useState<ProductData[]>([])
    const [topSelling, setTopSelling] = useState<ProductData[]>([])
    const [recommended, setRecommended] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)
        const requests: Promise<any>[] = [
            http.get('/products/featured'),
            http.get('/products/latest'),
            http.get('/recommendations/trending'),
        ]
        if (user) requests.push(http.get('/recommendations/personalized'))
        Promise.all(requests)
            .then((responses: any[]) => {
                const [fRes, lRes, tRes, pRes] = responses
                setFlashSale((fRes.data?.featured || []).sort((a: any, b: any) => {
                    const ad = a?.price > 0 && a?.discountedPrice > 0 ? ((a.price - a.discountedPrice) / a.price) : 0
                    const bd = b?.price > 0 && b?.discountedPrice > 0 ? ((b.price - b.discountedPrice) / b.price) : 0
                    return bd - ad
                }))
                setLatest(lRes.data?.latest || [])
                setTopSelling(tRes.data?.products || tRes.data?.topSelling || [])
                setRecommended(pRes?.data?.products || [])
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [user])

    return loading ? <Loading /> : <div className="col-12">
        <main className="row gx-0">
            <div className="col-12 px-3 px-lg-4 pt-3">
                <div className="hero-shell hero-shell-clean rounded-4 overflow-hidden border-soft shadow-sm bg-white">
                    <Carousel className="hero-carousel hero-carousel-clean" indicators controls={HERO_SLIDES.length > 1} interval={3500}>
                        {HERO_SLIDES.map((slide, index) => (
                            <Carousel.Item key={index}>
                                <div className={slide.className} aria-label={`Quick Cart banner ${index + 1}`}>
                                    <div className="hero-clean-glow"></div>
                                    <div className="hero-clean-badges">
                                        <span>Trusted shopping</span>
                                        <span>Clear pricing</span>
                                        <span>Fast delivery support</span>
                                    </div>
                                </div>
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </div>

            <div className="col-12 px-3 px-lg-4 py-4">
                <ProductSection data={flashSale} title="Flash Sale" />
                <ProductSection data={recommended} title="Recommended Product" emptyText="Start browsing products and your personal recommendations will appear here." />
                <ProductSection data={topSelling} title="Top Selling" />
                <ProductSection data={latest} title="Latest Product" />
            </div>
        </main>
    </div>
}
