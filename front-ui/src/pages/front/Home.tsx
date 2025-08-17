import slider1 from "/slider-1.jpg"
import slider2 from "/slider-2.jpg"
import slider3 from "/slider-3.jpg"

import {Carousel} from "react-bootstrap"
import {ProductData} from "@/library/interfaces.ts";
import {useEffect, useState} from "react";
import http from "@/http"
import {Loading, ProductSection} from "@/components";

export const Home:React.FC = () => {
    const [featured, setFeatured] = useState<ProductData[]>([])
    const [latest, setLatest] = useState<ProductData[]>([])
    const [topSelling, setTopSelling] = useState<ProductData[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        setLoading(true);

        Promise.all([
            http.get('/products/featured'),
            http.get('/products/latest'),
            http.get('/products/top-selling')
        ])
            // .then(([fRes, lRes, tRes]) => {
            //     setFeatured(fRes.data.featured || []);
            //     setLatest(lRes.data.latest || []);
            //     setTopSelling(tRes.data.topSelling || []);
            // })

            // .then(([fRes, lRes, tRes]) => {
            //                 setFeatured(fRes.data?.data || [])
            //                 setLatest(lRes.data?.data || [])
            //                 setTopSelling(tRes.data?.data || [])
            //                 setLoading(false)
            // })

            .then(([fRes, lRes, tRes]) => {
                setFeatured(fRes.data?.featured || fRes.data?.data || []);
                setLatest(lRes.data?.latest || lRes.data?.data || []);
                setTopSelling(tRes.data?.topSelling || tRes.data?.data || []);
            })


            .catch(() => {})
            .finally(() => {
                setLoading(false);
            });
    }, []);


    return loading ? <Loading /> : <>
        <div className="col-12">
            <main className="row">

                <div className="col-12 px-0">
                    <Carousel className="w-100">
                        <Carousel.Item>
                            <img src={slider1} className="w-100" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={slider2} className="w-100" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={slider3} className="w-100" />
                        </Carousel.Item>
                    </Carousel>
                </div>

                <ProductSection data={featured} title="Featured Products" />
                <div className="col-12">
                    <hr/>
                </div>

                <ProductSection data={latest} title="Latest Products" />
                <div className="col-12">
                    <hr/>
                </div>

                <ProductSection data={topSelling} title="Top Sellings" />
                <div className="col-12">
                    <hr/>
                </div>

                <div className="col-12 py-3 bg-light d-sm-block d-none">
                    <div className="row">
                        <div className="col-lg-3 col ms-auto large-holder">
                            <div className="row">
                                <div className="col-auto ms-auto large-icon">
                                    <i className="fas fa-money-bill"></i>
                                </div>
                                <div className="col-auto me-auto large-text">
                                    Best Price
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col large-holder">
                            <div className="row">
                                <div className="col-auto ms-auto large-icon">
                                    <i className="fas fa-truck-moving"></i>
                                </div>
                                <div className="col-auto me-auto large-text">
                                    Fast Delivery
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3 col me-auto large-holder">
                            <div className="row">
                                <div className="col-auto ms-auto large-icon">
                                    <i className="fas fa-check"></i>
                                </div>
                                <div className="col-auto me-auto large-text">
                                    Genuine Products
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </>
}