import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { Users, Activity, AlertTriangle, CheckCircle } from "lucide-react";
import { apiFetch } from "../api/client";

type LogEvent = {
  _id: string; timestamp: string; person_id: string;
  zone_id: string; auth_method: string; decision: string;
};
type Person = { _id: string; full_name: string };
type Zone = { _id: string; name: string };

export default function Dashboard() {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<LogEvent[]>("/api/v1/events/"),
      apiFetch<Person[]>("/api/v1/people/"),
      apiFetch<Zone[]>("/api/v1/zones/"),
    ]).then(([evs, ppl, zns]) => {
      setEvents(evs);
      setPeople(ppl);
      setZones(zns);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const allowCount = events.filter((e) => e.decision.toUpperCase() === "ALLOW").length;
  const denyCount = events.filter((e) => e.decision.toUpperCase() === "DENY").length;

  const methodMap: Record<string, number> = {};
  events.forEach((e) => { methodMap[e.auth_method] = (methodMap[e.auth_method] ?? 0) + 1; });
  const methodData = Object.entries(methodMap).map(([name, value]) => ({ name, value }));
  const methodColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

  const zoneNameMap: Record<string, string> = {};
  zones.forEach((z) => { zoneNameMap[z._id] = z.name; });
  const zoneMap: Record<string, number> = {};
  events.forEach((e) => { zoneMap[e.zone_id] = (zoneMap[e.zone_id] ?? 0) + 1; });
  const zoneData = Object.entries(zoneMap).map(([id, count]) => ({
    name: zoneNameMap[id] ?? id.slice(-6),
    проходы: count,
  }));

  const personNameMap: Record<string, string> = {};
  people.forEach((p) => { personNameMap[p._id] = p.full_name; });
  const recentEvents = [...events]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

  if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;

  return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Статистика и мониторинг</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Всего людей</CardTitle>
              <Users className="size-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{people.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Всего событий</CardTitle>
              <Activity className="size-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{events.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Успешных проходов</CardTitle>
              <CheckCircle className="size-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-green-600">{allowCount}</div>
              <p className="text-xs text-gray-500 mt-1">
                {events.length > 0 ? `${((allowCount / events.length) * 100).toFixed(1)}% успеха` : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Отказов</CardTitle>
              <AlertTriangle className="size-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-red-600">{denyCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle>Проходы по зонам</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={zoneData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="проходы" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Методы аутентификации</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                      data={methodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                  >
                    {methodData.map((_, index) => (
                        <Cell key={index} fill={methodColors[index % methodColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Последние события</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Нет событий</p>
              ) : recentEvents.map((event) => (
                  <div key={event._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`size-2 rounded-full ${
                        event.decision.toUpperCase() === "ALLOW" ? "bg-green-500" : "bg-red-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {personNameMap[event.person_id] ?? event.person_id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {zoneNameMap[event.zone_id] ?? event.zone_id.slice(-8)} • {event.auth_method}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  );
}