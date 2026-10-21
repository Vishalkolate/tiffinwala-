import { useCallback, useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

import {  ShoppingBag,  IndianRupee,  Clock,  Utensils,  RefreshCw, LayoutDashboard,
  Users, Menu, X,  ShieldCheck,  LogOut,  ChevronDown,  UserRound,  AlertCircle, ArrowRight,  Plus,  UserPlus, } from "lucide-react";

const API_URL = "/api/admin/dashboard/";

// Admin Token
function getToken() {
  return localStorage.getItem("admin-token");
}

// Admin User
function getAdminUser() {
  try {
    return JSON.parse(localStorage.getItem("admin-user") || "{}");
  } catch {
    return {};
  }
}

// Admin Initials
function getInitials(user) {
  const name = String(
    user?.full_name ||
      user?.first_name ||
      user?.email ||
      "Admin"
  ).trim();

  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "A"
  );
}

// Format INR
function formatPrice(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

// Dashboard Error
function getDashboardError(error) {
  const status = error.response?.status;
  const data = error.response?.data;

  if (!getToken()) {
    return "Admin token सापडला नाही. कृपया पुन्हा Admin Login करा.";
  }

  if (status === 401) {
    return "Admin login session invalid किंवा expired आहे. पुन्हा login करा.";
  }

  if (status === 403) {
    return (
      data?.detail ||
      "Admin access denied. Admin account आणि Django permissions तपासा."
    );
  }

  if (status === 404) {
    return "Dashboard API सापडला नाही. Django urls.py तपासा.";
  }

  if (!error.response) {
    return "Django backend चालू आहे का ते तपासा.";
  }

  return (
    data?.detail ||
    data?.message ||
    "Dashboard load करताना error आला."
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState(getAdminUser);

  const [stats, setStats] = useState({
    total_orders: 0,
    today_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    total_tiffins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load Dashboard API
  const loadDashboard = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      navigate("/admin-login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Accept: "application/json",
          Authorization: `Token ${token}`,
        },
      });

      const data = response.data || {};

      setStats((previous) => ({
        ...previous,
        ...data,
      }));
    } catch (err) {
      console.error(
        "Admin dashboard API error:",
        err.response?.data || err.message
      );

      setError(getDashboardError(err));

      if (err.response?.status === 401) {
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");

        navigate("/admin-login", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial Dashboard Load
  useEffect(() => {
    setAdmin(getAdminUser());
    loadDashboard();
  }, [loadDashboard]);

  // Logout
  function handleLogout() {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-user");

    setAdmin({});
    setProfileOpen(false);
    setSidebarOpen(false);

    window.dispatchEvent(new Event("admin-auth-changed"));

    navigate("/admin-login", { replace: true });
  }

  const adminName =
    admin.full_name ||
    admin.first_name ||
    admin.email?.split("@")[0] ||
    "Administrator";

  const adminEmail = admin.email || "Admin Account";

  // Sidebar Navigation
  const menuItems = [
    {
      title: "Dashboard",
      path: "/admin-dashboard",
      icon: LayoutDashboard,
      end: true,
    },
    {
      title: "Orders",
      path: "/admin-dashboard/orders",
      icon: ShoppingBag,
    },
    {
      title: "Tiffins",
      path: "/admin-dashboard/tiffins",
      icon: Utensils,
    },
    {
      title: "Customers",
      path: "/admin-dashboard/customers",
      icon: Users,
    },
  ];

  // Dashboard Statistics
  const cards = [
    {
      title: "Total Orders",
      value: stats.total_orders,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Today's Orders",
      value: stats.today_orders,
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Total Revenue",
      value: formatPrice(stats.total_revenue),
      icon: IndianRupee,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Pending Orders",
      value: stats.pending_orders,
      icon: Utensils,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  // Quick Actions
  const quickActions = [
    {
      title: "Manage Orders",
      description: "View and manage customer orders.",
      path: "/admin-dashboard/orders",
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Manage Tiffins",
      description: "Add, edit and manage your tiffin menu.",
      path: "/admin-dashboard/tiffins",
      icon: Plus,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Manage Customers",
      description: "View registered customer information.",
      path: "/admin-dashboard/customers",
      icon: UserPlus,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile Sidebar Background */}
      {sidebarOpen && (
        <button  type="button"  aria-label="Close sidebar" onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >

        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white">
              <ShieldCheck size={23} />
            </div>

            <div>
              <h2 className="text-lg font-extrabold text-gray-900">
                TiffinWala
              </h2>

              <p className="text-xs font-bold tracking-wider text-orange-600">
                ADMIN PANEL
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <p className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-400">
            Management
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink  key={item.path} to={item.path} end={item.end} onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={20} />
                {item.title}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Admin Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-extrabold text-orange-700">
              {getInitials(admin)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">
                {adminName}
              </p>

              <p className="text-xs font-semibold text-gray-500">
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:pl-64">

        {/* Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6">

          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden" >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-sm font-bold text-gray-900">
                Admin Dashboard
              </p>

              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your tiffin business
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative">

            <button type="button" onClick={() =>
                setProfileOpen((previous) => !previous)
              }
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-xl p-2 hover:bg-gray-50 sm:gap-3" >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-extrabold text-orange-700">
                {getInitials(admin)}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-40 truncate text-sm font-bold text-gray-900">
                  {adminName}
                </p>

                <p className="text-xs text-gray-500">
                  Administrator
                </p>
              </div>

              <ChevronDown
                size={17}
                className={`hidden text-gray-500 transition sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <>
                <button  type="button" aria-label="Close profile menu"
                  onClick={() => setProfileOpen(false)} className="fixed inset-0 z-10 cursor-default"
                />

                <div role="menu"
                  className="absolute right-0 top-full z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
                >

                  <div className="border-b border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-700">
                        {getInitials(admin)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {adminName}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {adminEmail}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
                      <ShieldCheck size={14} />
                      Admin Account
                    </div>
                  </div>

                  <div className="p-2">
                    <button   type="button" role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/admin-dashboard");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                    >
                      <UserRound size={18} />
                      Dashboard
                    </button>

                    <button  type="button" role="menuitem"  onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Dashboard Page */}
        <main className="p-4 sm:p-6 lg:p-8">

          {/* API Error */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              <div className="flex items-start gap-2">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>

              <button type="button" onClick={loadDashboard} disabled={loading}
                className="font-bold underline disabled:opacity-50" >
                Retry
              </button>
            </div>
          )}

          {/* Overview Header */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">
                Overview
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Track your tiffin business performance.
              </p>
            </div>

            <button type="button"  onClick={loadDashboard} disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <div  key={card.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-500">
                      {card.title}
                    </p>

                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}
                    >
                      <Icon size={22} />
                    </div>
                  </div>

                  <p className="mt-5 text-2xl font-black text-gray-900">
                    {loading
                      ? "..."
                      : card.title === "Total Revenue"
                      ? card.value
                      : Number(card.value || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Total Tiffins */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Utensils size={22} />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-500">
                  Total Tiffins
                </p>

                <p className="text-xl font-extrabold text-gray-900">
                  {loading
                    ? "..."
                    : Number(stats.total_tiffins || 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-5">
              <h2 className="text-lg font-extrabold text-gray-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Quickly access your business management pages.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <NavLink  key={action.path} to={action.path}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-orange-300 hover:bg-orange-50/40"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.color}`}
                      >
                        <Icon size={22} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-gray-900">
                          {action.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <ArrowRight
                      size={18}
                      className="shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-orange-600"
                    />
                  </NavLink>
              
             );
})}
            </div>
          </section>

          {/* Child Routes */}
          <div className="mt-8">
            <Outlet />
          </div>

        </main>
      </div>
    </div>
    
            );
          }