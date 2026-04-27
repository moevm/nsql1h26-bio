import { useState, useMemo } from "react";
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
import { Textarea } from "./ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Plus, Search, Edit, Trash2, Upload, Filter, ChevronLeft, ChevronRight } from "lucide-react";

type Employee = {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  position: string;
  status: "active" | "inactive" | "dismissed";
  hasFace: boolean;
  hasVoice: boolean;
  comment: string;
  // Для студентов
  department?: string;
  group?: string;
  course?: number;
};

// Генерация тестовых данных для демонстрации пагинации
const generateMockEmployees = (): Employee[] => {
  const positions = ["Преподаватель", "Лаборант", "Охранник", "Библиотекарь", "Студент", "Аспирант", "Декан", "Завкафедрой"];
  const departments = ["Информатика и ВТ", "Прикладная математика", "Физика", "Химия", "Биология", "Экономика", "Право", "История"];
  const lastNames = ["Иванов", "Петров", "Сидоров", "Козлов", "Смирнов", "Новиков", "Морозов", "Волков", "Соловьев", "Васильев", "Зайцев", "Павлов", "Семенов", "Голубев", "Виноградов", "Богданов", "Воробьев", "Федоров", "Михайлов", "Беляев"];
  const firstNames = ["Иван", "Петр", "Сергей", "Александр", "Дмитрий", "Андрей", "Алексей", "Артем", "Владимир", "Николай", "Анна", "Мария", "Елена", "Ольга", "Наталья", "Татьяна", "Ирина", "Светлана", "Екатерина", "Юлия"];
  const middleNames = ["Иванович", "Петрович", "Сергеевич", "Александрович", "Дмитриевич", "Андреевич", "Алексеевич", "Ивановна", "Петровна", "Сергеевна", "Александровна", "Дмитриевна", "Андреевна"];
  const statuses: Employee["status"][] = ["active", "active", "active", "active", "inactive", "dismissed"];
  
  const employees: Employee[] = [];
  
  for (let i = 1; i <= 1247; i++) {
    const position = positions[Math.floor(Math.random() * positions.length)];
    const isStudent = position === "Студент" || position === "Аспирант";
    
    employees.push({
      id: i,
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      middleName: middleNames[Math.floor(Math.random() * middleNames.length)],
      position,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      hasFace: Math.random() > 0.2,
      hasVoice: Math.random() > 0.6,
      comment: i % 10 === 0 ? "Пропуск выдан временно" : "",
      department: isStudent ? departments[Math.floor(Math.random() * departments.length)] : undefined,
      group: isStudent ? `${Math.floor(Math.random() * 5) + 1}-${Math.floor(Math.random() * 10) + 1}` : undefined,
      course: isStudent ? Math.floor(Math.random() * 4) + 1 : undefined,
    });
  }
  
  return employees;
};

