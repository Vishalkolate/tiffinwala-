
import { NavLink } from "react-router-dom";
import {  LayoutDashboard,  ShoppingBag,  Utensils,  Users,  ChefHat,  House,  X,} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    path: "/admin-dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    path: "/admin-dashboard/orders",
    icon: ShoppingBag,
  },
  {
    name: "Tiffins",
    path: "/admin-dashboard/tiffins",
    icon: Utensils,
  },
  {
    name: "Customers",
    path: "/admin-dashboard/customers",
    icon: Users,
  },
];

export default function AdminSidebar({
  open = false,
  onClose = () => {},
}) {
  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <button  type="button" aria-label="Close sidebar overlay"  onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <NavLink to="/admin-dashboard"  onClick={onClose}
            className="flex items-center gap-3" >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500 text-white">
              <ChefHat size={26} />
            </div>

            <div>
              <h1 className="text-lg font-extrabold text-gray-900">
                Tiffin<span className="text-orange-600">Wala</span>
              </h1>

              <p className="text-xs text-gray-500">
                Admin Panel
              </p>
            </div>
          </NavLink>

          {/* Close Button */}
          <button  type="button" onClick={onClose} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
            aria-label="Close sidebar" >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Management
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink  key={item.path}  to={item.path} end={item.path === "/admin-dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-orange-500 text-white shadow-md shadow-orange-100"
                      : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                  }`
                }
              >
                <Icon size={21} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom - View Website */}
        <div className="border-t border-gray-200 p-4">
          <NavLink to="/" onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-100"
          >
            <House size={20} />
            View Website
          </NavLink>
        </div>
      </aside>
    </>
  );
}
