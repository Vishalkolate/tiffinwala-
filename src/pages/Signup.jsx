import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {  Eye,  EyeOff, UtensilsCrossed,  User,  Mail,  Phone,  Lock,} from "lucide-react";
import axios from "axios";

const API = "/api/auth";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.full_name.trim() ||
      !formData.email.trim() ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Correct Axios POST request
      const response = await axios.post(
        `${API}/register/`,
        {
          full_name: formData.full_name.trim(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          password: formData.password,
          confirm_password: formData.confirmPassword,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const data = response.data;

      // console.log("Registration response:", data);

      // Save token if backend returns one
      if (data.token) {
        localStorage.setItem("tiffin-token", data.token);
      } else {
        localStorage.removeItem("tiffin-token");
      }

      // Save user details if backend returns them
      if (data.user) {
        localStorage.setItem(
          "tiffin-user",
          JSON.stringify(data.user)
        );
      } else {
        localStorage.removeItem("tiffin-user");
      }

      // Notify Navbar if user is automatically logged in
      if (data.token && data.user) {
        window.dispatchEvent(
          new Event("tiffin-auth-changed")
        );
      }

      setSuccess("Your account has been created successfully!");

      // Redirect after successful registration
      setTimeout(() => {
        navigate(data.token && data.user ? "/" : "/login");
      }, 1000);

    } catch (err) {
      console.error("Signup error:", err);

      const backendError = err.response?.data;

      let errorMessage = "Unable to create your account.";

      if (backendError) {
        if (typeof backendError === "string") {
          errorMessage = backendError;
        } else if (backendError.detail) {
          errorMessage = backendError.detail;
        } else if (backendError.message) {
          errorMessage = backendError.message;
        } else if (backendError.error) {
          errorMessage = backendError.error;
        } else {
          errorMessage = Object.entries(backendError)
            .map(([field, messages]) => {
              const message = Array.isArray(messages)
                ? messages.join(" ")
                : String(messages);

              return `${field}: ${message}`;
            })
            .join(" ");
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-gray-800 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100";

  return (
    <div className="flex min-h-screen items-center justify-center bg-orange-50 px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

        {/* Left Section */}
        <div className="hidden flex-col justify-center bg-orange-600 p-10 text-white md:flex">
          <div className="mb-8 flex items-center gap-3">
            <div className="rounded-xl bg-white p-3 text-orange-600">
              <UtensilsCrossed size={30} />
            </div>

            <span className="text-3xl font-bold">
              Tiffin<span className="text-orange-200">Wala</span>
            </span>
          </div>

          <h1 className="mb-4 text-4xl font-bold italic tracking-wide leading-tight">
            Homemade Happiness, Delivered Daily.
          </h1>

          <p className="text-lg leading-8 text-orange-100">
            Create your account and enjoy fresh, delicious meals made with
            homely care.
          </p>

          <div className="mt-8 rounded-2xl bg-white/10 p-5">
            <p className="text-lg font-semibold">
              Ghar Jaisa Khana!
            </p>

            <p className="mt-1 text-sm text-orange-100">
              Fresh • Healthy • Homemade
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="p-6 sm:p-10">
          <div className="mb-8 text-center md:text-left">
            <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-orange-600 md:hidden">
              <UtensilsCrossed size={28} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Create Account
            </h2>

            <p className="mt-2 text-gray-500">
              Join TiffinWala and get started.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full Name *
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19}
                />

                <input id="full_name" name="full_name" type="text" autoComplete="name"
                  placeholder="Enter your full name"  value={formData.full_name} onChange={handleChange} className={inputClass} required  />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email Address *
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19} />

                <input id="email"  name="email" type="email"  autoComplete="email"
                  placeholder="you@example.com" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone"  className="mb-2 block text-sm font-medium text-gray-700" >  Phone Number </label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={19} />

                <input id="phone" name="phone" type="tel" autoComplete="tel"
                  placeholder="Enter phone number" value={formData.phone} onChange={handleChange} className={inputClass} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label  htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"  >
                Password *
              </label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19} />

                <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters"
                  value={formData.password} onChange={handleChange} className={`${inputClass} pr-12`} minLength={8}  required />

                <button  type="button" onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700" >
                Confirm Password *
              </label>

              <div className="relative">
                <Lock  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={19} />

                <input id="confirmPassword"  name="confirmPassword"  type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                  placeholder="Re-enter your password" value={formData.confirmPassword}  onChange={handleChange} className={`${inputClass} pr-12`} required />

                <button  type="button"
                  onClick={() =>
                    setShowConfirmPassword((value) => !value) }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-orange-600 py-3.5 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}