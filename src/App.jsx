
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";
import Layout from "./components/Layout.jsx";

// Customer Pages
import Home from "./pages/Home.jsx";
import Menu from "./pages/Menu.jsx";
import Cart from "./pages/Cart.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Checkout from "./pages/Checkout.jsx";
import Profile from "./pages/Profile.jsx";
import MyOrder from "./pages/MyOrder";
import Signup from "./pages/Signup.jsx";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard.jsx";
import AdminOrders from "./admin/AdminOrders.jsx";
import AdminTiffins from "./admin/AdminTiffins.jsx";
import AdminCustomers from "./admin/AdminCustomers.jsx";
import AdminRoute from "./admin/AdminRoute.jsx";
import AdminLogin from "./admin/AdminLogin.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>

          {/* Customer Website Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-orders" element={<MyOrder />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Admin Login */}
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          {/* Protected Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
            >
              {/* Dashboard Overview */}
              <Route index element={null} />

              {/* Orders Management */}
              <Route
                path="orders"
                element={<AdminOrders />}
              />

              {/* Tiffins Management */}
              <Route
                path="tiffins"
                element={<AdminTiffins />}
              />

              {/* Customers Management */}
              <Route
                path="customers"
                element={<AdminCustomers />}
              />
            </Route>
          </Route>

          {/* Not Found */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
