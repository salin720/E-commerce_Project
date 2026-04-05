import React from "react"

export const About: React.FC = () => {
    return (
        <div className="col-12 px-3 px-lg-4 py-4 pb-5">
            <div className="about-page-shell bg-white rounded-4 shadow-sm border-soft p-4 p-lg-5">
                <div className="section-heading-centered mb-4 mb-lg-5">
                    <div className="section-kicker">About Quick Cart</div>
                    <h2>Modern shopping with trust, clarity, and dependable support</h2>
                    <p className="text-muted mb-0">Quick Cart is designed to make product discovery easier, order tracking clearer, and online payments safer for every customer.</p>
                </div>

                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-7">
                        <div className="about-info-card h-100 about-balanced-card">
                            <h5 className="mb-3">Why Quick Cart stands out</h5>
                            <p>Quick Cart is a user-friendly e-commerce platform built to help customers browse confidently, compare products clearly, and complete orders smoothly. From featured products to detailed product insights, every part of the interface is designed to feel simple, fast, and practical.</p>
                            <p>Our website combines secure checkout, same-category comparison, order tracking, payment monitoring, and helpful rating insights in one place. Customers can quickly understand product value, review pricing trends, and choose the option that fits them best.</p>
                            <p>On the management side, Quick Cart supports a structured CMS panel for products, orders, customers, reviews, and payment records. This makes the system not only attractive for users, but also efficient for administrators managing a real online marketplace.</p>
                            <div className="about-feature-grid mt-4">
                                <div className="about-feature-pill"><i className="fa-solid fa-shield-heart"></i><span>Secure eSewa & COD checkout</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-chart-line"></i><span>Clear score and price insights</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-truck-fast"></i><span>Simple order tracking flow</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-headset"></i><span>Responsive customer support</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-5 d-flex flex-column gap-4">
                        <div className="about-info-card about-balanced-card flex-grow-1">
                            <h5 className="mb-3">Customer Benefits</h5>
                            <ul className="mb-0 ps-3 about-list-clean">
                                <li>Fast product browsing with clean card layout</li>
                                <li>Transparent value score and price movement indicator</li>
                                <li>Wishlist, cart, profile orders, and payment receipt support</li>
                                <li>Same-category comparison for better buying decisions</li>
                                <li>Simple and professional shopping experience</li>
                            </ul>
                        </div>
                        <div className="about-contact-card about-balanced-card">
                            <h5 className="mb-3">Support & Contact</h5>
                            <div className="d-flex flex-column gap-2 text-muted">
                                <span><i className="fa-solid fa-phone me-2 text-dark"></i>+977-9765220864</span>
                                <span><i className="fa-solid fa-envelope me-2 text-dark"></i>quickcart@gmail.com</span>
                                <span><i className="fa-solid fa-location-dot me-2 text-dark"></i>Kathmandu, Nepal</span>
                                <span><i className="fa-solid fa-clock me-2 text-dark"></i>Support hours: 9:00 AM – 6:00 PM</span>
                            </div>
                            <div className="small text-muted mt-3">For payment issues, order tracking, delivery updates, or account help, our support team is available to help you quickly and professionally.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
