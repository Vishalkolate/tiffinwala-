
import { useEffect, useState } from "react";
import {  Link,NavLink,  useLocation,  useNavigate,} from "react-router-dom";

import { ShoppingBag,  House,  UtensilsCrossed,  Info,  Phone,  UserRound,
  Menu as MenuIcon,  X,  LogOut,  Search,  PanelLeftClose,  PanelLeftOpen,  ChefHat,  LogIn,  UserPlus,  Package,} from "lucide-react";

import { useCart } from "../context/CartContext.jsx";
import axios from "axios";

export default function Navbar() {
  const { cartItems = [] } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState("");

  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const token = localStorage.getItem("tiffin-token");
      const user = localStorage.getItem("tiffin-user");

      return token && user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });

  // Sync login status
  useEffect(() => {
    function syncUser() {
      try {
        const token = localStorage.getItem("tiffin-token");
        const user = localStorage.getItem("tiffin-user");

        setLoggedInUser(
          token && user ? JSON.parse(user) : null
        );
      } catch {
        setLoggedInUser(null);
      }
    }

    window.addEventListener("storage", syncUser);
    window.addEventListener("tiffin-auth-changed", syncUser);

    syncUser();

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("tiffin-auth-changed", syncUser);
    };
  }, []);

  // Close mobile sidebar after navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const cartCount = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0
  );

  const userName =
    loggedInUser?.full_name ||
    loggedInUser?.first_name ||
    loggedInUser?.name ||
    loggedInUser?.email?.split("@")[0] ||
    "My Profile";

  const navLinks = [
    { name: "Home", path: "/", icon: House },
    { name: "Menu", path: "/menu", icon: UtensilsCrossed },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Phone },
  ];

  const linkClass = ({ isActive }) =>
    `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
      isActive
        ? "bg-orange-500 text-white shadow-md shadow-orange-200"
        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
    }`;

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function handleSearch(event) {
    event.preventDefault();

    const query = searchText.trim();

    if (!query) return;

    navigate(`/menu?search=${encodeURIComponent(query)}`);
    closeSidebar();
  }

  async function handleLogout() {
    const token = localStorage.getItem("tiffin-token");

    try {
      if (token) {
        await axios("http://127.0.0.1:8000/api/auth/logout/", {
          method: "POST",
          headers: {
            Authorization: `Token ${token}`,
            Accept: "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("tiffin-token");
      localStorage.removeItem("tiffin-user");

      setLoggedInUser(null);
      closeSidebar();

      window.dispatchEvent(new Event("tiffin-auth-changed"));
      navigate("/login");
    }
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button type="button" aria-label="Close sidebar overlay"  onClick={closeSidebar}
          className="fixed inset-0 z-[60] bg-black/40 md:hidden" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] flex w-64 flex-col border-r border-orange-100 bg-white transition-all duration-300 ${
          collapsed ? "md:w-20" : "md:w-64"
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-orange-100 px-4">
          <Link to="/"  onClick={closeSidebar}
            className="flex items-center gap-3 overflow-hidden" >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 text-white shadow-md">
              <ChefHat size={25} />
            </div>

            {!collapsed && (
              <div className="whitespace-nowrap">
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
                  Tiffin<span className="text-orange-600">Wala</span>
                </h1>

                <p className="text-xs font-medium text-gray-500">
                  Ghar Jaisa Khana
                </p>
              </div>
            )}
          </Link>

          <button  type="button" onClick={closeSidebar}
            className="rounded-lg p-2 text-gray-500 hover:bg-orange-50 md:hidden"
            aria-label="Close sidebar" >
            <X size={21} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-6">
          {!collapsed && (
            <p className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Main Menu
            </p>
          )}

          <nav className="space-y-2">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink key={item.path}  to={item.path}  end={item.path === "/"}
                  title={collapsed ? item.name : undefined}
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <Icon size={21} className="shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              );
            })}
          </nav>

          <div className="my-6 border-t border-gray-100" />

          {!collapsed && (
            <p className="mb-3 px-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Account
            </p>
          )}

          {/* Account Navigation */}
          <nav className="space-y-2">
            {loggedInUser ? (
              <>
                {/* Profile */}
                <NavLink  to="/profile"
                  title={collapsed ? "Profile" : undefined}  className={linkClass}
                  onClick={closeSidebar}
                >
                  <UserRound size={21} className="shrink-0" />
                  {!collapsed && <span>Profile</span>}
                </NavLink>

                {/* My Orders - Profile च्या खाली */}
                <NavLink
                  to="/my-orders"
                  title={collapsed ? "My Orders" : undefined}
                  className={linkClass}
                  onClick={closeSidebar}
                >
                  <Package size={21} className="shrink-0" />
                  {!collapsed && <span>My Orders</span>}
                </NavLink>
              </>
            ) : (
              <>
                {/* Login */}
                <NavLink  to="/login"
                  title={collapsed ? "Login" : undefined}  className={linkClass}
                  onClick={closeSidebar}  >
                  <LogIn size={21} className="shrink-0" />
                  {!collapsed && <span>Login</span>}
                </NavLink>

                {/* Sign Up */}
                <NavLink  to="/signup"
                  title={collapsed ? "Sign Up" : undefined}  className={linkClass}  onClick={closeSidebar}
                >
                  <UserPlus size={21} className="shrink-0" />
                  {!collapsed && <span>Sign Up</span>}
                </NavLink>
              </>
            )}

            {/* My Cart */}
            <NavLink  to="/cart"  title={collapsed ? "My Cart" : undefined} className={linkClass}
              onClick={closeSidebar}  >
              <ShoppingBag size={21} className="shrink-0" />

              {!collapsed && (
                <>
                  <span className="flex-1">My Cart</span>

                  {cartCount > 0 && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700">
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="border-t border-gray-100 p-3">
          {loggedInUser && (
            <>
              {/* User Profile */}
            <Link to="/profile" onClick={closeSidebar}
               className={`mb-3 flex items-center gap-3 rounded-xl bg-orange-50 p-3 ${
               collapsed ? "justify-center" : ""
             }`}>


          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-200 font-bold text-orange-700">
           {userName.charAt(0).toUpperCase()}
            </div>

          {!collapsed && (
          <div className="min-w-0 flex-1">
             <p className="truncate text-sm font-bold text-gray-800">
               {userName}
              </p>

                <p className="text-xs text-gray-500">
               Logged in
                </p>
                </div>
                )}
              </Link>

              {/* Logout */}
              <button  type="button"   onClick={handleLogout}
                title={collapsed ? "Logout" : undefined}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50" >
                <LogOut size={21} className="shrink-0" />
                {!collapsed && <span>Logout</span>}
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Top Navbar */}
      <header
        className={`fixed right-0 top-0 z-50 h-[72px] border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur transition-all duration-300 ${
          collapsed ? "md:left-20" : "md:left-64"
        } left-0`}
      >
        <div className="flex h-full items-center justify-between gap-3 px-3 sm:px-5">
          {/* Left Controls */}
          <div className="flex min-w-0 items-center gap-3">
            <button  type="button" onClick={() => {
                if (window.innerWidth < 768) {
                  setSidebarOpen((open) => !open);
                } else {
                  setCollapsed((value) => !value);
                }
              }}
              className="shrink-0 rounded-xl border border-gray-200 p-2.5 text-white transition hover:bg-orange-50 hover:text-orange-600 bg-orange-600"
              aria-label="Toggle sidebar" >

              <span className="hidden md:block">
                {collapsed ? (
                  <PanelLeftOpen size={21} />
                ) : (
                  <PanelLeftClose size={21} />
                )}
              </span>

              <span className="md:hidden">
                {sidebarOpen ? <X size={21} /> : <MenuIcon size={21} />}
              </span>
            </button>

            <div className="hidden min-w-0 sm:block">
              <h2 className="truncate text-lg font-bold text-gray-800">
                Welcome to TiffinWala
              </h2>

              <p className="text-xs text-gray-500">
                Fresh food, happy life!
              </p>
            </div>
          </div>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="mx-1 flex max-w-md flex-1 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 transition focus-within:border-orange-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100"
          >
            <Search size={19} className="shrink-0 text-gray-400" />

            <input  type="search"  value={searchText}
              onChange={(event) => setSearchText(event.target.value)} placeholder="Search tiffin, thali..."  aria-label="Search menu"
              className="w-full min-w-0 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400" />

            <button  type="submit"
              className="hidden rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-600 sm:block"
            >
              Search
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/cart"
              aria-label={`Shopping cart, ${cartCount} items`}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 text-gray-700 transition hover:bg-orange-50 hover:text-orange-600 sm:h-11 sm:w-11"
            >
              <ShoppingBag size={22} />

              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white ring-2 ring-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>

            {loggedInUser ? (
              <Link  to="/profile"   aria-label="My Profile"  title={userName}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-orange-200 bg-orange-500 text-white transition hover:border-orange-600 sm:h-11 sm:w-11"
              >
                <UserRound size={22} />
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-2.5 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50 sm:px-3"
                >
                  <LogIn size={17} />
                  <span>Login</span>
                </Link>

                <Link   to="/signup" aria-label="Sign Up"  title="Sign Up"
                  className="hidden items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-bold text-white transition hover:bg-orange-600 sm:inline-flex"
                >
                  <UserPlus size={17} />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
