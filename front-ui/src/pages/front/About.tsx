import React from "react"

export const About: React.FC = () => {
    return (
        <div className="col-12 px-3 px-lg-4 py-4 pb-5">
            <div className="about-page-shell bg-white rounded-4 shadow-sm border-soft p-4 p-lg-5">
                <div className="section-heading-centered mb-4 mb-lg-5">
                    <div className="section-kicker">About Quick Cart</div>
                    <h2>Modern shopping with trust, clarity, and dependable support</h2>
                    <p className="text-muted mb-0">Quick Cart is built to make online shopping easier, safer, and more transparent for every customer.</p>
                </div>

                <div className="row g-4 align-items-stretch">
                    <div className="col-lg-8">
                        <div className="about-info-card about-balanced-card h-100">
                            <h5 className="mb-3">Why customers choose Quick Cart</h5>
                            <p>Quick Cart is a smart and user-friendly marketplace where customers can discover products quickly, compare options clearly, and shop with confidence. Our platform focuses on clean design, simple navigation, and secure checkout so that buying online feels smooth from start to finish.</p>
                            <p>We provide detailed product cards, same-category comparisons, clear score insights, price movement indicators, order tracking, and reliable payment support. This gives customers a better understanding of product value before purchase and a more professional experience after checkout.</p>
                            <div className="about-feature-grid mt-4">
                                <div className="about-feature-pill"><i className="fa-solid fa-shield-heart"></i><span>Secure eSewa and COD checkout</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-chart-line"></i><span>Smart score and price insights</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-scale-balanced"></i><span>Clear same-category comparison</span></div>
                                <div className="about-feature-pill"><i className="fa-solid fa-truck-fast"></i><span>Simple order and payment tracking</span></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 d-flex flex-column gap-4">
                        <div className="about-info-card about-balanced-card">
                            <h5 className="mb-3">Customer Benefits</h5>
                            <ul className="mb-0 ps-3 about-list-clean">
                                <li>Fast product browsing with a clean layout</li>
                                <li>Transparent ratings, reviews, and price trends</li>
                                <li>Secure checkout and payment receipt support</li>
                                <li>Easy order status tracking after purchase</li>
                                <li>Helpful support for payment and delivery issues</li>
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
                            <div className="small text-muted mt-3">For payment issues, order tracking, delivery updates, or account help, our support team is ready to assist you quickly and professionally.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
