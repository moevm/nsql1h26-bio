import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, FileText, Map,
  Database, Shield, LogOut, Layers, Server, GitBranch,
} from "lucide-react";
import { clearToken, apiFetch } from "../api/client";

type UserMe = { username: string; role: string; full_name: string };

export default function Root() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    apiFetch<UserMe>("/api/v1/auth/me")
        .then(setUser)
        .catch(() => {});
  }, []);

  const initials = user?.full_name
      ? user.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "?";

  const navItems = [
    { path: "/", label: "Дашборд", icon: LayoutDashboard, exact: true },
    { path: "/people", label: "Люди", icon: Users },
    { path: "/groups", label: "Группы", icon: GitBranch },
    { path: "/zones", label: "Зоны", icon: Map },
    { path: "/devices", label: "Устройства", icon: Server },
    { path: "/events", label: "События", icon: FileText },
    { path: "/import-export", label: "Импорт/Экспорт", icon: Database },
  ];

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  return (
      <div className="flex h-screen bg-gray-50">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="size-8 text-blue-600" />
              <div>
                <h1 className="font-semibold">Система доступа</h1>
                <p className="text-xs text-gray-500">Биометрический контроль</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 overflow-y-auto">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                            isActive ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                        }`
                    }
                >
                  <item.icon className="size-5" />
                  <span>{item.label}</span>
                </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 space-y-2">
            <button
                onClick={() => navigate("/profile")}
                className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
            >
              <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                <span className="text-sm font-semibold">{initials}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium truncate">{user?.full_name ?? "..."}</p>
                <p className="text-xs text-gray-500">{user?.role ?? ""}</p>
              </div>
            </button>
            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="size-4" />
              <span>Выйти</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
  );
}