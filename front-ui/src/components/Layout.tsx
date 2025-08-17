import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/style.css";

import { CartData, CatBrandData, UserType } from "@/library/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { fromStorage, removeStorage } from "@/library/function";
import http from "@/http";
import { clearUser, setUser } from "@/store";
import { Loading } from "./Loading";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button, NavDropdown } from "react-bootstrap";

export const Layout: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value);
    const cart: CartData = useSelector((state: any) => state.cart.value);

    const [categories, setCategories] = useState<CatBrandData[]>([]);
    const [brands, setBrands] = useState<CatBrandData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [totalQty, setTotalQty] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        Promise.all([http.get("/categories"), http.get("/brands")])
            .then(([{ data: cData }, { data: bData }]) => {
                setCategories(cData);
                setBrands(bData);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        setLoading(true);
        if (!user) {
            const token = fromStorage("m3pmftoken");

            if (token) {
                http
                    .get("/profile/details")
                    .then(({ data }) => {
                        dispatch(setUser(data));
                    })
                    .catch(() => {
                        removeStorage("m3pmftoken");
                    })
                    .finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        let tq = 0,
            tp = 0;

        if (cart && typeof cart === "object" && Object.keys(cart).length > 0) {
            for (let id in cart) {
                const item = cart[id];
                const qty = Number(item?.qty) || 0;
                const total = Number(item?.total) || 0;
                tq += qty;
                tp += total;
            }
        }

        setTotalQty(tq);
        setTotalPrice(tp);
    }, [cart]);

    const handleLogout = () => {
        removeStorage("m3pmftoken");
        dispatch(clearUser());
    };

    return loading ? (
        <Loading />
    ) : (
        <>
            <div className="container-fluid">
                <div className="row min-vh-100">
                    <div className="col-12">
                        {/* Header */}
                        <header className="row">
                            <div className="col-12 bg-dark py-2 d-md-block d-none">
                                <div className="row">
                                    <div className="col-auto me-auto">
                                        <ul className="top-nav">
                                            <li>
                                                <a href="tel:+977-9765220864">
                                                    <i className="fa fa-phone-square me-2"></i>
                                                    +977-9765220864
                                                </a>
                                            </li>
                                            <li>
                                                <a href="mailto:quickcart@gmail.com">
                                                    <i className="fa fa-envelope me-2"></i>
                                                    quickcart@gmail.com
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="col-auto">
                                        <ul className="top-nav">
                                            {user ? (
                                                <>
                                                    <li>
                                                        <Link to="/profile">
                                                            <i className="fas fa-user-circle me-2"></i>
                                                            {user.name}
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Button
                                                            variant="link"
                                                            type="button"
                                                            className="link-light text-decoration-none p-0"
                                                            size="sm"
                                                            onClick={handleLogout}
                                                        >
                                                            <i className="fas fa-sign-out-alt me-2"></i>
                                                            Logout
                                                        </Button>
                                                    </li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>
                                                        <Link to="/register">
                                                            <i className="fas fa-user-edit me-2"></i>
                                                            Register
                                                        </Link>
                                                    </li>
                                                    <li>
                                                        <Link to="/login">
                                                            <i className="fas fa-sign-in-alt me-2"></i>
                                                            Login
                                                        </Link>
                                                    </li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="col-12 bg-white pt-4">
                                <div className="row">
                                    <div className="col-lg-auto ms-3">
                                        <div className="site-logo text-center text-lg-left">
                                            <Link to="/">
                                                <img
                                                    src="/Logo.png"
                                                    alt="Quick Cart Logo"
                                                    className="img-fluid"
                                                    style={{ maxHeight: "60px" }}
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="col-lg-5 mx-auto mt-4 mt-lg-0">
                                        <form action="#">
                                            <div className="form-group">
                                                <div className="input-group">
                                                    <input
                                                        type="search"
                                                        className="form-control border-dark"
                                                        placeholder="Search..."
                                                        required
                                                        onKeyUp={({ target }) => {
                                                            // @ts-ignore
                                                            navigate(`/search?term=${target.value}`);
                                                        }}
                                                    />
                                                    <button className="btn btn-outline-dark">
                                                        <i className="fas fa-search"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div className="col-lg-auto text-center text-lg-left header-item-holder">
                                        <a href="#" className="header-item">
                                            <i className="fas fa-heart-circle-check me-2"></i>
                                            <span id="header-favorite">0</span>
                                        </a>
                                        <Link to="/cart" className="header-item">
                                            <i className="fas fa-cart-shopping me-2"></i>
                                            <span id="header-qty" className="me-3">{totalQty}</span>
                                            <i className="fas fa-coins me-2"></i>
                                            <span id="header-price">Rs. {totalPrice}</span>
                                        </Link>
                                    </div>
                                </div>

                                <div className="row">
                                    <nav className="navbar navbar-expand-lg navbar-light bg-white col-12">
                                        <button
                                            className="navbar-toggler d-lg-none border-0"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#mainNav"
                                        >
                                            <span className="navbar-toggler-icon"></span>
                                        </button>
                                        <div className="collapse navbar-collapse" id="mainNav">
                                            <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
                                                <li className="nav-item active">
                                                    <Link className="nav-link" to="/">Home</Link>
                                                </li>
                                                <NavDropdown title="Categories">
                                                    {categories.map(cat => (
                                                        <Link key={cat._id} to={`/categories/${cat._id}`} className="dropdown-item">{cat.name}</Link>
                                                    ))}
                                                </NavDropdown>
                                                <NavDropdown title="Brands">
                                                    {brands.map(brand => (
                                                        <Link key={brand._id} to={`/brands/${brand._id}`} className="dropdown-item">{brand.name}</Link>
                                                    ))}
                                                </NavDropdown>
                                            </ul>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </header>
                    </div>

                    {/* Main Content */}
                    <Outlet />

                    {/* Footer */}
                    <div className="col-12 align-self-end">
                        <footer className="row">
                            <div className="col-12 bg-dark text-white pt-5">
                                <div className="row">
                                    <div className="col-lg-2 col-sm-4 text-center text-sm-left mb-sm-0 mb-3">
                                        <div className="footer-logo mb-2">
                                            <Link to="/" className="text-white h5 text-decoration-none">Quick Cart</Link>
                                        </div>
                                        <address className="mb-2">
                                            Kandaghari 09<br />Kathmandu, Nepal
                                        </address>
                                        <div>
                                            <a href="#" className="social-icon me-2 text-white"><i className="fab fa-facebook-f"></i></a>
                                            <a href="#" className="social-icon me-2 text-white"><i className="fab fa-twitter"></i></a>
                                            <a href="#" className="social-icon me-2 text-white"><i className="fab fa-pinterest-p"></i></a>
                                            <a href="#" className="social-icon me-2 text-white"><i className="fab fa-instagram"></i></a>
                                            <a href="#" className="social-icon text-white"><i className="fab fa-youtube"></i></a>
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-8 text-center text-sm-left mb-sm-0 mb-3">
                                        <h4>Who are we?</h4>
                                        <p>We are a customer-driven e-commerce company committed to providing quality products and seamless shopping experiences. Our platform connects buyers and sellers with ease, offering convenience, security, and reliability. With a focus on innovation and user satisfaction, we aim to simplify online shopping for everyone.</p>
                                    </div>
                                    <div className="col-lg-2 col-sm-3 col-5 ms-lg-auto ms-sm-0 ms-auto mb-sm-0 mb-3">
                                        <h5 className="mb-3">Quick Links</h5>
                                        <ul className="footer-nav list-unstyled">
                                            <li><a href="#" className="text-white text-decoration-none">Home</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Contact Us</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">About Us</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Privacy Policy</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Terms & Conditions</a></li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-1 col-sm-2 col-4 me-auto mb-sm-0 mb-3">
                                        <h5 className="mb-3">Help</h5>
                                        <ul className="footer-nav list-unstyled">
                                            <li><a href="#" className="text-white text-decoration-none">FAQs</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Shipping</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Returns</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Track Order</a></li>
                                            <li><a href="#" className="text-white text-decoration-none">Report Fraud</a></li>
                                        </ul>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 text-center text-sm-left">
                                        <h5 className="mb-3">Newsletter</h5>
                                        <form action="#">
                                            <div className="mb-3">
                                                <input type="email" className="form-control" placeholder="Enter your email..." required />
                                            </div>
                                            <div className="mb-3">
                                                <button className="btn btn-outline-light text-uppercase w-100" type="submit">Subscribe</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>

                                {/* Copyright */}
                                <div className="row mt-4">
                                    <div className="col-12 text-center">
                                        <hr className="border-light" />
                                        <small className="text-light">
                                            &copy; {new Date().getFullYear()} Quick Cart. All rights reserved.
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};
