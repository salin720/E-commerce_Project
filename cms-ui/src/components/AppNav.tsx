import { Link, NavLink } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { UserType } from "@/library/interfaces"
import { removeStorage } from "@/library/function"
import { clearUser } from "@/store"

export const AppNav: React.FC = () => {
    const user: UserType = useSelector((state: any) => state.user.value)
    const dispatch = useDispatch()
    const handleLogout = () => { removeStorage("m3pmctoken"); dispatch(clearUser()) }
    if (!user) return null
    return (
        <aside className="admin-sidebar text-white position-fixed vh-100">
            <div className="p-3 d-flex flex-column h-100">
                <Link to="/" className="text-decoration-none text-white mb-4 d-flex align-items-center gap-2"><div className="admin-brand-icon">QC</div><div><div className="fw-bold">Quick Cart</div><small className="text-white-50">Admin Panel</small></div></Link>
                <nav className="nav flex-column gap-1 mb-auto">
                    <NavLink to="/" end className="admin-link"><i className="fa-solid fa-chart-line me-2" />Dashboard</NavLink>
                    {user.role === "Admin" && <NavLink to="/staffs" className="admin-link"><i className="fa-solid fa-users me-2" />Staffs</NavLink>}
                    <NavLink to="/customers" className="admin-link"><i className="fa-solid fa-user me-2" />Customers</NavLink>
                    <NavLink to="/categories" className="admin-link"><i className="fa-solid fa-layer-group me-2" />Categories</NavLink>
                    <NavLink to="/brands" className="admin-link"><i className="fa-solid fa-tags me-2" />Brands</NavLink>
                    <NavLink to="/products" className="admin-link"><i className="fa-solid fa-box-open me-2" />Products</NavLink>
                    <NavLink to="/orders" className="admin-link"><i className="fa-solid fa-receipt me-2" />Orders</NavLink>
                </nav>
                <div className="admin-user-card">
                    <div className="fw-semibold">{user.name}</div>
                    <div className="small text-white-50 mb-2">{user.role}</div>
                    <div className="d-flex gap-2 flex-wrap"><Link className="btn btn-sm btn-light" to="/profile/edit">Profile</Link><button className="btn btn-sm btn-outline-light" onClick={handleLogout}>Logout</button></div>
                </div>
            </div>
        </aside>
    )
}
