import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Filter, BarChart2 } from "lucide-react";
import { apiFetch } from "../api/client";

type AnalyticsPoint = { x: string; y: string; count: number };

const AXES = [
    { value: "decision", label: "Решение (ALLOW/DENY)" },
    { value: "auth_method", label: "Метод аутентификации" },
    { value: "reason", label: "Причина" },
    { value: "zone_name", label: "Зона" },
    { value: "zone_building", label: "Корпус" },
    { value: "zone_type", label: "Тип зоны" },
    { value: "device_type", label: "Тип устройства" },
    { value: "device_firmware_version", label: "Версия прошивки" },
    { value: "person_role", label: "Роль пользователя" },
    { value: "person_department", label: "Отдел" },
    { value: "person_status", label: "Статус пользователя" },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16"];

export default function Analytics() {
    const [xAxis, setXAxis] = useState("zone_name");
    const [yAxis, setYAxis] = useState("decision");
    const [data, setData] = useState<AnalyticsPoint[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [decision, setDecision] = useState("");
    const [authMethod, setAuthMethod] = useState("");
    const [personRole, setPersonRole] = useState("");
    const [personStatus, setPersonStatus] = useState("");
    const [scoreFrom, setScoreFrom] = useState("");
    const [scoreTo, setScoreTo] = useState("");

    const handleLoad = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set("x_axis", xAxis);
            params.set("y_axis", yAxis);
            if (dateFrom) params.set("date_from", dateFrom);
            if (dateTo) params.set("date_to", dateTo);
            if (decision) params.set("decision", decision);
            if (authMethod) params.set("auth_method", authMethod);
            if (personRole) params.set("person_role", personRole);
            if (personStatus) params.set("person_status", personStatus);
            if (scoreFrom) params.set("recognition_score_from", scoreFrom);
            if (scoreTo) params.set("recognition_score_to", scoreTo);

            const result = await apiFetch<AnalyticsPoint[]>(`/api/v1/analytics/?${params.toString()}`);
            setData(result);
            setHasLoaded(true);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки.");
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = data.map((d) => ({
        name: `${d.x} / ${d.y}`,
        count: d.count,
    }));

    const getAxisLabel = (val: string) => AXES.find((a) => a.value === val)?.label ?? val;

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <BarChart2 className="size-6 text-blue-600" />
                <h1 className="text-2xl font-semibold">Аналитика</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Filter className="size-4" />Параметры
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Ось X</Label>
                            <Select value={xAxis} onValueChange={setXAxis}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {AXES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ось Y</Label>
                            <Select value={yAxis} onValueChange={setYAxis}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {AXES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-4 space-y-3">
                            <p className="text-sm font-medium text-gray-600">Фильтры</p>

                            <div className="space-y-1">
                                <Label className="text-xs">Дата от</Label>
                                <Input type="datetime-local" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Дата до</Label>
                                <Input type="datetime-local" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Решение</Label>
                                <Select value={decision || "all"} onValueChange={(v) => setDecision(v === "all" ? "" : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="ALLOW">ALLOW</SelectItem>
                                        <SelectItem value="DENY">DENY</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Метод аутентификации</Label>
                                <Select value={authMethod || "all"} onValueChange={(v) => setAuthMethod(v === "all" ? "" : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="face">face</SelectItem>
                                        <SelectItem value="voice">voice</SelectItem>
                                        <SelectItem value="card">card</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Роль пользователя</Label>
                                <Select value={personRole || "all"} onValueChange={(v) => setPersonRole(v === "all" ? "" : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="student">Студент</SelectItem>
                                        <SelectItem value="staff">Сотрудник</SelectItem>
                                        <SelectItem value="guest">Гость</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Статус пользователя</Label>
                                <Select value={personStatus || "all"} onValueChange={(v) => setPersonStatus(v === "all" ? "" : v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Все</SelectItem>
                                        <SelectItem value="active">Активен</SelectItem>
                                        <SelectItem value="blocked">Заблокирован</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">Score от</Label>
                                    <Input type="number" min="0" max="1" step="0.01" placeholder="0.0"
                                           value={scoreFrom} onChange={(e) => setScoreFrom(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Score до</Label>
                                    <Input type="number" min="0" max="1" step="0.01" placeholder="1.0"
                                           value={scoreTo} onChange={(e) => setScoreTo(e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleLoad} disabled={isLoading} className="w-full">
                            {isLoading ? "Загрузка..." : "Построить график"}
                        </Button>

                        {error && <div className="text-sm text-red-600">{error}</div>}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">
                            {hasLoaded
                                ? `${getAxisLabel(xAxis)} × ${getAxisLabel(yAxis)}`
                                : "График"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!hasLoaded ? (
                            <div className="flex items-center justify-center h-64 text-gray-400">
                                Выберите параметры и нажмите «Построить график»
                            </div>
                        ) : chartData.length === 0 ? (
                            <div className="flex items-center justify-center h-64 text-gray-400">
                                Нет данных по выбранным фильтрам
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={360}>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Количество" radius={[4, 4, 0, 0]}>
                                        {chartData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </div>

            {hasLoaded && data.length > 0 && (
                <Card>
                    <CardHeader><CardTitle className="text-base">Данные таблицей</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 pr-4 text-gray-500">{getAxisLabel(xAxis)}</th>
                                    <th className="text-left py-2 pr-4 text-gray-500">{getAxisLabel(yAxis)}</th>
                                    <th className="text-right py-2 text-gray-500">Количество</th>
                                </tr>
                                </thead>
                                <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2 pr-4 font-medium">{row.x ?? "—"}</td>
                                        <td className="py-2 pr-4">{row.y ?? "—"}</td>
                                        <td className="py-2 text-right font-mono">{row.count}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}