const mockEmployees = generateMockEmployees();

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  
  // Filters
  const [positionFilter, setPositionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    position: "",
    status: "active" as Employee["status"],
    comment: "",
    department: "",
    group: "",
    course: undefined as number | undefined,
  });

  // Get unique values for filters
  const positions = Array.from(new Set(employees.map(e => e.position))).sort();
  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean))).sort();
  const courses = [1, 2, 3, 4];

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch = `${emp.lastName} ${emp.firstName} ${emp.middleName} ${emp.position} ${emp.department || ""} ${emp.group || ""}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesPosition = positionFilter === "all" || emp.position === positionFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || emp.department === departmentFilter;
      const matchesCourse = courseFilter === "all" || emp.course?.toString() === courseFilter;
      
      return matchesSearch && matchesPosition && matchesStatus && matchesDepartment && matchesCourse;
    });
  }, [employees, searchQuery, positionFilter, statusFilter, departmentFilter, courseFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setFormData({
      lastName: "",
      firstName: "",
      middleName: "",
      position: "",
      status: "active",
      comment: "",
      department: "",
      group: "",
      course: undefined,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      lastName: employee.lastName,
      firstName: employee.firstName,
      middleName: employee.middleName,
      position: employee.position,
      status: employee.status,
      comment: employee.comment,
      department: employee.department || "",
      group: employee.group || "",
      course: employee.course,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData }
          : emp
      ));
    } else {
      const newEmployee: Employee = {
        id: Math.max(...employees.map(e => e.id)) + 1,
        ...formData,
        hasFace: false,
        hasVoice: false,
        department: formData.department || undefined,
        group: formData.group || undefined,
      };
      setEmployees([...employees, newEmployee]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить этого сотрудника?")) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const getStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Активен</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Неактивен</Badge>;
      case "dismissed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Уволен</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setPositionFilter("all");
    setStatusFilter("all");
    setDepartmentFilter("all");
    setCourseFilter("all");
    setCurrentPage(1);
  };

  const isStudentPosition = (position: string) => {
    return position === "Студент" || position === "Аспирант";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Управление сотрудниками</h1>
          <p className="text-sm text-gray-500 mt-1">
            Всего: {employees.length} | Найдено: {filteredEmployees.length}
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="size-4 mr-2" />
          Создать
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gray-500" />
                <span className="font-medium">Фильтры</span>
              </div>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Сбросить все
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleFilterChange();
                  }}
                  className="pl-10"
                />
              </div>

              <Select 
                value={positionFilter} 
                onValueChange={(value) => {
                  setPositionFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Должность" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все должности</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={statusFilter} 
                onValueChange={(value) => {
                  setStatusFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                  <SelectItem value="dismissed">Уволен</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={departmentFilter} 
                onValueChange={(value) => {
                  setDepartmentFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Направление" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все направления</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={courseFilter} 
                onValueChange={(value) => {
                  setCourseFilter(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Курс" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все курсы</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course} value={course.toString()}>{course} курс</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">ФИО</TableHead>
              <TableHead>Должность</TableHead>
              <TableHead>Направление/Группа</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Биометрия</TableHead>
              <TableHead>Комментарий</TableHead>
              <TableHead className="text-right w-[100px]">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Ничего не найдено
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.lastName} {employee.firstName.charAt(0)}. {employee.middleName.charAt(0)}.
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>
                    {employee.department ? (
                      <div className="text-sm">
                        <div className="font-medium">{employee.department}</div>
                        {employee.group && (
                          <div className="text-gray-500">
                            Группа {employee.group} • {employee.course} курс
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {employee.hasFace && (
                        <Badge variant="outline" className="text-xs">Лицо</Badge>
                      )}
                      {employee.hasVoice && (
                        <Badge variant="outline" className="text-xs">Голос</Badge>
                      )}
                      {!employee.hasFace && !employee.hasVoice && (
                        <span className="text-xs text-gray-400">Нет</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-gray-600">
                    {employee.comment || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredEmployees.length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Показывать по:</span>
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">
              Показано {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredEmployees.length)} из {filteredEmployees.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-9"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEmployee ? "Редактировать сотрудника" : "Создать сотрудника"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Фамилия</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Отчество</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Должность</Label>
              <Select
                value={formData.position}
                onValueChange={(value) => setFormData({ ...formData, position: value })}
              >
                <SelectTrigger id="position">
                  <SelectValue placeholder="Выберите должность" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Employee["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активен</SelectItem>
                  <SelectItem value="inactive">Неактивен</SelectItem>
                  <SelectItem value="dismissed">Уволен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Student-specific fields */}
            {isStudentPosition(formData.position) && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="department">Направление</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => setFormData({ ...formData, department: value })}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Выберите направление" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Группа</Label>
                  <Input
                    id="group"
                    value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                    placeholder="Например: 3-5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course">Курс</Label>
                  <Select
                    value={formData.course?.toString() || ""}
                    onValueChange={(value) => setFormData({ ...formData, course: Number(value) })}
                  >
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Выберите курс" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course.toString()}>{course} курс</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2 col-span-2">
              <Label>Биометрические данные</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" type="button">
                  <Upload className="size-4 mr-2" />
                  Загрузить фото
                </Button>
                <Button variant="outline" size="sm" type="button">
                  <Upload className="size-4 mr-2" />
                  Загрузить аудио
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Поддерживаются форматы: JPG, PNG для фото; WAV, MP3 для голоса
              </p>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                placeholder="Например: Пропуск выдан временно"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
