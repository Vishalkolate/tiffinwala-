
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

const API = "/api/auth";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API}/login/`,
        {
          email: email.trim(),
          password,
          login_type: "admin",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const token = response.data?.token;
const user = response.data?.user;

if (!token || !user) {
  throw new Error("Admin login information was not received.");
}

if (user.is_staff !== true && user.is_superuser !== true) {
  throw new Error("This account is not authorized for Admin Dashboard.");
}

localStorage.setItem("admin-token", token);
localStorage.setItem("admin-user", JSON.stringify(user));

navigate("/admin-dashboard", { replace: true });
        
    } catch (err) {
      console.error("Admin login error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Back to Website
        </Link>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          {/* Header */}
          <div className="bg-gray-900 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500">
              <ShieldCheck size={34} />
            </div>

            <h1 className="text-2xl font-extrabold">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-gray-300">
              Sign in to manage your TiffinWala business
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}  className="space-y-5 p-6 sm:p-8" >  {error && (

              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" >
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-gray-700"  > Admin Email </label>

              <div className="relative">
                <Mail size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                <input id="admin-email" type="email" value={email}  onChange={(event) => setEmail(event.target.value)}  placeholder="Enter admin email"  autoComplete="username" required
                  disabled={loading}  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label  htmlFor="admin-password"
                className="mb-2 block text-sm font-bold text-gray-700" >
                Password
              </label>

              <div className="relative">
                <Lock size={19} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />

                <input  id="admin-password" type={showPassword ? "text" : "password"}
                  value={password}  onChange={(event) => setPassword(event.target.value)} placeholder="Enter admin password" autoComplete="current-password" required disabled={loading}
                  className="w-full rounded-xl border border-gray-300 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100" />

                <button type="button"  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900" >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button  type="submit" disabled={loading || !email.trim() || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60" >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login to Admin Dashboard"
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              This login is only for authorized administrators.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
