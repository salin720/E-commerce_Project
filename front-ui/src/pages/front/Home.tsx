import slider1 from "/slider-1.jpg"
import slider2 from "/slider-2.jpg"
import slider3 from "/slider-3.jpg"
import {Carousel, Col, Row} from "react-bootstrap"
import {ProductData, UserType} from "@/library/interfaces.ts"
import {useEffect, useState} from "react"
import http from "@/http"
import {Loading, ProductSection} from "@/components"
import { useSelector } from "react-redux"

export const Home:React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const [featured, setFeatured] = useState<ProductData[]>([])
    const [latest, setLatest] = useState<ProductData[]>([])
    const [topSelling, setTopSelling] = useState<ProductData[]>([])
    const [recommended, setRecommended] = useState<ProductData[]>([])
    const [recentlyViewed, setRecentlyViewed] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true)
        const requests: Promise<any>[] = [
            http.get('/products/featured'),
            http.get('/products/latest'),
            http.get('/recommendations/trending'),
        ]
        if (user) {
            requests.push(http.get('/recommendations/personalized'))
            requests.push(http.get('/recommendations/recently-viewed'))
        }
        Promise.all(requests)
            .then((responses: any[]) => {
                const [fRes, lRes, tRes, pRes, rRes] = responses
                setFeatured(fRes.data?.featured || [])
                setLatest(lRes.data?.latest || [])
                setTopSelling(tRes.data?.products || tRes.data?.topSelling || [])
                setRecommended(pRes?.data?.products || [])
                setRecentlyViewed(rRes?.data?.products || [])
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [user])

    return loading ? <Loading /> : <div className="col-12">
        <main className="row gx-0">
            <div className="col-12 hero-shell px-0">
                <Carousel className="hero-carousel">
                    <Carousel.Item><img src={slider1} className="w-100 hero-banner" /></Carousel.Item>
                    <Carousel.Item><img src={slider2} className="w-100 hero-banner" /></Carousel.Item>
                    <Carousel.Item><img src={slider3} className="w-100 hero-banner" /></Carousel.Item>
                </Carousel>
            </div>

            <div className="col-12 px-3 px-lg-4 py-4">
                <Row className="g-3 mb-2">
                    <Col md={4}><div className="mini-feature-card"><i className="fas fa-shield-alt"></i><div><h6>Trusted shopping</h6><p>Safe checkout, genuine products and verified sellers.</p></div></div></Col>
                    <Col md={4}><div className="mini-feature-card"><i className="fas fa-bolt"></i><div><h6>Fast discovery</h6><p>Dynamic search, smart recommendations and trending picks.</p></div></div></Col>
                    <Col md={4}><div className="mini-feature-card"><i className="fas fa-truck"></i><div><h6>Delivery visibility</h6><p>Track orders, payment status and shipping progress clearly.</p></div></div></Col>
                </Row>

                {user && <ProductSection data={recommended} title="Recommended For You" emptyText="Start browsing products and your personal recommendations will appear here." />}
                {user && <ProductSection data={recentlyViewed} title="Because You Viewed" size="sm" emptyText="Products you open will appear here for quick access." />}
                <ProductSection data={featured} title="Featured Products" />
                <ProductSection data={latest} title="Latest Arrivals" />
                <ProductSection data={topSelling} title="Trending Now" />
            </div>
        </main>
    </div>
}
