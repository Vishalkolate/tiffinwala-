import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react";
import axios from "axios";

const API = "/api/auth";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Send email and password to Django login API
      const response = await axios.post(
        `${API}/login/`,
        {
          email: email.trim(),
          password: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      // Axios response data is available directly in response.data
      const data = response.data;

      // console.log("Login response:", data);

      // Check if authentication token is received
      if (!data.token) {
        throw new Error(
          "Login successful response did not contain a token. Check Django login API response."
        );
      }

      // Save authentication token
      localStorage.setItem("tiffin-token", data.token);

      // Save user details if available
      if (data.user) {
        localStorage.setItem(
          "tiffin-user",
          JSON.stringify(data.user)
        );
      } else {
        localStorage.removeItem("tiffin-user");
      }

      // Notify Navbar about login
      window.dispatchEvent(
        new Event("tiffin-auth-changed")
      );

      // Redirect to home page
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      // Get error message from Django backend
      const backendError = err.response?.data;

      let errorMessage = "Login failed. Please try again.";

      if (backendError) {
        if (typeof backendError === "string") {
          errorMessage = backendError;
        } else if (backendError.detail) {
          errorMessage = backendError.detail;
        } else if (backendError.error) {
          errorMessage = backendError.error;
        } else if (backendError.message) {
          errorMessage = backendError.message;
        } else {
          errorMessage = JSON.stringify(backendError);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[75vh] bg-orange-50 px-4 py-12 flex items-center justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-xl sm:p-9">

        {/* Logo */}
        <Link  to="/"
          className="mb-7 flex items-center justify-center gap-2"
        >
          <UtensilsCrossed
            className="text-orange-600"
            size={30}
          />

          <span className="text-2xl font-extrabold text-gray-900">
            Tiffin
            <span className="text-orange-600">Wala</span>
          </span>
        </Link>

        {/* Heading */}
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Welcome Back!
        </h1>

        <p className="mt-2 text-center text-gray-500">
          Log in to your account to continue.
        </p>

        {/* Error Message */}
        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form  onSubmit={handleSubmit}
          className="mt-7 space-y-5">

          {/* Email Address */}
          <div>
            <label htmlFor="login-email"
              className="mb-2 block text-sm font-semibold text-gray-700">
              Email Address
            </label>

            <input id="login-email" type="email" autoComplete="email" required  value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="login-password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              <input id="login-password" type={showPassword ? "text" : "password"}  autoComplete="current-password"  required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-12 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <button  type="button"  onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button  type="submit" disabled={loading}
            className="w-full rounded-xl bg-orange-600 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link  to="/signup"
            className="font-bold text-orange-600 hover:underline" >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
}