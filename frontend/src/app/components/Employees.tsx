import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Badge } from "./ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "./ui/dialog";
import { Label } from "./ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Plus, Edit, Trash2, Filter } from "lucide-react";
import { apiFetch } from "../api/client";

type Role = "student" | "staff" | "guest";
type Status = "active" | "blocked";

type Person = {
  _id: string;
  full_name: string;
  role: Role;
  department: string;
  status: Status;
  group_ids?: string[];
  created_at: string;
  updated_at: string;
};

export default function Employees() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  
  const [fullNameFilter, setFullNameFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [formData, setFormData] = useState({
    full_name: "",
    role: "staff" as Role,
    department: "",
    status: "active" as Status,
  });

  async function loadPeople() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fullNameFilter.trim()) params.set("full_name", fullNameFilter.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (departmentFilter.trim()) params.set("department", departmentFilter.trim());
      if (statusFilter !== "all") params.set("status", statusFilter);

      const query = params.toString();
      const data = await apiFetch<Person[]>(`/people/${query ? `?${query}` : ""}`);
      setPeople(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить список людей.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      loadPeople();
    }, 250);
    return () => window.clearTimeout(handle);
  }, [fullNameFilter, roleFilter, statusFilter, departmentFilter]);

  const handleCreate = () => {
    setEditingPerson(null);
    setFormData({ full_name: "", role: "staff", department: "", status: "active" });
    setIsDialogOpen(true);
  };

  const handleEdit = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      full_name: person.full_name,
      role: person.role,
      department: person.department,
      status: person.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editingPerson) {
        await apiFetch<Person>(`/people/${editingPerson._id}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        await apiFetch<Person>("/people/", {
          method: "POST",
          body: JSON.stringify({ ...formData, group_ids: [] }),
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
      await apiFetch(`/people/${id}/`, { method: "DELETE" });
      await loadPeople();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось удалить человека.");
    }
  };

  const getRoleLabel = (role: Role) => {
    switch (role) {
      case "student": return "Студент";
      case "staff": return "Сотрудник";
      case "guest": return "Гость";
    }
  };

  const clearFilters = () => {
    setFullNameFilter("");
    setRoleFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("");
  };

  const filteredPeople = useMemo(() => people, [people]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Люди</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isLoading ? "Загрузка..." : `Показано: ${filteredPeople.length}`}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" /> Добавить
        </Button>
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
              <Input
                placeholder="Имя (ФИО)"
                value={fullNameFilter}
                onChange={(e) => setFullNameFilter(e.target.value)}
              />
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
              <Input
                placeholder="Отдел / Кафедра"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </CardContent>
      </Card>

      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">ФИО</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>Отдел</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">Загрузка...</TableCell>
              </TableRow>
            ) : filteredPeople.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell>
              </TableRow>
            ) : (
              filteredPeople.map((person) => (
                <TableRow key={person._id}>
                  <TableCell className="font-medium">{person.full_name}</TableCell>
                  <TableCell>{getRoleLabel(person.role)}</TableCell>
                  <TableCell>{person.department}</TableCell>
                  <TableCell>
                    <Badge className={person.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {person.status === "active" ? "Активен" : "Заблокирован"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(person)}><Edit className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(person._id)}><Trash2 className="size-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPerson ? "Редактировать человека" : "Добавить человека"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="full_name">ФИО</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Роль</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as Role })}>
                <SelectTrigger id="role"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Студент</SelectItem>
                  <SelectItem value="staff">Сотрудник</SelectItem>
                  <SelectItem value="guest">Гость</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Status })}>
                <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="blocked">Заблокирован</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Отдел</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
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