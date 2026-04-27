import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { 
  Building, 
  Settings, 
  Plus,
  Users,
  Edit,
  Trash2
} from "lucide-react";

type Role = {
  id: number;
  name: string;
  color: string;
};

type Zone = {
  id: number;
  name: string;
  building: string;
  allowedRoles: number[];
  deniedRoles: number[];
  rooms: string[];
};

const mockRoles: Role[] = [
  { id: 1, name: "Преподаватели", color: "bg-blue-100 text-blue-800" },
  { id: 2, name: "Студенты", color: "bg-green-100 text-green-800" },
  { id: 3, name: "Лаборанты", color: "bg-purple-100 text-purple-800" },
  { id: 4, name: "Администрация", color: "bg-red-100 text-red-800" },
  { id: 5, name: "Охрана", color: "bg-gray-100 text-gray-800" },
];

const mockZones: Zone[] = [
  { 
    id: 1, 
    name: "Лаборатории физики", 
    building: "Главный корпус", 
    allowedRoles: [1, 3, 4],
    deniedRoles: [2],
    rooms: ["101", "102", "103", "104"]
  },
  { 
    id: 2, 
    name: "Серверная", 
    building: "Главный корпус", 
    allowedRoles: [4, 5],
    deniedRoles: [1, 2, 3],
    rooms: ["305"]
  },
  { 
    id: 3, 
    name: "Читальные залы", 
    building: "Библиотека", 
    allowedRoles: [1, 2, 3, 4],
    deniedRoles: [],
    rooms: ["201", "202", "203"]
  },
  { 
    id: 4, 
    name: "Лаборатории химии", 
    building: "Лабораторный корпус", 
    allowedRoles: [1, 3, 4],
    deniedRoles: [2],
    rooms: ["401", "402", "403", "404", "405"]
  },
];

