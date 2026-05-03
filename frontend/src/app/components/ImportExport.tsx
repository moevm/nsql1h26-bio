import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "./ui/select";
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Database
} from "lucide-react";
import { Badge } from "./ui/badge";

export default function ImportExport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [exportFormat, setExportFormat] = useState("json");
  const [dateRange, setDateRange] = useState("month");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!importFile) {
      setImportResult({
        success: false,
        message: "Пожалуйста, выберите файл",
      });
      return;
    }

    // Симуляция импорта
    setTimeout(() => {
      const recordsCount = Math.floor(Math.random() * 500) + 100;
      setImportResult({
        success: true,
        message: `Успешно импортировано ${recordsCount} записей`,
        details: `Файл: ${importFile.name}\nРазмер: ${(importFile.size / 1024).toFixed(2)} КБ`,
      });
    }, 1000);
  };

  const handleExport = (type: "employees" | "logs") => {
    // Симуляция экспорта
    const filename = type === "employees" 
      ? `employees_${new Date().toISOString().split('T')[0]}.${exportFormat}`
      : `logs_${dateRange}_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
    
    alert(`Экспорт начат: ${filename}\n\nВ реальной системе файл будет загружен автоматически.`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Импорт и экспорт данных</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Upload className="size-5 text-blue-600" />
              <CardTitle>Импорт данных</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Выберите файл для импорта</Label>
              <Input
                type="file"
                accept=".json,.csv,.xlsx"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                Поддерживаемые форматы: JSON, CSV, XLSX
              </p>
            </div>

            {importFile && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-gray-500" />
                  <span className="text-sm font-medium">{importFile.name}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Размер: {(importFile.size / 1024).toFixed(2)} КБ
                </p>
              </div>
            )}

            <Button 
              onClick={handleImport} 
              disabled={!importFile}
              className="w-full"
            >
              <Upload className="size-4 mr-2" />
              Импортировать
            </Button>

            {importResult && (
              <div className={`p-4 rounded-lg border ${
                importResult.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {importResult.success ? (
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="size-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {importResult.message}
                    </p>
                    {importResult.details && (
                      <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">
                        {importResult.details}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium mb-3">Примеры форматов</h4>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">JSON формат:</p>
                  <Textarea
                    readOnly
                    value={`[
  {
    "lastName": "Иванов",
    "firstName": "Иван",
    "middleName": "Иванович",
    "position": "Преподаватель",
    "status": "active"
  }
]`}
                    className="font-mono text-xs"
                    rows={8}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium mb-1">CSV формат:</p>
                  <Textarea
                    readOnly
                    value={`lastName,firstName,middleName,position,status
Иванов,Иван,Иванович,Преподаватель,active
Петрова,Анна,Сергеевна,Лаборант,active`}
                    className="font-mono text-xs"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="size-5 text-green-600" />
                <CardTitle>Экспорт сотрудников</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Формат файла</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="size-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Доступно для экспорта
                  </span>
                </div>
                <p className="text-2xl font-semibold text-blue-900">1,247</p>
                <p className="text-xs text-blue-700">записей сотрудников</p>
              </div>

              <Button 
                onClick={() => handleExport("employees")}
                className="w-full"
                variant="outline"
              >
                <Download className="size-4 mr-2" />
                Экспортировать всех сотрудников
              </Button>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Экспорт включает: ФИО, должность, статус, комментарии.
                  Биометрические данные не экспортируются по соображениям безопасности.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="size-5 text-purple-600" />
                <CardTitle>Экспорт логов</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Период</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Сегодня</SelectItem>
                    <SelectItem value="week">Неделя</SelectItem>
                    <SelectItem value="month">Месяц</SelectItem>
                    <SelectItem value="quarter">Квартал</SelectItem>
                    <SelectItem value="year">Год</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Формат файла</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="size-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    События за выбранный период
                  </span>
                </div>
                <p className="text-2xl font-semibold text-purple-900">
                  {dateRange === "day" && "2,533"}
                  {dateRange === "week" && "15,421"}
                  {dateRange === "month" && "68,945"}
                  {dateRange === "quarter" && "195,234"}
                  {dateRange === "year" && "892,156"}
                </p>
                <p className="text-xs text-purple-700">записей в логах</p>
              </div>

              <Button 
                onClick={() => handleExport("logs")}
                className="w-full"
                variant="outline"
              >
                <Download className="size-4 mr-2" />
                Экспортировать логи
              </Button>

              <div className="pt-2">
                <p className="text-xs text-gray-500">
                  Экспорт включает: временные метки, пользователей, локации, методы аутентификации и статусы.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
