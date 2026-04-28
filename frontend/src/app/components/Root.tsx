import { Outlet, NavLink, useNavigate } from "react-router";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Map, 
  Database,
  Shield
} from "lucide-react";

export default function Root() {
  const navigate = useNavigate();
  
  const navItems = [
    { path: "/", label: "Дашборд", icon: LayoutDashboard, exact: true },
    { path: "/people", label: "Сотрудники", icon: Users },
    { path: "/events", label: "Логи событий", icon: FileText },
    { path: "/map", label: "Карта помещений", icon: Map },
    { path: "/import-export", label: "Импорт/Экспорт", icon: Database },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
        
        <nav className="flex-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <item.icon className="size-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
          >
            <div className="size-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
              <span className="text-sm font-semibold">АБ</span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate">Администратор</p>
              <p className="text-xs text-gray-500">Безопасность</p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}