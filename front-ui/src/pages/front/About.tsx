import React from "react"

export const About: React.FC = () => {
    return (
        <div className="col-12 px-3 px-lg-4 py-4">
            <div className="bg-white rounded-4 shadow-sm border-soft p-4 p-lg-5">
                <div className="section-heading-centered mb-4">
                    <div className="section-kicker">About Quick Cart</div>
                    <h2>Shopping made simple, clear and reliable</h2>
                </div>
                <div className="row g-4">
                    <div className="col-lg-7">
                        <p>Quick Cart is a modern e-commerce platform built to help customers discover products faster, compare better deals, and order with confidence. Our website combines clean product browsing, smart search suggestions, clear order tracking, and secure payment options in one place.</p>
                        <p>We focus on practical shopping features such as flash sale products, recommended items based on activity, top selling products, latest arrivals, detailed product pages, and profile-based order management.</p>
                        <p>For customers, Quick Cart is designed to be easy to use. For admins, it provides a clear CMS dashboard to manage products, customers, categories, brands, orders, and overall analytics.</p>
                    </div>
                    <div className="col-lg-5">
                        <div className="about-info-card h-100">
                            <h5 className="mb-3">Why users choose Quick Cart</h5>
                            <ul className="mb-0 ps-3">
                                <li>Fast product search and suggestions</li>
                                <li>Flash sale and top selling sections</li>
                                <li>Wishlist, cart, and account features</li>
                                <li>eSewa and Cash on Delivery support</li>
                                <li>Order tracking and receipt visibility</li>
                                <li>Admin dashboard with sales analytics</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
