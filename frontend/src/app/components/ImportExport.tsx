import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload, Download, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { getToken } from "../api/client";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function ImportExport() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/export`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Ошибка экспорта");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `skud_export_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Ошибка экспорта");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);
      const response = await fetch(`${API_URL}/api/v1/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail ?? "Ошибка импорта");
      setImportResult({ success: true, message: data.message });
    } catch (e) {
      setImportResult({ success: false, message: e instanceof Error ? e.message : "Ошибка импорта" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Импорт и экспорт данных</h1>
        <p className="text-sm text-gray-500 mb-6">
          Экспорт выгружает все данные системы в один JSON-файл. Импорт полностью заменяет содержимое базы данных.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Download className="size-5 text-green-600" />
                <CardTitle>Экспорт данных</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Выгружает все коллекции: пользователи, группы, зоны, устройства, политики доступа, события.
              </p>
              <Button onClick={handleExport} disabled={isExporting} className="w-full">
                <Download className="size-4 mr-2" />
                {isExporting ? "Экспорт..." : "Экспортировать всё"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Upload className="size-5 text-blue-600" />
                <CardTitle>Импорт данных</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Загрузите JSON-файл, полученный при экспорте. Текущие данные будут полностью заменены.
              </p>
              <div className="space-y-2">
                <Label>Файл для импорта (.json)</Label>
                <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      setImportFile(e.target.files?.[0] ?? null);
                      setImportResult(null);
                    }}
                />
              </div>

              {importFile && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileText className="size-4 text-gray-500" />
                    <span className="text-sm">{importFile.name}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                  {(importFile.size / 1024).toFixed(1)} КБ
                </span>
                  </div>
              )}

              <Button onClick={handleImport} disabled={!importFile || isImporting} className="w-full">
                <Upload className="size-4 mr-2" />
                {isImporting ? "Импорт..." : "Импортировать"}
              </Button>

              {importResult && (
                  <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                      importResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}>
                    {importResult.success
                        ? <CheckCircle className="size-5 text-green-600 mt-0.5" />
                        : <AlertTriangle className="size-5 text-red-600 mt-0.5" />}
                    <p className={`text-sm font-medium ${
                        importResult.success ? "text-green-800" : "text-red-800"
                    }`}>
                      {importResult.message}
                    </p>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}