import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', label: 'Overview',     icon: '▦' },
  { to: '/expenses',  label: 'Transactions', icon: '↕' },
  { to: '/budgets',   label: 'Budgets',      icon: '◎' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setOpen(false);
    navigate('/login');
  };

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#2D2D2D]">
        <span className="text-white font-bold text-lg tracking-wide">Retain</span>
        <button onClick={() => setOpen(!open)} className="text-white text-2xl leading-none">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-56 bg-[#2D2D2D] flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="px-6 py-6 hidden md:block">
          <span className="text-white font-bold text-xl tracking-wide">Retain</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 mt-2 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-[#0B2545]'
                    : 'text-[#9CA3AF] hover:text-white hover:bg-white/10'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-6">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-white/10 transition-colors"
          >
            <span className="text-base">⎋</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
