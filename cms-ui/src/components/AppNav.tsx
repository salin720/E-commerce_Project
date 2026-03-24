import { Link, NavLink } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { UserType } from "@/library/interfaces"
import { removeStorage } from "@/library/function"
import { clearUser } from "@/store"
import { useState } from "react"

export const AppNav: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const dispatch = useDispatch()
    const [showDropdown, setShowDropdown] = useState(false)

    const handleLogout = () => {
        removeStorage("m3pmctoken")
        dispatch(clearUser())
    }

    if (!user) return null

    return (
        <aside className="sidebar bg-dark text-white position-fixed vh-100" style={{ width: "250px", zIndex: 1000 }}>
            <div className="d-flex flex-column h-100 p-3">
                <div className="mb-4 text-center">
                    <Link to="/" className="d-flex flex-column align-items-center text-decoration-none text-white">
                        <img src="/Logo.png" alt="Logo" style={{ maxHeight: 50 }} />
                    </Link>
                </div>

                <nav className="nav flex-column mb-auto">
                    {user.role === "Admin" && (
                        <NavLink to="/staffs" className="nav-link text-white">
                            <i className="fa-solid fa-users me-2" /> Staffs
                        </NavLink>
                    )}
                    <NavLink to="/customers" className="nav-link text-white">
                        <i className="fa-solid fa-user me-2" /> Customers
                    </NavLink>
                    <NavLink to="/categories" className="nav-link text-white">
                        <i className="fa-solid fa-layer-group me-2" /> Categories
                    </NavLink>
                    <NavLink to="/brands" className="nav-link text-white">
                        <i className="fa-solid fa-tags me-2" /> Brands
                    </NavLink>
                    <NavLink to="/products" className="nav-link text-white">
                        <i className="fa-solid fa-box-open me-2" /> Products
                    </NavLink>
                    <NavLink to="/reviews" className="nav-link text-white">
                        <i className="fa-solid fa-star me-2" /> Reviews
                    </NavLink>
                    <NavLink to="/orders" className="nav-link text-white">
                        <i className="fa-solid fa-receipt me-2" /> Orders
                    </NavLink>

                    <div className="nav-item dropdown">
                        <button
                            className="nav-link text-white dropdown-toggle w-100 text-start"
                            onClick={() => setShowDropdown(!showDropdown)}
                            style={{ background: "none", border: "none" }}
                        >
                            <i className="fa-solid fa-circle-user me-2" /> {user.name}
                        </button>

                        {showDropdown && (
                            <ul className="dropdown-menu show w-100 dropdown-menu-dark position-static mt-2">
                                <li>
                                    <Link className="dropdown-item" to="/profile/edit">
                                        <i className="fa-solid fa-user-pen me-2" /> Edit Profile
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" to="/profile/password">
                                        <i className="fa-solid fa-key me-2" /> Change Password
                                    </Link>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                                        <i className="fa-solid fa-arrow-right-from-bracket me-2" /> Log out
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </nav>
            </div>
        </aside>
    )
}
