import {BrowserRouter, Routes, Route, Outlet} from "react-router-dom"
import {Layout} from "@/components"
import * as Pages from "@/pages"
import {PrivateRoute} from "@/routes/PrivateRoute"
import {AdminRoute} from "@/routes/AdminRoute"
export const AppRouter: React.FC= () => {
    return <BrowserRouter><Routes><Route path="/" element={<Layout/>}>
        <Route index element={<PrivateRoute element={<Pages.Dashboard.Home />} />} />
        <Route path="/profile/edit" element={<PrivateRoute element={<Pages.Profile.Edit />} />} />
        <Route path="/profile/password" element={<PrivateRoute element={<Pages.Profile.Password />} />} />
        <Route path="staffs" element={<PrivateRoute element={<AdminRoute element={<Outlet />} />} />}><Route index element={<Pages.Staffs.List/>} /><Route path="create" element={<Pages.Staffs.Create/>} /><Route path=":id/edit" element={<Pages.Staffs.Edit/>} /></Route>
        <Route path="customers" element={<PrivateRoute element={<Outlet />} />}><Route index element={<Pages.Customers.List/>} /><Route path="create" element={<Pages.Customers.Create/>} /><Route path=":id/edit" element={<Pages.Customers.Edit/>} /></Route>
        <Route path="categories" element={<PrivateRoute element={<Outlet />} />}><Route index element={<Pages.Categories.List/>} /><Route path="create" element={<Pages.Categories.Create/>} /><Route path=":id/edit" element={<Pages.Categories.Edit/>} /></Route>
        <Route path="brands" element={<PrivateRoute element={<Outlet />} />}><Route index element={<Pages.Brands.List/>} /><Route path="create" element={<Pages.Brands.Create/>} /><Route path=":id/edit" element={<Pages.Brands.Edit/>} /></Route>
        <Route path="products" element={<PrivateRoute element={<Outlet />} />}><Route index element={<Pages.Products.List/>} /><Route path="create" element={<Pages.Products.Create/>} /><Route path=":id/edit" element={<Pages.Products.Edit/>} /></Route>
        <Route path="/orders" element={<PrivateRoute element={<Pages.Orders.List />} />} />
        <Route path="/payments" element={<PrivateRoute element={<Pages.Payments.List />} />} />
        <Route path="/login" element={<Pages.Auth.Login />} />
    </Route></Routes></BrowserRouter>
}
