import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Users, Activity, AlertTriangle, CheckCircle } from "lucide-react";

const peakLoadData = [
  { time: "00:00", проходы: 5 },
  { time: "02:00", проходы: 2 },
  { time: "04:00", проходы: 1 },
  { time: "06:00", проходы: 15 },
  { time: "08:00", проходы: 145 },
  { time: "10:00", проходы: 89 },
  { time: "12:00", проходы: 167 },
  { time: "14:00", проходы: 123 },
  { time: "16:00", проходы: 98 },
  { time: "18:00", проходы: 156 },
  { time: "20:00", проходы: 45 },
  { time: "22:00", проходы: 12 },
];

const buildingData = [
  { корпус: "Главный", проходы: 1245 },
  { корпус: "Лаборатории", проходы: 567 },
  { корпус: "Библиотека", проходы: 432 },
  { корпус: "Спортзал", проходы: 289 },
];

const biometricData = [
  { name: "Лицо", value: 1856, color: "#3b82f6" },
  { name: "Голос", value: 423, color: "#10b981" },
  { name: "Карта", value: 254, color: "#f59e0b" },
];

const recentEvents = [
  { id: 1, user: "Иванов И.И.", location: "Серверная", time: "10:23", status: "success", method: "Лицо" },
  { id: 2, user: "Петрова А.С.", location: "Лаборатория 5", time: "10:21", status: "success", method: "Голос" },
  { id: 3, user: "Неизвестный", location: "Серверная", time: "10:18", status: "failed", method: "Карта" },
  { id: 4, user: "Сидоров П.К.", location: "Главный вход", time: "10:15", status: "success", method: "Лицо" },
  { id: 5, user: "Козлова Е.Н.", location: "Библиотека", time: "10:12", status: "success", method: "Карта" },
];

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Статистика и мониторинг</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего сотрудников</CardTitle>
            <Users className="size-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">1,247</div>
            <p className="text-xs text-gray-500 mt-1">+12 за неделю</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Проходов сегодня</CardTitle>
            <Activity className="size-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">2,533</div>
            <p className="text-xs text-green-600 mt-1">↑ 8% от вчера</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Успешных входов</CardTitle>
            <CheckCircle className="size-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">2,501</div>
            <p className="text-xs text-gray-500 mt-1">98.7% успеха</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Неудачных попыток</CardTitle>
            <AlertTriangle className="size-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">32</div>
            <p className="text-xs text-gray-500 mt-1">Требуют внимания</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Пиковые нагрузки на проходной</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={peakLoadData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="проходы" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Загруженность корпусов</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={buildingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="корпус" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="проходы" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Методы аутентификации</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={biometricData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {biometricData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Последние события</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className={`size-2 rounded-full ${event.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.user}</p>
                    <p className="text-xs text-gray-500">{event.location} • {event.method}</p>
                  </div>
                  <div className="text-xs text-gray-400">{event.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
