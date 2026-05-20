import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Plus, Edit, Trash2, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

type Device = { _id: string; name?: string; type: string; zone_id: string; firmware_version: string };
type Zone = { _id: string; name: string };

const PAGE_SIZE = 5;

export default function Devices() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);
    const [typeFilter, setTypeFilter] = useState("");
    const [page, setPage] = useState(0);
    const [formData, setFormData] = useState({ type: "", zone_id: "", firmware_version: "" });
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch<Zone[]>("/api/v1/zones/?limit=1000").then(setZones).catch(() => {});
    }, []);

    async function loadDevices() {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (typeFilter.trim()) params.set("type", typeFilter.trim());
            params.set("skip", String(page * PAGE_SIZE));
            params.set("limit", String(PAGE_SIZE));
            const data = await apiFetch<Device[]>(`/api/v1/devices/?${params.toString()}`);
            setDevices(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setPage(0);
    }, [typeFilter]);

    useEffect(() => {
        const h = window.setTimeout(loadDevices, 250);
        return () => window.clearTimeout(h);
    }, [typeFilter, page]);

    const handleCreate = () => {
        setEditingDevice(null);
        setFormData({ type: "", zone_id: "", firmware_version: "" });
        setIsDialogOpen(true);
    };

    const handleEdit = (d: Device) => {
        setEditingDevice(d);
        setFormData({ type: d.type, zone_id: d.zone_id, firmware_version: d.firmware_version });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setError(null);
        try {
            if (editingDevice) {
                await apiFetch(`/api/v1/devices/${editingDevice._id}/`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
            } else {
                await apiFetch("/api/v1/devices/", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
            }
            setIsDialogOpen(false);
            await loadDevices();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка сохранения.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить устройство?")) return;
        try {
            await apiFetch(`/api/v1/devices/${id}/`, { method: "DELETE" });
            await loadDevices();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка удаления.");
        }
    };

    const getZoneName = (id: string) =>
        zones.find((z) => z._id === id)?.name ?? id.slice(-6);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Устройства</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? "Загрузка..." : `Страница ${page + 1} · показано ${devices.length}`}
                    </p>
                </div>
                <Button onClick={handleCreate}><Plus className="size-4 mr-2" />Добавить</Button>
            </div>

            <Card className="mb-4">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Filter className="size-4 text-gray-500" />
                        <span className="font-medium">Фильтры</span>
                    </div>
                    <Input placeholder="Тип устройства" value={typeFilter}
                           onChange={(e) => setTypeFilter(e.target.value)} />
                    {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Тип</TableHead>
                            <TableHead>Зона</TableHead>
                            <TableHead>Версия прошивки</TableHead>
                            <TableHead className="text-right w-[120px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
                        ) : devices.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell></TableRow>
                        ) : devices.map((d) => (
                            <TableRow key={d._id}>
                                <TableCell className="font-medium">{d.type}</TableCell>
                                <TableCell>{getZoneName(d.zone_id)}</TableCell>
                                <TableCell>{d.firmware_version}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/devices/${d._id}`)}><Eye className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(d)}><Edit className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(d._id)}><Trash2 className="size-4 text-red-600" /></Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Страница {page + 1}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                            <ChevronLeft className="size-4 mr-1" />Назад
                        </Button>
                        <Button variant="outline" size="sm" disabled={devices.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                            Вперёд<ChevronRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingDevice ? "Редактировать устройство" : "Добавить устройство"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Тип</Label>
                            <Input placeholder="turnstile / terminal / door_lock"
                                   value={formData.type}
                                   onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Зона</Label>
                            <select
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                                value={formData.zone_id}
                                onChange={(e) => setFormData({ ...formData, zone_id: e.target.value })}
                            >
                                <option value="">Выберите зону</option>
                                {zones.map((z) => (
                                    <option key={z._id} value={z._id}>{z.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Версия прошивки</Label>
                            <Input value={formData.firmware_version}
                                   onChange={(e) => setFormData({ ...formData, firmware_version: e.target.value })} />
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