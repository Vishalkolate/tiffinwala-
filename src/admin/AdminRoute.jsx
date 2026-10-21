import { Navigate, Outlet } from "react-router-dom";

export default function AdminRoute() {
  const token = localStorage.getItem("admin-token");

  let user = null;

  try {
    const savedUser = localStorage.getItem("admin-user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    console.error("Invalid admin user data:", error);
    user = null;
  }

  
  if (!token || !user) {
    return <Navigate to="/admin-login" replace />;
  }

  if (user.is_staff !== true && user.is_superuser !== true) {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}