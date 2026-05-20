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

type Group = { _id: string; name: string; parent_group_id?: string | null; description?: string | null };

const PAGE_SIZE = 5;

export default function Groups() {
    const [groups, setGroups] = useState<Group[]>([]);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [nameFilter, setNameFilter] = useState("");
    const [page, setPage] = useState(0);
    const [formData, setFormData] = useState({ name: "", description: "", parent_group_id: "" });
    const navigate = useNavigate();

    useEffect(() => {
        apiFetch<Group[]>("/api/v1/groups/?limit=1000").then(setAllGroups).catch(() => {});
    }, []);

    async function loadGroups() {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (nameFilter.trim()) params.set("name", nameFilter.trim());
            params.set("skip", String(page * PAGE_SIZE));
            params.set("limit", String(PAGE_SIZE));
            const data = await apiFetch<Group[]>(`/api/v1/groups/?${params.toString()}`);
            setGroups(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка загрузки.");
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setPage(0);
    }, [nameFilter]);

    useEffect(() => {
        const h = window.setTimeout(loadGroups, 250);
        return () => window.clearTimeout(h);
    }, [nameFilter, page]);

    const handleCreate = () => {
        setEditingGroup(null);
        setFormData({ name: "", description: "", parent_group_id: "" });
        setIsDialogOpen(true);
    };

    const handleEdit = (g: Group) => {
        setEditingGroup(g);
        setFormData({
            name: g.name,
            description: g.description ?? "",
            parent_group_id: g.parent_group_id ?? "",
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setError(null);
        try {
            const body = {
                name: formData.name,
                description: formData.description || null,
                parent_group_id: formData.parent_group_id || null,
            };
            if (editingGroup) {
                await apiFetch(`/api/v1/groups/${editingGroup._id}/`, { method: "PUT", body: JSON.stringify(body) });
            } else {
                await apiFetch("/api/v1/groups/", { method: "POST", body: JSON.stringify(body) });
            }
            setIsDialogOpen(false);
            await loadGroups();
            const all = await apiFetch<Group[]>("/api/v1/groups/?limit=1000");
            setAllGroups(all);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка сохранения.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Удалить группу?")) return;
        try {
            await apiFetch(`/api/v1/groups/${id}/`, { method: "DELETE" });
            await loadGroups();
        } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка удаления.");
        }
    };

    const getParentName = (id?: string | null) =>
        id ? (allGroups.find((g) => g._id === id)?.name ?? id.slice(-6)) : "—";

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold">Группы</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {isLoading ? "Загрузка..." : `Страница ${page + 1} · показано ${groups.length}`}
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
                    <Input placeholder="Название группы" value={nameFilter}
                           onChange={(e) => setNameFilter(e.target.value)} />
                    {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
                </CardContent>
            </Card>

            <div className="bg-white rounded-lg border border-gray-200">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Родительская группа</TableHead>
                            <TableHead>Описание</TableHead>
                            <TableHead className="text-right w-[120px]">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
                        ) : groups.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell></TableRow>
                        ) : groups.map((g) => (
                            <TableRow key={g._id}>
                                <TableCell className="font-medium">{g.name}</TableCell>
                                <TableCell className="text-gray-500">{getParentName(g.parent_group_id)}</TableCell>
                                <TableCell className="text-gray-500">{g.description ?? "—"}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/groups/${g._id}`)}><Eye className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleEdit(g)}><Edit className="size-4" /></Button>
                                        <Button variant="ghost" size="sm" onClick={() => handleDelete(g._id)}><Trash2 className="size-4 text-red-600" /></Button>
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
                        <Button variant="outline" size="sm" disabled={groups.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                            Вперёд<ChevronRight className="size-4 ml-1" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingGroup ? "Редактировать группу" : "Добавить группу"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Название</Label>
                            <Input value={formData.name}
                                   onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Описание</Label>
                            <Input value={formData.description}
                                   onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Родительская группа</Label>
                            <select
                                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm"
                                value={formData.parent_group_id}
                                onChange={(e) => setFormData({ ...formData, parent_group_id: e.target.value })}
                            >
                                <option value="">Нет (корневая группа)</option>
                                {allGroups
                                    .filter((g) => g._id !== editingGroup?._id)
                                    .map((g) => (
                                        <option key={g._id} value={g._id}>{g.name}</option>
                                    ))}
                            </select>
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