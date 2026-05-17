import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Building } from "lucide-react";
import { apiFetch } from "../api/client";

type Zone = { _id: string; name: string; building: string; type: string };
type Device = { _id: string; name?: string; type: string; zone_id: string; firmware_version: string };
type Group = { _id: string; name: string };
type Policy = { _id: string; subject_type: string; subject_id: string; zone_ids: string[] };

export default function FacilityMap() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<Zone[]>("/api/v1/zones/"),
      apiFetch<Device[]>("/api/v1/devices/"),
      apiFetch<Group[]>("/api/v1/groups/"),
    ]).then(([z, d, g]) => {
      setZones(z);
      setDevices(d);
      setGroups(g);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  const devicesByZone = (zoneId: string) =>
      devices.filter((d) => d.zone_id === zoneId);

  const groupsForZone = (zoneId: string) => {
    const relevant = policies.filter((p) => p.zone_ids?.includes(zoneId));
    return relevant.map((p) => groups.find((g) => g._id === p.subject_id)).filter(Boolean) as Group[];
  };

  const groupedZones = zones.reduce((acc, zone) => {
    if (!acc[zone.building]) acc[zone.building] = [];
    acc[zone.building].push(zone);
    return acc;
  }, {} as Record<string, Zone[]>);

  if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;

  return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Карта помещений</h1>

        {Object.keys(groupedZones).length === 0 ? (
            <p className="text-gray-500 text-center py-8">Зоны не найдены</p>
        ) : (
            <div className="space-y-6">
              {Object.entries(groupedZones).map(([building, buildingZones]) => (
                  <Card key={building}>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Building className="size-5 text-gray-500" />
                        <CardTitle className="text-lg">{building}</CardTitle>
                        <Badge variant="outline">{buildingZones.length} зон</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {buildingZones.map((zone) => {
                          const zoneDevices = devicesByZone(zone._id);
                          const zoneGroups = groupsForZone(zone._id);
                          return (
                              <div key={zone._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <h3 className="font-medium">{zone.name}</h3>
                                    <Badge variant="outline" className="text-xs">{zone.type}</Badge>
                                  </div>
                                </div>

                                {zoneDevices.length > 0 && (
                                    <div className="mb-2">
                                      <span className="text-xs text-gray-500">Устройства: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {zoneDevices.map((d) => (
                                            <Badge key={d._id} variant="secondary" className="text-xs">
                                              {d.name ?? d.type} — {d.firmware_version}
                                            </Badge>
                                        ))}
                                      </div>
                                    </div>
                                )}

                                {zoneGroups.length > 0 && (
                                    <div>
                                      <span className="text-xs text-gray-500">Группы с доступом: </span>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {zoneGroups.map((g) => (
                                            <Badge key={g._id} className="text-xs bg-green-100 text-green-800">
                                              {g.name}
                                            </Badge>
                                        ))}
                                      </div>
                                    </div>
                                )}
                              </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  );
}