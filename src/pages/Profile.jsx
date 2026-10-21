import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {  UserRound,  Mail,  Phone,  ShoppingBag,  RefreshCw,  ArrowLeft,  LogIn,  Utensils,  LogOut,  ChevronRight,  ShieldCheck,  House,  CircleUserRound,} from "lucide-react";
import axios from "axios";

const API = "/api";

const getUserName = (user) =>
  user?.full_name ||
  user?.first_name ||
  user?.name ||
  user?.email?.split("@")[0] ||
  "User";

function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("tiffin-user") || "null"
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [logoutLoading, setLogoutLoading] = useState(false);

  const token = localStorage.getItem("tiffin-token");

  const userName = getUserName(user);

  const firstLetter =
    userName.trim().charAt(0).toUpperCase() || "U";

  // GET PROFILE
  const axiosProfile = useCallback(async () => {
    const savedToken = localStorage.getItem("tiffin-token");

    if (!savedToken) {
      setLoading(false);
      setUser(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/auth/me/`,
        {
          headers: {
            Authorization: `Token ${savedToken}`,
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      // console.log("Profile response:", data);

      const profileData = data.user || data;

      setUser((previousUser) => {
        const updatedUser = {
          ...(previousUser || {}),
          ...profileData,
        };

        localStorage.setItem(
          "tiffin-user",
          JSON.stringify(updatedUser)
        );

        return updatedUser;
      });

    } catch (err) {
      console.error(
        "Profile error:",
        err.response?.data
      );

      const status = err.response?.status;

      if (status === 401 || status === 403) {
        setError(
          "Your login session has expired. Please log in again."
        );

        localStorage.removeItem("tiffin-token");
        localStorage.removeItem("tiffin-user");

        setUser(null);

        window.dispatchEvent(
          new Event("tiffin-auth-changed")
        );
      } else {
        setError(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load your profile."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load profile on page open
  useEffect(() => {
    axiosProfile();
  }, [axiosProfile]);

  // LOGOUT

  const handleLogout = async () => {
    const savedToken = localStorage.getItem("tiffin-token");

    if (logoutLoading) return;

    setLogoutLoading(true);

    try {
      if (savedToken) {
        await axios.post(
          `${API}/auth/logout/`,
          {},
          {
            headers: {
              Authorization: `Token ${savedToken}`,
              Accept: "application/json",
            },
          }
        );
      }
    } catch (err) {
      console.error(
        "Logout API error:",
        err.response?.data
      );
    } finally {
      localStorage.removeItem("tiffin-token");
      localStorage.removeItem("tiffin-user");

      setUser(null);

      window.dispatchEvent(
        new Event("tiffin-auth-changed")
      );

      navigate("/login", { replace: true });

      setLogoutLoading(false);
    }
  };

  // LOGIN REQUIRED

  if (!token) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center bg-[#fff8f1] px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-orange-100 bg-white p-8 text-center shadow-xl shadow-orange-100/50">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100 text-orange-600">
            <LogIn size={34} />
          </div>

          <h1 className="mt-6 text-2xl font-extrabold text-gray-900">
            Login Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please log in to access your profile,
            manage your account and view your orders.
          </p>

          <Link  to="/login"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
          >
            <LogIn size={19} />
            Go to Login
            <ChevronRight size={18} />
          </Link>

          <Link  to="/"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-orange-600"
          >
            <House size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // PROFILE PAGE

  return (
    <div className="min-h-screen bg-[#fff8f1] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Top Navigation */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:border-orange-300 hover:text-orange-600"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <button type="button" onClick={axiosProfile} 
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-600 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={17}
              className={loading ? "animate-spin" : ""} />
            {loading ? "Refreshing..." : "Refresh Profile"}
          </button>
        </div>

        {/* Main Profile Card */}
        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl shadow-orange-100/40">

          {/* Hero Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 px-6 pb-20 pt-8 sm:px-10 sm:pt-10">
            <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="pointer-events-none absolute -bottom-28 right-40 h-52 w-52 rounded-full bg-white/10" />

            <div className="relative flex flex-wrap items-start justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                  <ShieldCheck size={15} />
                  Customer Account
                </span>

                <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                  My Profile
                </h1>

                <p className="mt-2 max-w-md text-sm leading-6 text-orange-50 sm:text-base">
                  Your personal details and orders,
                  all in one place.
                </p>
              </div>

              <div className="hidden h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-white backdrop-blur-sm sm:flex">
                <Utensils size={38} />
              </div>
            </div>
          </div>

          {/* Profile Identity */}
          <div className="relative px-5 pb-8 sm:px-10">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div className="flex min-w-0 items-end gap-4">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] border-[5px] border-white bg-gradient-to-br from-orange-400 to-orange-600 text-4xl font-extrabold uppercase text-white shadow-xl shadow-orange-200/60 sm:h-32 sm:w-32 sm:text-5xl">
                  {firstLetter}
                </div>

                <div className="min-w-0 pb-2">
                  <h2 className="break-words text-2xl font-extrabold text-gray-900 sm:text-3xl">
                    {userName}
                  </h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                      <CircleUserRound size={14} />
                      TiffinWala Customer
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button type="button" onClick={handleLogout} disabled={logoutLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
              >
                <LogOut size={17} />
                {logoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>

            {/* Loading */}
            {loading && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-orange-50 p-4 text-sm font-medium text-orange-700">
                <RefreshCw size={18} className="animate-spin" />
                Updating your profile details...
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-medium text-amber-800">
                  {error}
                </p>

                <Link
                  to="/login"
                  className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  Login Again
                </Link>
              </div>
            )}

            {/* Account Information */}
            <div className="mt-9">
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Account Information
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Your registered personal details.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {/* Full Name */}
                <div className="group rounded-2xl border border-gray-100 bg-gray-50/80 p-5 transition hover:border-orange-200 hover:bg-orange-50/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                    <UserRound size={22} />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Full Name
                  </p>

                  <p className="mt-2 break-words text-base font-bold text-gray-800">
                    {userName}
                  </p>
                </div>

                {/* Email */}
                <div className="group rounded-2xl border border-gray-100 bg-gray-50/80 p-5 transition hover:border-orange-200 hover:bg-orange-50/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                    <Mail size={22} />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Email Address
                  </p>

                  <p className="mt-2 break-all text-base font-bold text-gray-800">
                    {user?.email || "Not provided"}
                  </p>
                </div>

                {/* Phone */}
                <div className="group rounded-2xl border border-gray-100 bg-gray-50/80 p-5 transition hover:border-orange-200 hover:bg-orange-50/50">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 transition group-hover:bg-orange-500 group-hover:text-white">
                    <Phone size={22} />
                  </div>

                  <p className="mt-5 text-xs font-bold uppercase tracking-wider text-gray-400">
                    Phone Number
                  </p>

                  <p className="mt-2 break-words text-base font-bold text-gray-800">
                    {user?.phone ||
                      user?.phone_number ||
                      "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-10">
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-gray-900">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Manage your orders and explore our menu.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                {/* My Orders */}
                <Link to="/my-orders"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-orange-50 to-white p-5 transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200 transition group-hover:scale-105">
                      <ShoppingBag size={25} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-gray-900">
                        My Orders
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Track and manage your orders
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={22}
                    className="shrink-0 text-orange-500 transition group-hover:translate-x-1"
                  />
                </Link>

                {/* Order Tiffin */}
                <Link
                  to="/menu"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-gradient-to-r from-amber-50 to-white p-5 transition hover:border-orange-300 hover:shadow-md"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-md shadow-amber-200 transition group-hover:scale-105">
                      <Utensils size={25} />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-extrabold text-gray-900">
                        Order Tiffin
                      </h4>

                      <p className="mt-1 text-sm text-gray-500">
                        Explore fresh meals and thalis
                      </p>
                    </div>
                  </div>

                  <ChevronRight
                    size={22}
                    className="shrink-0 text-orange-500 transition group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-8 flex items-start gap-3 rounded-2xl bg-gray-50 p-4">
              <ShieldCheck size={20}
                className="mt-0.5 shrink-0 text-emerald-600" />

              <p className="text-sm leading-6 text-gray-500">
                Your account information is used to manage
                your TiffinWala orders and customer experience.
              </p>
            </div>
          </div>
        </section>

        {/* Footer Navigation */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm font-semibold text-gray-500">
          <Link to="/" className="transition hover:text-orange-600" >
            Home
          </Link>

          <span className="text-orange-200">•</span>

          <Link to="/menu" className="transition hover:text-orange-600" >
            Menu
          </Link>

          <span className="text-orange-200">•</span>

          <Link to="/my-orders"  className="transition hover:text-orange-600" >
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Profile;