import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main content starts after the sidebar and topbar */}
      <div className="mt-0 ml-0 min-w-0 md:ml-64">
        <main className="min-w-0 md:pt-[72px]">
          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
}