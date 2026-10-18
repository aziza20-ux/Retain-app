import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const userNavItems = [
  { to: "/dashboard", label: "Overview", icon: "▦" },
  { to: "/expenses", label: "Transactions", icon: "↕" },
  { to: "/budgets", label: "Budgets", icon: "◎" },
];

const adminNavItems = [
  { to: "/admin", label: "Dashboard", icon: "▦" },
  { to: "/admin/categories", label: "Manage Categories", icon: "⊞" },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { logout, role, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    navigate("/login");
  };

  const navItems = role === "ADMIN" ? adminNavItems : userNavItems;

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#2D2D2D]">
        <span className="text-white font-bold text-lg tracking-wide">
          Retain
        </span>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white text-2xl leading-none"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          bg-[#2D2D2D] flex flex-col
          transform transition-all duration-200
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          ${collapsed ? "w-14" : "w-56"}
        `}
      >
        {/* Brand + collapse toggle */}
        <div
          className={`flex items-center py-5 hidden md:flex ${collapsed ? "justify-center px-0" : "justify-between px-4"}`}
        >
          {!collapsed && (
            <span className="text-white font-bold text-xl tracking-wide">
              Retain
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-[#9CA3AF] hover:text-white transition-colors text-sm leading-none"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* User info */}
        {user && !collapsed && (
          <div className="px-4 pb-3 hidden md:block">
            <p className="text-xs text-[#9CA3AF] truncate">{user.name}</p>
            {role === "ADMIN" && (
              <span className="text-xs font-medium text-yellow-400">Admin</span>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 mt-2 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-white text-[#0B2545]"
                    : "text-[#9CA3AF] hover:text-white hover:bg-white/10"
                }`
              }
            >
              <span className="text-base shrink-0">{icon}</span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-2 pb-6">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <span className="text-base shrink-0">⎋</span>
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
