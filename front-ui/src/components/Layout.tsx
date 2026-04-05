import "bootstrap/dist/css/bootstrap.min.css"
import "@fortawesome/fontawesome-free/css/all.min.css"
import "react-toastify/dist/ReactToastify.css"
import "@/styles/style.css"

import { CartData, CatBrandData, SearchSuggestion, UserType } from "@/library/interfaces"
import { useDispatch, useSelector } from "react-redux"
import { FormEvent, useEffect, useMemo, useRef, useState } from "react"
import { fromStorage, removeStorage, imgUrl } from "@/library/function"
import http from "@/http"
import { clearUser, setUser } from "@/store"
import { Loading } from "./Loading"
import { Link, Outlet, useNavigate } from "react-router-dom"
import { NavDropdown } from "react-bootstrap"

export const Layout: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const cart: CartData = useSelector((state: any) => state.cart.value)
    const [categories, setCategories] = useState<CatBrandData[]>([])
    const [brands, setBrands] = useState<CatBrandData[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [totalQty, setTotalQty] = useState<number>(0)
    const [totalPrice, setTotalPrice] = useState<number>(0)
    const [term, setTerm] = useState<string>("")
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [wishlistCount, setWishlistCount] = useState<number>(0)
    const searchWrapRef = useRef<HTMLFormElement | null>(null)

    const dispatch = useDispatch()
    const navigate = useNavigate()

    useEffect(() => {
        Promise.all([http.get("/categories"), http.get("/brands")])
            .then(([{ data: cData }, { data: bData }]) => {
                setCategories(cData)
                setBrands(bData)
            })
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!user) {
            const token = fromStorage("m3pmftoken")
            if (token) {
                setLoading(true)
                http.get("/profile/details")
                    .then(({ data }) => dispatch(setUser(data)))
                    .catch(() => removeStorage("m3pmftoken"))
                    .finally(() => setLoading(false))
            }
        }
    }, [user, dispatch])

    useEffect(() => {
        let tq = 0, tp = 0
        Object.keys(cart || {}).forEach(id => {
            tq += Number(cart[id]?.qty) || 0
            tp += Number(cart[id]?.total) || 0
        })
        setTotalQty(tq)
        setTotalPrice(tp)
    }, [cart])

    useEffect(() => {
        const syncWishlist = () => {
            const saved = localStorage.getItem("wishlist")
            const localWishlist = saved ? JSON.parse(saved) : []
            setWishlistCount(localWishlist.length)
        }
        syncWishlist()
        window.addEventListener('storage', syncWishlist)
        window.addEventListener('wishlist-updated', syncWishlist as EventListener)
        window.addEventListener('focus', syncWishlist)
        return () => {
            window.removeEventListener('storage', syncWishlist)
            window.removeEventListener('wishlist-updated', syncWishlist as EventListener)
            window.removeEventListener('focus', syncWishlist)
        }
    }, [])

    useEffect(() => {
        if (!term.trim()) {
            setSuggestions([])
            return
        }
        const timer = setTimeout(() => {
            http.get('/products/autocomplete', { params: { term } })
                .then(({ data }) => {
                    const productSuggestions = data?.suggestions || []
                    const keywordSuggestions = (data?.keywords || []).map((keyword: string, index: number) => ({
                        _id: `keyword-${index}-${keyword}`,
                        name: keyword,
                        categoryName: 'Suggested search',
                    }))
                    setSuggestions([...keywordSuggestions, ...productSuggestions])
                    setShowSuggestions(true)
                })
                .catch(() => setSuggestions([]))
        }, 220)
        return () => clearTimeout(timer)
    }, [term])

    useEffect(() => {
        const close = (event: MouseEvent) => {
            if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    const handleLogout = () => {
        if (!window.confirm('Are you sure want to logout? Please save your info before logout.')) return
        removeStorage("m3pmftoken")
        dispatch(clearUser())
        navigate("/")
    }

    const handleSearch = (event?: FormEvent) => {
        event?.preventDefault()
        const q = term.trim()
        if (!q) return
        navigate(`/search?term=${encodeURIComponent(q)}`)
        setShowSuggestions(false)
    }

    const money = useMemo(() => `Rs. ${totalPrice.toFixed(2)}`, [totalPrice])
    const avatarUrl = user?.avatar ? (user.avatar.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${user.avatar}` : imgUrl(user.avatar)) : '/avatar.png'

    return loading ? <Loading /> : (
        <div className="container-fluid px-0 bg-site">
            <header className="site-header sticky-top">
                <div className="top-strip d-none d-md-block">
                    <div className="container-fluid px-lg-4 d-flex justify-content-between py-2 text-white small">
                        <div className="d-flex gap-3"><span><i className="fa fa-phone-square me-2"></i>+977-9765220864</span><span><i className="fa fa-envelope me-2"></i>quickcart@gmail.com</span></div>
                        <div className="d-flex gap-3">
                            {user ? <><Link to="/profile" className="btn btn-sm btn-light rounded-pill px-3">My Account</Link><button className="btn btn-sm btn-outline-light rounded-pill px-3" onClick={handleLogout}>Logout</button></> : <><Link to="/login" className="btn btn-sm btn-light rounded-pill px-3">Login</Link><Link to="/register" className="btn btn-sm btn-warning rounded-pill px-3">Register</Link></>}
                        </div>
                    </div>
                </div>

                <div className="header-main bg-white shadow-sm">
                    <div className="container-fluid px-lg-4 py-3">
                        <div className="row align-items-center g-3">
                            <div className="col-lg-2 col-md-3 col-12">
                                <Link to="/" className="site-logo-real text-decoration-none">Quick <span>Cart</span></Link>
                            </div>
                            <div className="col-lg-7 col-md-6 col-12">
                                <form onSubmit={handleSearch} className="search-shell" ref={searchWrapRef} >
                                    <input
                                        className="search-input-real"
                                        value={term}
                                        onChange={(e) => setTerm(e.target.value)}
                                        onFocus={() => { if (term.trim()) setShowSuggestions(true) }}
                                        placeholder="Search for products, brands and categories"
                                    />
                                    <button className="search-btn-real" type="submit"><i className="fa fa-search"></i></button>
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="search-dropdown-real">
                                            {suggestions.map((item) => (
                                                <button key={item._id} type="button" className="search-suggestion-item" onClick={() => { if (String(item._id).startsWith('keyword-')) { navigate(`/search?term=${encodeURIComponent(item.name)}`) } else if (String(item._id).startsWith('category-') || String(item._id).startsWith('brand-')) { navigate(`/search?term=${encodeURIComponent(item.name)}`) } else { navigate(`/products/${item._id}`) } setShowSuggestions(false) }}>
                                                    <span className="search-suggestion-icon">{item.image ? <img src={item.image.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${item.image}` : imgUrl(item.image)} alt={item.name} className="suggestion-thumb" /> : <i className="fa fa-search"></i>}</span>
                                                    <div className="text-start">
                                                        <div className="fw-medium">{item.name}</div>
                                                        <div className="small text-muted">{item.brandName || item.categoryName || 'Suggested search'}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </form>
                            </div>
                            <div className="col-lg-3 col-md-3 col-12 d-flex justify-content-lg-end gap-2 flex-wrap align-items-center">
                                <Link to="/profile" className="icon-pill text-decoration-none"><img src={avatarUrl} className="avatar-mini" /> <span>{user ? user.name.split(' ')[0] : 'Guest'}</span></Link>
                                <Link to="/wishlist" className="icon-pill text-decoration-none"><i className="fas fa-heart me-2 text-danger"></i>{wishlistCount}</Link>
                                <Link to="/cart" className="icon-pill text-decoration-none"><i className="fas fa-cart-shopping me-2"></i>{totalQty} • {money}</Link>
                            </div>
                        </div>

                        <nav className="navbar navbar-expand-lg navbar-light mt-3 nav-real rounded-4 px-3">
                            <button className="navbar-toggler d-lg-none border-0" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"><span className="navbar-toggler-icon"></span></button>
                            <div className="collapse navbar-collapse" id="mainNav">
                                <ul className="navbar-nav mx-auto gap-lg-3">
                                    <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                                    <NavDropdown title="Categories">
                                        {categories.map(cat => <Link key={cat._id} to={`/categories/${cat._id}`} className="dropdown-item dropdown-media-item">{cat.image ? <img src={cat.image.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${cat.image}` : imgUrl(cat.image)} alt={cat.name} className="dropdown-media-thumb" /> : <span className="dropdown-media-thumb dropdown-media-fallback"><i className="fa fa-grid-2"></i></span>}<span>{cat.name}</span></Link>)}
                                    </NavDropdown>
                                    <NavDropdown title="Brands">
                                        {brands.map(brand => <Link key={brand._id} to={`/brands/${brand._id}`} className="dropdown-item dropdown-media-item">{brand.image ? <img src={brand.image.startsWith('/image/') ? `${import.meta.env.VITE_API_URL}${brand.image}` : imgUrl(brand.image)} alt={brand.name} className="dropdown-media-thumb" /> : <span className="dropdown-media-thumb dropdown-media-fallback"><i className="fa fa-tag"></i></span>}<span>{brand.name}</span></Link>)}
                                    </NavDropdown>
                                    <li className="nav-item"><Link className="nav-link" to="/profile">Orders & Account</Link></li>
                                    <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                                </ul>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>

            <Outlet />

            <footer className="footer-real mt-5">
                <div className="container-fluid px-lg-4 py-5">
                    <div className="row g-4">
                        <div className="col-lg-4">
                            <h4 className="footer-brand">Quick Cart</h4>
                            <p className="text-white-50 mb-3">A modern marketplace with smart recommendations, dynamic product discovery, secure checkout and clear order tracking.</p>
                            <div className="d-flex gap-3 text-white fs-5"><i className="fab fa-facebook-f"></i><i className="fab fa-instagram"></i><i className="fab fa-youtube"></i><i className="fab fa-x-twitter"></i></div>
                        </div>
                        <div className="col-lg-2 col-md-4"><h6>Shop</h6><ul className="footer-list"><li><Link to="/">Home</Link></li><li><Link to="/cart">Cart</Link></li><li><Link to="/profile">Orders</Link></li></ul></div>
                        <div className="col-lg-3 col-md-4"><h6>Support</h6><ul className="footer-list"><li><a href="tel:+9779765220864">+977-9765220864</a></li><li><a href="mailto:quickcart@gmail.com">quickcart@gmail.com</a></li><li><span>Kathmandu, Nepal</span></li></ul></div>
                        <div className="col-lg-3 col-md-4"><h6>Why Quick Cart</h6><ul className="footer-list"><li><span>Smart recommendations</span></li><li><span>eSewa & COD ordering</span></li><li><span>Track payments and delivery</span></li></ul></div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
