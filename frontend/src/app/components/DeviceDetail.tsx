import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../api/client";

type Device = { _id: string; name?: string; type: string; zone_id: string; firmware_version: string };
type Zone = { _id: string; name: string; building: string };

export default function DeviceDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [device, setDevice] = useState<Device | null>(null);
    const [zone, setZone] = useState<Zone | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        apiFetch<Device>(`/api/v1/devices/${id}/`)
            .then(async (d) => {
                setDevice(d);
                const z = await apiFetch<Zone>(`/api/v1/zones/${d.zone_id}/`);
                setZone(z);
            })
            .catch(() => navigate("/devices"))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;
    if (!device) return null;

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/devices")}>
                    <ArrowLeft className="size-4 mr-1" /> Назад
                </Button>
                <h1 className="text-2xl font-semibold flex-1">{device.name ?? device.type}</h1>
            </div>

            <Card>
                <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <dt className="text-gray-500 mb-1">Тип</dt>
                            <dd><Badge variant="outline">{device.type}</Badge></dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Версия прошивки</dt>
                            <dd className="font-mono">{device.firmware_version}</dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-gray-500 mb-1">Зона</dt>
                            <dd>
                                {zone ? (
                                    <span>{zone.name} <span className="text-gray-400">— {zone.building}</span></span>
                                ) : (
                                    <span className="text-gray-400">{device.zone_id}</span>
                                )}
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}