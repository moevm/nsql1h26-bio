import { useState } from "react";
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
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "./ui/dialog";
import { Search, Filter, Download } from "lucide-react";

type LogEvent = {
  id: number;
  timestamp: string;
  user: string;
  location: string;
  method: "Лицо" | "Голос" | "Карта";
  status: "success" | "failed";
  details: string;
};

const mockLogs: LogEvent[] = [
  { id: 1, timestamp: "2026-03-11 10:23:15", user: "Иванов И.И.", location: "Серверная", method: "Лицо", status: "success", details: "Распознавание лица: 98% совпадение" },
  { id: 2, timestamp: "2026-03-11 10:21:42", user: "Петрова А.С.", location: "Лаборатория 5", method: "Голос", status: "success", details: "Голосовая аутентификация: успешно" },
  { id: 3, timestamp: "2026-03-11 10:18:33", user: "Неизвестный", location: "Серверная", method: "Карта", status: "failed", details: "Карта не найдена в системе" },
  { id: 4, timestamp: "2026-03-11 10:15:20", user: "Сидоров П.К.", location: "Главный вход", method: "Лицо", status: "success", details: "Распознавание лица: 95% совпадение" },
  { id: 5, timestamp: "2026-03-11 10:12:08", user: "Козлова Е.Н.", location: "Библиотека", method: "Карта", status: "success", details: "Карточный доступ" },
  { id: 6, timestamp: "2026-03-11 03:45:12", user: "Неизвестный", location: "Серверная", method: "Лицо", status: "failed", details: "Лицо не распознано" },
  { id: 7, timestamp: "2026-03-11 02:33:54", user: "Смирнов Д.А.", location: "Серверная", method: "Лицо", status: "success", details: "Распознавание лица: 97% совпадение, Ночная смена" },
  { id: 8, timestamp: "2026-03-11 01:15:22", user: "Неизвестный", location: "Серверная", method: "Карта", status: "failed", details: "Недействительная карта" },
];

export default function Logs() {
  const [logs] = useState<LogEvent[]>(mockLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogEvent | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === "all" || log.location === locationFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesLocation && matchesStatus;
  });

  const locations = Array.from(new Set(logs.map(log => log.location)));
  const successCount = logs.filter(log => log.status === "success").length;
  const failedCount = logs.filter(log => log.status === "failed").length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Логи событий</h1>
        <Button variant="outline">
          <Download className="size-4 mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Всего событий</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{logs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Успешных</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">{successCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Неудачных попыток</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-4 flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <Input
            placeholder="Поиск по пользователю или локации..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-48">
            <Filter className="size-4 mr-2" />
            <SelectValue placeholder="Помещение" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все помещения</SelectItem>
            {locations.map((loc) => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="success">Успешные</SelectItem>
            <SelectItem value="failed">Неудачные</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Время</TableHead>
              <TableHead>Пользователь</TableHead>
              <TableHead>Помещение</TableHead>
              <TableHead>Метод</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow 
                key={log.id} 
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedLog(log)}
              >
                <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.location}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.method}</Badge>
                </TableCell>
                <TableCell>
                  {log.status === "success" ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Успешно
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                      Отказано
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm text-gray-600 max-w-md truncate">
                  {log.details}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Детали события</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Время</p>
                  <p className="font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Пользователь</p>
                  <p className="font-medium">{selectedLog.user}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Помещение</p>
                  <p>{selectedLog.location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Метод</p>
                  <p>{selectedLog.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Статус</p>
                  {selectedLog.status === "success" ? (
                    <Badge className="bg-green-100 text-green-800">Успешно</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Отказано</Badge>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Подробности</p>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
