import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { clearToken, isLoggedIn } from "../lib/auth";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `px-3 py-2 rounded-lg text-sm font-semibold transition ${
          isActive
            ? "text-indigo-700 bg-indigo-50"
            : "text-slate-700 hover:text-indigo-700 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function IconBox({ children }) {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
      {children}
    </span>
  );
}

export default function Layout({ children }) {
  const nav = useNavigate();
  const location = useLocation();
  const logged = isLoggedIn();

  const currentQ = new URLSearchParams(location.search).get("q") || "";

  const logout = () => {
    clearToken();
    nav("/login");
  };

  return (
    <div className="min-h-screen bg-store text-slate-900">
      {/* Top strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-2 text-xs text-slate-500 flex items-center justify-between">
          <span>CompareHub • Find the best deals across stores</span>
          <span className="hidden sm:flex items-center gap-3">
            <a className="hover:text-indigo-700" href="https://support.google.com/" target="_blank" rel="noreferrer">Support</a>
            <span className="text-slate-300">|</span>
            <a className="hover:text-indigo-700" href="https://www.wikihow.com/Compare-Prices" target="_blank" rel="noreferrer">FAQ</a>
            <span className="text-slate-300">|</span>
            <a className="hover:text-indigo-700" href="https://www.consumerfinance.gov/" target="_blank" rel="noreferrer">Consumer tips</a>
          </span>
        </div>
      </div>

      {/* Main navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 shadow-sm grid place-items-center overflow-hidden">
              <img src="/logo.svg" alt="CompareHub logo" className="h-8 w-8" />
            </div>
            <div className="leading-none">
              <div className="font-extrabold tracking-tight text-lg">CompareHub</div>
              <div className="text-xs text-slate-500">Compare across stores</div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="flex-1 hidden md:flex items-center">
            <div className="w-full flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-3 text-xs font-semibold text-slate-600 border-r border-slate-200 bg-slate-50 h-11 flex items-center">
                All Categories
              </div>
              <input
                className="flex-1 h-11 px-3 text-sm outline-none"
                placeholder="Search for products, brands..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") nav(`/?q=${encodeURIComponent(e.target.value)}`);
                }}
                defaultValue={currentQ}
              />
              <button
                className="h-11 px-4 bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
                onClick={(e) => {
                  const input = e.currentTarget
                    .closest("div")
                    ?.querySelector("input");
                  const val = input?.value ?? "";
                  nav(`/?q=${encodeURIComponent(val)}`);
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("/wishlist")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-700"
              title="Wishlist"
            >
              <IconBox>♡</IconBox>
              <span className="hidden lg:block">Wishlist</span>
            </button>

            <button
              onClick={() => nav("/compare")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-indigo-700"
              title="Compare"
            >
              <IconBox>⇄</IconBox>
              <span className="hidden lg:block">Compare</span>
            </button>

            {logged ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => nav("/admin")}
                  className="hidden lg:inline-flex px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                >
                  Admin
                </button>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white font-semibold hover:bg-slate-100 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => nav("/login")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
              >
                Account
              </button>
            )}
          </div>
        </div>

        {/* Secondary nav */}
        <div className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center gap-2 overflow-x-auto">
            <NavItem to="/">Home</NavItem>
            <NavItem to="/wishlist">Wishlist</NavItem>
            <NavItem to="/compare">Compare</NavItem>
            <NavItem to="/analytics">Analytics</NavItem>
            <NavItem to="/admin">Admin</NavItem>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-white border border-slate-200 shadow-sm grid place-items-center overflow-hidden">
                  <img src="/logo.svg" alt="CompareHub" className="h-8 w-8" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900">CompareHub</div>
                  <div className="text-sm text-slate-500">Compare prices, save time, buy smarter.</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-slate-500">
                © {new Date().getFullYear()} CompareHub — Go + PostgreSQL + React
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="text-sm font-extrabold text-slate-900">App</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li><Link className="hover:text-indigo-700" to="/">Home</Link></li>
                <li><Link className="hover:text-indigo-700" to="/wishlist">Wishlist</Link></li>
                <li><Link className="hover:text-indigo-700" to="/compare">Compare</Link></li>
                <li><Link className="hover:text-indigo-700" to="/analytics">Analytics</Link></li>
              </ul>
            </div>

            <div className="md:col-span-4">
              <div className="text-sm font-extrabold text-slate-900">Popular stores</div>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                <li><a className="hover:text-indigo-700" href="https://www.amazon.com" target="_blank" rel="noreferrer">Amazon</a></li>
                <li><a className="hover:text-indigo-700" href="https://www.bestbuy.com" target="_blank" rel="noreferrer">Best Buy</a></li>
                <li><a className="hover:text-indigo-700" href="https://www.walmart.com" target="_blank" rel="noreferrer">Walmart</a></li>
                <li><a className="hover:text-indigo-700" href="https://www.target.com" target="_blank" rel="noreferrer">Target</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
