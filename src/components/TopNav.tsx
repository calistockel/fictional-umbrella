import { NavLink } from "react-router-dom";
import { Compass, Bell, Bookmark, BarChart3 } from "lucide-react";
import { useSaved } from "../lib/SavedContext";

const navItems = [
  { to: "/", label: "Discover", icon: Compass, end: true },
  { to: "/intelligence", label: "Intelligence", icon: BarChart3, end: false },
  { to: "/saved", label: "Saved", icon: Bookmark, end: false },
  { to: "/alerts", label: "Alerts", icon: Bell, end: false },
];

export function TopNav() {
  const { savedIds } = useSaved();

  return (
    <header className="sticky top-0 z-40 border-b border-ink-150 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-8 px-6">
        <NavLink to="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-ink-900">
            <span className="h-2 w-2 rounded-sm bg-white" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-ink-900">Meridian</span>
        </NavLink>

        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors ${
                  isActive ? "bg-ink-100 text-ink-900" : "text-ink-500 hover:text-ink-900"
                }`
              }
            >
              <Icon size={15} strokeWidth={2} />
              {label}
              {label === "Saved" && savedIds.length > 0 && (
                <span className="ml-0.5 rounded-full bg-ink-200 px-1.5 py-0.5 text-[10.5px] font-semibold text-ink-700 tabular">
                  {savedIds.length}
                </span>
              )}
              {label === "Alerts" && (
                <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-[12.5px] text-ink-400 sm:inline">Brussels + Flanders</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900 text-[12px] font-semibold text-white">
            JV
          </div>
        </div>
      </div>
    </header>
  );
}
