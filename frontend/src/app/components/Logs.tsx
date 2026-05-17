import { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Filter } from "lucide-react";
import { apiFetch } from "../api/client";

type LogEvent = {
  _id: string; timestamp: string; person_id: string;
  device_id: string; zone_id: string; auth_method: string;
  decision: string; reason?: string | null; recognition_score: number;
};
type Person = { _id: string; full_name: string };
type Zone = { _id: string; name: string };

export default function Logs() {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const [people, setPeople] = useState<Record<string, string>>({});
  const [zones, setZones] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoneIdFilter, setZoneIdFilter] = useState("");
  const [decisionFilter, setDecisionFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");
  const [selectedLog, setSelectedLog] = useState<LogEvent | null>(null);

  useEffect(() => {
    apiFetch<Person[]>("/api/v1/people/").then((data) => {
      const map: Record<string, string> = {};
      data.forEach((p) => { map[p._id] = p.full_name; });
      setPeople(map);
    }).catch(() => {});

    apiFetch<Zone[]>("/api/v1/zones/").then((data) => {
      const map: Record<string, string> = {};
      data.forEach((z) => { map[z._id] = z.name; });
      setZones(map);
    }).catch(() => {});
  }, []);

  async function loadEvents() {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (zoneIdFilter.trim()) params.set("zone_id", zoneIdFilter.trim());
      if (decisionFilter !== "all") params.set("decision", decisionFilter);
      if (dateFromFilter) params.set("date_from", dateFromFilter);
      if (dateToFilter) params.set("date_to", dateToFilter);
      const query = params.toString();
      const data = await apiFetch<LogEvent[]>(`/api/v1/events/${query ? `?${query}` : ""}`);
      setLogs(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось загрузить события.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(loadEvents, 250);
    return () => window.clearTimeout(handle);
  }, [zoneIdFilter, decisionFilter, dateFromFilter, dateToFilter]);

  const filteredLogs = useMemo(() => logs, [logs]);

  const decisionBadge = (decision: string) => {
    const isAllow = decision.toUpperCase() === "ALLOW";
    return (
        <Badge className={isAllow
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"}>
          {decision}
        </Badge>
    );
  };

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Логи событий</h1>
        </div>

        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Filter className="size-4 text-gray-500" />
                <span className="font-medium">Фильтры</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input placeholder="Зона (ID)" value={zoneIdFilter} onChange={(e) => setZoneIdFilter(e.target.value)} />
                <Input type="datetime-local" value={dateFromFilter} onChange={(e) => setDateFromFilter(e.target.value)} />
                <Input type="datetime-local" value={dateToFilter} onChange={(e) => setDateToFilter(e.target.value)} />
                <Select value={decisionFilter} onValueChange={setDecisionFilter}>
                  <SelectTrigger><SelectValue placeholder="Решение" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все</SelectItem>
                    <SelectItem value="ALLOW">ALLOW</SelectItem>
                    <SelectItem value="DENY">DENY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </CardContent>
        </Card>

        <div className="bg-white rounded-lg border border-gray-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Время</TableHead>
                <TableHead>Человек</TableHead>
                <TableHead>Зона</TableHead>
                <TableHead>Метод</TableHead>
                <TableHead>Решение</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Загрузка...</TableCell></TableRow>
              ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">Ничего не найдено</TableCell></TableRow>
              ) : filteredLogs.map((log) => (
                  <TableRow key={log._id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedLog(log)}>
                    <TableCell className="text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{people[log.person_id] ?? log.person_id.slice(-6)}</TableCell>
                    <TableCell className="text-sm">{zones[log.zone_id] ?? log.zone_id.slice(-6)}</TableCell>
                    <TableCell><Badge variant="outline">{log.auth_method}</Badge></TableCell>
                    <TableCell>{decisionBadge(log.decision)}</TableCell>
                    <TableCell className="font-mono text-sm">{log.recognition_score}</TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Детали события</DialogTitle></DialogHeader>
            {selectedLog && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-sm text-gray-500">Время</p><p className="font-mono text-sm">{new Date(selectedLog.timestamp).toLocaleString()}</p></div>
                    <div><p className="text-sm text-gray-500">Человек</p><p className="text-sm">{people[selectedLog.person_id] ?? selectedLog.person_id}</p></div>
                    <div><p className="text-sm text-gray-500">Зона</p><p className="text-sm">{zones[selectedLog.zone_id] ?? selectedLog.zone_id}</p></div>
                    <div><p className="text-sm text-gray-500">Метод</p><p>{selectedLog.auth_method}</p></div>
                    <div><p className="text-sm text-gray-500">Решение</p>{decisionBadge(selectedLog.decision)}</div>
                    <div><p className="text-sm text-gray-500">Score</p><p className="font-mono">{selectedLog.recognition_score}</p></div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Причина</p>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{selectedLog.reason ?? "—"}</p>
                    </div>
                  </div>
                </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
  );
}