export default function FacilityMap() {
  const [zones, setZones] = useState<Zone[]>(mockZones);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  
  const [zoneFormData, setZoneFormData] = useState({
    name: "",
    building: "",
    rooms: "",
    allowedRoles: [] as number[],
    deniedRoles: [] as number[],
  });

  const handleCreateZone = () => {
    setEditingZone(null);
    setZoneFormData({
      name: "",
      building: "",
      rooms: "",
      allowedRoles: [],
      deniedRoles: [],
    });
    setIsZoneDialogOpen(true);
  };

  const handleEditZone = (zone: Zone) => {
    setEditingZone(zone);
    setZoneFormData({
      name: zone.name,
      building: zone.building,
      rooms: zone.rooms.join(", "),
      allowedRoles: zone.allowedRoles,
      deniedRoles: zone.deniedRoles,
    });
    setIsZoneDialogOpen(true);
  };

  const handleSaveZone = () => {
    const roomsArray = zoneFormData.rooms
      .split(",")
      .map(r => r.trim())
      .filter(r => r);

    if (editingZone) {
      setZones(zones.map(z =>
        z.id === editingZone.id
          ? { ...z, ...zoneFormData, rooms: roomsArray }
          : z
      ));
    } else {
      const newZone: Zone = {
        id: Math.max(...zones.map(z => z.id)) + 1,
        name: zoneFormData.name,
        building: zoneFormData.building,
        rooms: roomsArray,
        allowedRoles: zoneFormData.allowedRoles,
        deniedRoles: zoneFormData.deniedRoles,
      };
      setZones([...zones, newZone]);
    }
    setIsZoneDialogOpen(false);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) return;
    
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-orange-100 text-orange-800",
      "bg-pink-100 text-pink-800",
    ];
    
    const newRole: Role = {
      id: Math.max(...roles.map(r => r.id)) + 1,
      name: newRoleName,
      color: colors[roles.length % colors.length],
    };
    
    setRoles([...roles, newRole]);
    setNewRoleName("");
    setIsRoleDialogOpen(false);
  };

  const handleDeleteZone = (id: number) => {
    if (confirm("Вы уверены, что хотите удалить эту зону?")) {
      setZones(zones.filter(z => z.id !== id));
    }
  };

  const toggleRoleAccess = (roleId: number, type: "allowed" | "denied") => {
    if (type === "allowed") {
      const isAllowed = zoneFormData.allowedRoles.includes(roleId);
      setZoneFormData({
        ...zoneFormData,
        allowedRoles: isAllowed
          ? zoneFormData.allowedRoles.filter(id => id !== roleId)
          : [...zoneFormData.allowedRoles, roleId],
        deniedRoles: zoneFormData.deniedRoles.filter(id => id !== roleId),
      });
    } else {
      const isDenied = zoneFormData.deniedRoles.includes(roleId);
      setZoneFormData({
        ...zoneFormData,
        deniedRoles: isDenied
          ? zoneFormData.deniedRoles.filter(id => id !== roleId)
          : [...zoneFormData.deniedRoles, roleId],
        allowedRoles: zoneFormData.allowedRoles.filter(id => id !== roleId),
      });
    }
  };

  const getRoleById = (id: number) => roles.find(r => r.id === id);

  const groupedZones = zones.reduce((acc, zone) => {
    if (!acc[zone.building]) {
      acc[zone.building] = [];
    }
    acc[zone.building].push(zone);
    return acc;
  }, {} as Record<string, Zone[]>);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Карта помещений и доступ</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
            <Users className="size-4 mr-2" />
            Управление ролями
          </Button>
          <Button onClick={handleCreateZone}>
            <Plus className="size-4 mr-2" />
            Добавить зону
          </Button>
        </div>
      </div>

      {/* Roles Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Роли в системе</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {roles.map(role => (
              <Badge key={role.id} className={role.color}>
                {role.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Zones by Building */}
      <div className="space-y-6">
        {Object.entries(groupedZones).map(([building, buildingZones]) => (
          <Card key={building}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="size-5 text-gray-500" />
                  <CardTitle className="text-lg">{building}</CardTitle>
                  <Badge variant="outline">{buildingZones.length} зон</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {buildingZones.map(zone => (
                  <div key={zone.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium">{zone.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {zone.rooms.length} кабинетов
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          Кабинеты: {zone.rooms.join(", ")}
                        </div>

                        <div className="space-y-2">
                          {zone.allowedRoles.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">Разрешен доступ:</span>
                              {zone.allowedRoles.map(roleId => {
                                const role = getRoleById(roleId);
                                return role ? (
                                  <Badge key={roleId} className={`text-xs ${role.color}`}>
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}

                          {zone.deniedRoles.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs text-gray-500">Запрещен доступ:</span>
                              {zone.deniedRoles.map(roleId => {
                                const role = getRoleById(roleId);
                                return role ? (
                                  <Badge key={roleId} variant="outline" className="text-xs line-through">
                                    {role.name}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditZone(zone)}
                        >
                          <Edit className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteZone(zone.id)}
                        >
                          <Trash2 className="size-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zone Dialog */}
      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingZone ? "Редактировать зону" : "Создать зону"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Название зоны</Label>
                <Input
                  id="zoneName"
                  value={zoneFormData.name}
                  onChange={(e) => setZoneFormData({ ...zoneFormData, name: e.target.value })}
                  placeholder="Например: Лаборатории физики"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="building">Корпус</Label>
                <Input
                  id="building"
                  value={zoneFormData.building}
                  onChange={(e) => setZoneFormData({ ...zoneFormData, building: e.target.value })}
                  placeholder="Например: Главный корпус"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rooms">Кабинеты</Label>
              <Input
                id="rooms"
                value={zoneFormData.rooms}
                onChange={(e) => setZoneFormData({ ...zoneFormData, rooms: e.target.value })}
                placeholder="Например: 101, 102, 103"
              />
              <p className="text-xs text-gray-500">Перечислите номера через запятую</p>
            </div>

            <div className="space-y-3">
              <Label>Настройка доступа по ролям</Label>
              {roles.map(role => (
                <div key={role.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={role.color}>{role.name}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`allow-${role.id}`}
                        checked={zoneFormData.allowedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRoleAccess(role.id, "allowed")}
                      />
                      <label
                        htmlFor={`allow-${role.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Разрешить
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`deny-${role.id}`}
                        checked={zoneFormData.deniedRoles.includes(role.id)}
                        onCheckedChange={() => toggleRoleAccess(role.id, "denied")}
                      />
                      <label
                        htmlFor={`deny-${role.id}`}
                        className="text-sm cursor-pointer"
                      >
                        Запретить
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsZoneDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveZone}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Управление ролями</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newRole">Создать новую роль</Label>
              <div className="flex gap-2">
                <Input
                  id="newRole"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Название роли"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRole()}
                />
                <Button onClick={handleCreateRole}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Существующие роли</Label>
              <div className="space-y-2">
                {roles.map(role => (
                  <div key={role.id} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <Badge className={role.color}>{role.name}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setIsRoleDialogOpen(false)}>Закрыть</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
