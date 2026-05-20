import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../api/client";

type Zone = { _id: string; name: string; building: string; type: string };
type Device = { _id: string; name?: string; type: string; zone_id: string; firmware_version: string };

export default function ZoneDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [zone, setZone] = useState<Zone | null>(null);
    const [devices, setDevices] = useState<Device[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<Zone>(`/api/v1/zones/${id}/`),
            apiFetch<Device[]>("/api/v1/devices/"),
        ]).then(([z, d]) => {
            setZone(z);
            setDevices(d.filter((dev) => dev.zone_id === id));
        }).catch(() => navigate("/zones"))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;
    if (!zone) return null;

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/zones")}>
                    <ArrowLeft className="size-4 mr-1" /> Назад
                </Button>
                <h1 className="text-2xl font-semibold flex-1">{zone.name}</h1>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                            <div>
                                <dt className="text-gray-500 mb-1">Корпус</dt>
                                <dd>{zone.building}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 mb-1">Тип</dt>
                                <dd><Badge variant="outline">{zone.type}</Badge></dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Устройства в зоне</CardTitle></CardHeader>
                    <CardContent>
                        {devices.length === 0 ? (
                            <p className="text-sm text-gray-500">Нет устройств</p>
                        ) : (
                            <div className="space-y-2">
                                {devices.map((d) => (
                                    <div key={d._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">{d.name ?? d.type}</p>
                                            <p className="text-xs text-gray-500">{d.type}</p>
                                        </div>
                                        <Badge variant="secondary">{d.firmware_version}</Badge>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}