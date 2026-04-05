import {BrowserRouter, Routes, Route} from "react-router-dom"
import {Layout} from "@/components"
import * as Pages from "@/pages"
import {PrivateRoute} from "@/routes/PrivateRoute.tsx";
// import {PrivateRoute} from "@/routes/PrivateRoute"
import PaymentSuccess from "@/pages/front/PaymentSuccess"; // Make sure the alias works

export const AppRouter: React.FC= () => {
    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<Pages.Front.Home />} />

                <Route path="/categories/:id" element={<Pages.Front.Category/>} />
                <Route path="/brands/:id" element={<Pages.Front.Brand/>} />
                <Route path="/search" element={<Pages.Front.Search/>} />
                <Route path="/products/:id" element={<Pages.Front.Detail/>} />
                <Route path="/login" element={<Pages.Auth.Login/>} />
                <Route path="/register" element={<Pages.Auth.Register/>} />
                <Route path="/cart" element={<PrivateRoute element={<Pages.Front.Cart />} />} />
                <Route path="/wishlist" element={<PrivateRoute element={<Pages.Front.Wishlist />} />} />
                <Route path="/profile" element={<PrivateRoute element={<Pages.Profile.UserProfile />} />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/about" element={<Pages.Front.About />} />

            </Route>
        </Routes>
    </BrowserRouter>
}
