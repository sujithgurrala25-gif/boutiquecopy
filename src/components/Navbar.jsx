import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  Scissors,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function getNavItems(role) {
  if (role === "admin") {
    return [{ to: "/admin-dashboard", label: "Admin Dashboard", icon: LayoutDashboard }];
  }

  if (role === "user") {
    return [
      { to: "/", label: "Home", icon: Home },
      { to: "/user-dashboard", label: "User Dashboard", icon: UserRound },
      { to: "/select-outfit", label: "Select Outfit", icon: Sparkles },
      { to: "/previous-orders", label: "Previous Orders", icon: ShoppingBag },
      { to: "/feedback", label: "Feedback", icon: MessageSquareText },
    ];
  }

  return [{ to: "/", label: "Home", icon: Home }];
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  const linkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
      isActive ? "bg-plum text-white" : "text-plum hover:bg-lavender/60"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-cream/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to={user?.role === "admin" ? "/admin-dashboard" : "/"}
          className="flex items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <span className="grid h-11 w-11 place-items-center rounded-md bg-plum text-white shadow-aura">
            <Scissors size={22} />
          </span>
          <span>
            <span className="block font-display text-xl font-bold text-plum">StitchAura</span>
            <span className="block text-xs font-bold uppercase text-gold">Boutique</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={linkClass}>
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <span className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-plum shadow-sm">
                {user.name} · {user.role || "user"}
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary py-2">
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary py-2">
              <LogIn size={17} />
              Login
            </Link>
          )}
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-md bg-white text-plum shadow-sm lg:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/80 bg-cream px-4 py-4 shadow-aura lg:hidden">
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
                  <Icon size={17} />
                  {item.label}
                </NavLink>
              );
            })}

            {user ? (
              <button type="button" onClick={handleLogout} className="btn-secondary mt-2">
                <LogOut size={17} />
                Logout
              </button>
            ) : (
              <Link to="/login" className="btn-primary mt-2" onClick={() => setOpen(false)}>
                <LogIn size={17} />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
