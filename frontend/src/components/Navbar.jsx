import { Link, NavLink } from "react-router-dom";

const linkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition hover:bg-white/10";
const active = "bg-white/10 text-white";
const inactive = "text-white/80";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400" />
          <div className="leading-tight">
            <div className="text-white font-extrabold tracking-tight">CompareHub</div>
            <div className="text-white/60 text-xs">Best price across stores</div>
          </div>
        </Link>
        <Link to="/analytics">Analytics</Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? active : inactive}`
            }
          >
            Admin
          </NavLink>
          <NavLink
  to="/wishlist"
  className={({ isActive }) =>
    `${linkBase} ${isActive ? active : inactive}`
  }
>
  Wishlist
</NavLink>
<Link to="/analytics">Analytics</Link>

        </nav>
      </div>
    </header>
  );
}
