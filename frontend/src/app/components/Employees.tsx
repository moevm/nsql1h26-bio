import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "./ui/dialog";
import { Label } from "./ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Plus, Edit, Trash2, Filter, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "../api/client";

type Role = "student" | "staff" | "guest";
type Status = "active" | "blocked";
type Person = {
  _id: string; full_name: string; role: Role;
  department: string; status: Status; group_ids?: string[];
  created_at: string; updated_at: string;
};
type Group = { _id: string; name: string };

const PAGE_SIZE = 5;

export default function Employees() {
  const [people, setPeople] = useState<Person[]>([]);
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [page, setPage] = useState(0);

  const [fullNameFilter, setFullNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    role: "staff" as Role,
    department: "",
    status: "active" as Status,
    group_ids: [] as string[],
  });

  useEffect(() => {
    apiFetch<Group[]>("/api/v1/groups/").then(setGroups).catch(() => {});
  }, []);

  async function loadPeople() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fullNameFilter.trim()) params.set("full_name", fullNameFilter.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (departmentFilter.trim()) params.set("department", departmentFilter.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("skip", String(page * PAGE_SIZE));
      params.set("limit", String(PAGE_SIZE));
      const data = await apiFetch<Person[]>(`/api/v1/people/?${params.toString()}`);
      setPeople(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить список людей.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    setPage(0);
  }, [fullNameFilter, roleFilter, statusFilter, departmentFilter]);

  useEffect(() => {
    const handle = window.setTimeout(loadPeople, 250);
    return () => window.clearTimeout(handle);
  }, [fullNameFilter, roleFilter, statusFilter, departmentFilter, page]);

  const handleCreate = () => {
    setEditingPerson(null);
    setFormData({ full_name: "", role: "staff", department: "", status: "active", group_ids: [] });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      full_name: person.full_name,
      role: person.role,
      department: person.department,
      status: person.status,
      group_ids: person.group_ids ?? [],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editingPerson) {
        await apiFetch<Person>(`/api/v1/people/${editingPerson._id}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch<Person>("/api/v1/people/", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }
      setIsDialogOpen(false);
      await loadPeople();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить человека.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить этого человека?")) return;
    setError(null);
    try {
      await apiFetch(`/api/v1/people/${id}/`, { method: "DELETE" });
      await loadPeople();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить человека.");
    }
  };

  const toggleGroup = (groupId: string) => {
    setFormData((prev) => ({
      ...prev,
      group_ids: prev.group_ids.includes(groupId)
          ? prev.group_ids.filter((id) => id !== groupId)
          : [...prev.group_ids, groupId],
    }));
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "student": return "Студент";
      case "staff": return "Сотрудник";
      case "guest": return "Гость";
    }
  };

  const getGroupNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return "—";
    return ids.map((id) => groups.find((g) => g._id === id)?.name ?? id.slice(-6)).join(", ");
  };

  const clearFilters = () => {
    setFullNameFilter("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("");
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Люди</h1>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading ? "Загрузка..." : `Страница ${page + 1} · показано ${people.length}`}
            </p>
          </div>
          <Button onClick={handleCreate}><Plus className="size-4 mr-2" />Добавить</Button>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-gray-500" />
                  <span className="font-medium">Фильтры</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearFilters}>Сбросить все</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input placeholder="Имя (ФИО)" value={fullNameFilter}
                       onChange={(e) => setFullNameFilter(e.target.value)} />
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as Role | "all")}>
                  <SelectTrigger><SelectValue placeholder="Роль" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все роли</SelectItem>
                    <SelectItem value="student">Студент</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                    <SelectItem value="guest">Гость</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
                  <SelectTrigger><SelectValue placeholder="Статус" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все статусы</SelectItem>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Отдел / Кафедра" value={departmentFilter}
                       onChange={(e) => setDepartmentFilter(e.target.value)} />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">ФИО</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Отдел</TableHead>
                <TableHead>Группы</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right w-[120px]">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
              ) : people.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell></TableRow>
              ) : people.map((person) => (
                  <TableRow key={person._id}>
                    <TableCell className="font-medium">{person.full_name}</TableCell>
                    <TableCell>{getRoleLabel(person.role)}</TableCell>
                    <TableCell>{person.department}</TableCell>
                    <TableCell className="text-sm text-gray-500">{getGroupNames(person.group_ids)}</TableCell>
                    <TableCell>
                      <Badge className={person.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {person.status === "active" ? "Активен" : "Заблокирован"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/people/${person._id}`)}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}><Edit className="size-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(person._id)}><Trash2 className="size-4 text-red-600" /></Button>
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
              <Button variant="outline" size="sm" disabled={people.length < PAGE_SIZE} onClick={() => setPage((p) => p + 1)}>
                Вперёд<ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPerson ? "Редактировать человека" : "Добавить человека"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>ФИО</Label>
                <Input value={formData.full_name}
                       onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v as Role })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Студент</SelectItem>
                    <SelectItem value="staff">Сотрудник</SelectItem>
                    <SelectItem value="guest">Гость</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Status })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="blocked">Заблокирован</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Отдел</Label>
                <Input value={formData.department}
                       onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Группы</Label>
                <div className="border rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                  {groups.length === 0 ? (
                      <p className="text-sm text-gray-500">Нет групп</p>
                  ) : groups.map((group) => (
                      <label key={group._id} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.group_ids.includes(group._id)}
                            onChange={() => toggleGroup(group._id)}
                            className="rounded"
                        />
                        <span className="text-sm">{group.name}</span>
                      </label>
                  ))}
                </div>
              </div>
              {error && <div className="text-sm text-red-600 col-span-2">{error}</div>}
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