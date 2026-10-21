
import { Menu, LogOut, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const API_URL = "/api";

export default function AdminNavbar({
  onMenuClick = () => {},
}) {
  const navigate = useNavigate();

  const [logoutLoading, setLogoutLoading] = useState(false);

  // Get admin details
  const adminName = localStorage.getItem("tiffin-user");

  let displayName = "Administrator";

  try {
    const user = JSON.parse(adminName || "{}");

    displayName =
      user.full_name ||
      user.first_name ||
      user.username ||
      user.email ||
      "Administrator";
  } catch {
    displayName = "Administrator";
  }

  // Logout
  async function handleLogout() {
    if (logoutLoading) return;

    const token = localStorage.getItem("tiffin-token");

    setLogoutLoading(true);

    try {
      if (token) {
        await axios.post(
          `${API_URL}/auth/logout/`,
          {},
          {
            headers: {
              Authorization: `Token ${token}`,
              Accept: "application/json",
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // Clear local authentication
      localStorage.removeItem("tiffin-token");
      localStorage.removeItem("tiffin-user");

      // Notify other components
      window.dispatchEvent(
        new Event("tiffin-auth-changed")
      );

      setLogoutLoading(false);

      // Redirect to login
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">

      {/* Left Section */}
      <div className="flex items-center gap-3">

        {/* Mobile Sidebar Button */}
        <button type="button" onClick={onMenuClick}  aria-label="Open sidebar"
          className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-orange-50 hover:text-orange-600 lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Dashboard Title */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Admin Dashboard
          </h2>

          <p className="hidden text-xs text-gray-500 sm:block">
            Manage your tiffin business
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">

        {/* Admin Profile */}
        <div className="hidden items-center gap-2 sm:flex">

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
            <UserRound size={21} />
          </div>

          <div className="max-w-40">
            <p className="truncate text-sm font-bold text-gray-800">
              {displayName}
            </p>

            <p className="text-xs text-gray-500">
              Administrator
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button type="button"  onClick={handleLogout} disabled={logoutLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50 sm:px-4"
        >
          <LogOut size={18} />

          <span className="hidden sm:inline">
            {logoutLoading ? "Logging out..." : "Logout"}
          </span>
        </button>
      </div>
    </header>
  );
}
