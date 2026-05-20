import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Plus, Trash2, Edit } from "lucide-react";
import { apiFetch } from "../api/client";

type Schedule = { days: string[]; time_from: string; time_to: string };
type Policy = {
    _id: string; target_type: string; target_id: string;
    allowed_zone_ids: string[]; schedule: Schedule;
    valid_from?: string | null; valid_to?: string | null;
};
type Group = { _id: string; name: string };
type Zone = { _id: string; name: string };

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS: Record<string, string> = {
    Mon: "Пн", Tue: "Вт", Wed: "Ср", Thu: "Чт", Fri: "Пт", Sat: "Сб", Sun: "Вс"
};

export default function Policies() {
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

    const [formData, setFormData] = useState({
        target_type: "group",
        target_id: "",
        allowed_zone_ids: [] as string[],
        schedule: { days: ["Mon","Tue","Wed","Thu","Fri"], time_from: "08:00", time_to: "20:00" },
    });

    useEffect(() => {
        Promise.all([
            apiFetch<Group[]>("/api/v1/groups/"),
            apiFetch<Zone[]>("/api/v1/zones/"),
        ]).then(([g, z]) => { setGroups(g); setZones(z); }).catch(() => {});
        loadPolicies();
    }, []);

    async function loadPolicies() {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiFetch<Policy[]>("/api/v1/policies/");
            setPolicies(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleCreate = () => {
        setEditingPolicy(null);
        setFormData({
            target_type: "group",
            target_id: "",
            allowed_zone_ids: [],
            schedule: { days: ["Mon","Tue","Wed","Thu","Fri"], time_from: "08:00", time_to: "20:00" },
        });
        setIsDialogOpen(true);
    };

    const handleEdit = (p: Policy) => {
        setEditingPolicy(p);
        setFormData({
            target_type: p.target_type,
            target_id: p.target_id,
            allowed_zone_ids: p.allowed_zone_ids,
            schedule: p.schedule,
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setError(null);
        try {
            if (editingPolicy) {
                await apiFetch(`/api/v1/policies/${editingPolicy._id}/`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
            } else {
                await apiFetch("/api/v1/policies/", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
            }
            setIsDialogOpen(false);
            await loadPolicies();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка сохранения.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить политику доступа?")) return;
        try {
            await apiFetch(`/api/v1/policies/${id}/`, { method: "DELETE" });
            await loadPolicies();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка удаления.");
        }
    };

    const toggleDay = (day: string) => {
        const days = formData.schedule.days.includes(day)
            ? formData.schedule.days.filter((d) => d !== day)
            : [...formData.schedule.days, day];
        setFormData({ ...formData, schedule: { ...formData.schedule, days } });
    };

    const toggleZone = (zoneId: string) => {
        const ids = formData.allowed_zone_ids.includes(zoneId)
            ? formData.allowed_zone_ids.filter((id) => id !== zoneId)
            : [...formData.allowed_zone_ids, zoneId];
        setFormData({ ...formData, allowed_zone_ids: ids });
    };

    const getGroupName = (id: string) => groups.find((g) => g._id === id)?.name ?? id.slice(-6);
    const getZoneName = (id: string) => zones.find((z) => z._id === id)?.name ?? id.slice(-6);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Политики доступа</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? "Загрузка..." : `Показано: ${policies.length}`}
                    </p>
                </div>
                <Button onClick={handleCreate}><Plus className="size-4 mr-2" />Добавить</Button>
            </div>

            {error && <div className="text-sm text-red-600 mb-4">{error}</div>}

            <div className="bg-white rounded-lg border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Группа</TableHead>
                            <TableHead>Зоны доступа</TableHead>
                            <TableHead>Дни</TableHead>
                            <TableHead>Время</TableHead>
                            <TableHead className="text-right w-[100px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
                        ) : policies.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Нет политик</TableCell></TableRow>
                        ) : policies.map((p) => (
                            <TableRow key={p._id}>
                                <TableCell className="font-medium">{getGroupName(p.target_id)}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {p.allowed_zone_ids.map((zid) => (
                                            <Badge key={zid} variant="secondary" className="text-xs">{getZoneName(zid)}</Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {p.schedule.days.map((d) => DAY_LABELS[d] ?? d).join(", ")}
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                    {p.schedule.time_from} – {p.schedule.time_to}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(p)}><Edit className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(p._id)}><Trash2 className="size-4 text-red-600" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPolicy ? "Редактировать политику" : "Добавить политику"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Группа</Label>
                            <select
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                                value={formData.target_id}
                                onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                            >
                                <option value="">Выберите группу</option>
                                {groups.map((g) => (
                                    <option key={g._id} value={g._id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label>Зоны доступа</Label>
                            <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                                {zones.map((z) => (
                                    <label key={z._id} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.allowed_zone_ids.includes(z._id)}
                                            onChange={() => toggleZone(z._id)}
                                        />
                                        <span className="text-sm">{z.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Дни недели</Label>
                            <div className="flex gap-2 flex-wrap">
                                {ALL_DAYS.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`px-3 py-1 rounded-md text-sm border transition-colors ${
                                            formData.schedule.days.includes(day)
                                                ? "bg-blue-600 text-white border-blue-600"
                                                : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        {DAY_LABELS[day]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Время от</Label>
                                <Input
                                    type="time"
                                    value={formData.schedule.time_from}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        schedule: { ...formData.schedule, time_from: e.target.value }
                                    })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Время до</Label>
                                <Input
                                    type="time"
                                    value={formData.schedule.time_to}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        schedule: { ...formData.schedule, time_to: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        {error && <div className="text-sm text-red-600">{error}</div>}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                        <Button onClick={handleSave}>Сохранить</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}