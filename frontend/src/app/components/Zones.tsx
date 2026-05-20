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
import { apiFetch } from "../api/client";
import { useNavigate } from "react-router-dom";

type Zone = { _id: string; name: string; building: string; type: string };

const PAGE_SIZE = 5;

export default function Zones() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [nameFilter, setNameFilter] = useState("");
    const [buildingFilter, setBuildingFilter] = useState("");
    const [formData, setFormData] = useState({ name: "", building: "", type: "" });
    const [page, setPage] = useState(0);
    const navigate = useNavigate();

    async function loadZones() {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (nameFilter.trim()) params.set("name", nameFilter.trim());
            if (buildingFilter.trim()) params.set("building", buildingFilter.trim());
            params.set("skip", String(page * PAGE_SIZE));
            params.set("limit", String(PAGE_SIZE));
            const data = await apiFetch<Zone[]>(`/api/v1/zones/?${params.toString()}`);
            setZones(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setPage(0);
    }, [nameFilter, buildingFilter]);

    useEffect(() => {
        const h = window.setTimeout(loadZones, 250);
        return () => window.clearTimeout(h);
    }, [nameFilter, buildingFilter, page]);

    const handleCreate = () => {
        setEditingZone(null);
        setFormData({ name: "", building: "", type: "" });
        setIsDialogOpen(true);
    };

    const handleEdit = (z: Zone) => {
        setEditingZone(z);
        setFormData({ name: z.name, building: z.building, type: z.type });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setError(null);
        try {
            if (editingZone) {
                await apiFetch(`/api/v1/zones/${editingZone._id}/`, {
                    method: "PUT",
                    body: JSON.stringify(formData),
                });
            } else {
                await apiFetch("/api/v1/zones/", {
                    method: "POST",
                    body: JSON.stringify(formData),
                });
            }
            setIsDialogOpen(false);
            await loadZones();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка сохранения.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить зону?")) return;
        try {
            await apiFetch(`/api/v1/zones/${id}/`, { method: "DELETE" });
            await loadZones();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка удаления.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Зоны</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? "Загрузка..." : `Страница ${page + 1} · показано ${zones.length}`}
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
                    <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Название зоны" value={nameFilter}
                               onChange={(e) => setNameFilter(e.target.value)} />
                        <Input placeholder="Корпус" value={buildingFilter}
                               onChange={(e) => setBuildingFilter(e.target.value)} />
                    </div>
                    {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Корпус</TableHead>
                            <TableHead>Тип</TableHead>
                            <TableHead className="text-right w-[120px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
                        ) : zones.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell></TableRow>
                        ) : zones.map((z) => (
                            <TableRow key={z._id}>
                                <TableCell className="font-medium">{z.name}</TableCell>
                                <TableCell>{z.building}</TableCell>
                                <TableCell>{z.type}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/zones/${z._id}`)}><Eye className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(z)}><Edit className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(z._id)}><Trash2 className="size-4 text-red-600" /></Button>
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
                        <Button variant="outline" size="sm" disabled={zones.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                            Вперёд<ChevronRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingZone ? "Редактировать зону" : "Добавить зону"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Корпус</Label>
                            <Input value={formData.building}
                                   onChange={(e) => setFormData({ ...formData, building: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Тип</Label>
                            <Input placeholder="entrance / laboratory / restricted..."
                                   value={formData.type}
                                   onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
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