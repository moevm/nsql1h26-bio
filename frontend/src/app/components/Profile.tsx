import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Shield,
  Activity,
  Clock,
  Lock,
  Bell,
  Save
} from "lucide-react";
import { Switch } from "./ui/switch";

type ActivityLog = {
  id: number;
  action: string;
  timestamp: string;
  details: string;
};

const mockActivityLogs: ActivityLog[] = [
  { id: 1, action: "Создан новый сотрудник", timestamp: "2026-03-11 10:23", details: "Иванов И.И." },
  { id: 2, action: "Изменены права доступа", timestamp: "2026-03-11 09:45", details: "Зона: Серверная" },
  { id: 3, action: "Экспорт логов", timestamp: "2026-03-11 09:12", details: "За месяц (CSV)" },
  { id: 4, action: "Редактирование сотрудника", timestamp: "2026-03-10 16:34", details: "Петрова А.С. - изменен статус" },
  { id: 5, action: "Создана новая зона", timestamp: "2026-03-10 14:22", details: "Лаборатории химии" },
  { id: 6, action: "Импорт данных", timestamp: "2026-03-10 11:05", details: "145 записей добавлено" },
];

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    lastName: "Администратор",
    firstName: "Безопасности",
    middleName: "",
    email: "admin@university.edu",
    phone: "+7 (999) 123-45-67",
    position: "Администратор безопасности",
    department: "Служба безопасности",
    employedSince: "2024-01-15",
  });

  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    securityAlerts: true,
    dailyReports: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Здесь будет логика сохранения
    alert("Профиль успешно обновлен");
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert("Пароль должен быть не менее 8 символов");
      return;
    }
    // Здесь будет логика смены пароля
    alert("Пароль успешно изменен");
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const stats = [
    { label: "Дней с момента регистрации", value: "421", icon: Calendar },
    { label: "Выполнено действий", value: "1,247", icon: Activity },
    { label: "Создано сотрудников", value: "156", icon: User },
    { label: "Настроено зон доступа", value: "24", icon: Building },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Личный кабинет</h1>
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Shield className="size-3 mr-1" />
          Администратор
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <stat.icon className="size-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Личные данные</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Редактировать
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleSaveProfile}>
                      <Save className="size-4 mr-2" />
                      Сохранить
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="size-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                  АБ
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profileData.lastName} {profileData.firstName}
                  </h3>
                  <p className="text-sm text-gray-500">{profileData.position}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastName">Фамилия</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="firstName">Имя</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middleName">Отчество</Label>
                  <Input
                    id="middleName"
                    value={profileData.middleName}
                    onChange={(e) => setProfileData({ ...profileData, middleName: e.target.value })}
                    disabled={!isEditing}
                    placeholder="Не указано"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Должность</Label>
                  <Input
                    id="position"
                    value={profileData.position}
                    onChange={(e) => setProfileData({ ...profileData, position: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Подразделение</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="department"
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employedSince">Дата начала работы</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="employedSince"
                      type="date"
                      value={profileData.employedSince}
                      onChange={(e) => setProfileData({ ...profileData, employedSince: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="size-5" />
                Безопасность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Текущий пароль</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Новый пароль</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                  <p className="text-xs text-gray-500">Минимум 8 символов</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button onClick={handleChangePassword} variant="outline" className="w-full">
                Изменить пароль
              </Button>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Последние входы в систему</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-400" />
                      <span>2026-03-11 08:30</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Chrome, Windows</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-400" />
                      <span>2026-03-10 09:15</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Chrome, Windows</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-gray-400" />
                      <span>2026-03-09 08:45</span>
                    </div>
                    <Badge variant="outline" className="text-xs">Firefox, Windows</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                История активности
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Действие</TableHead>
                    <TableHead>Время</TableHead>
                    <TableHead>Детали</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockActivityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.timestamp}</TableCell>
                      <TableCell className="text-sm text-gray-500">{log.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="size-5" />
                Уведомления
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotif" className="text-sm">Email уведомления</Label>
                  <p className="text-xs text-gray-500">Получать на почту</p>
                </div>
                <Switch
                  id="emailNotif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="smsNotif" className="text-sm">SMS уведомления</Label>
                  <p className="text-xs text-gray-500">Получать на телефон</p>
                </div>
                <Switch
                  id="smsNotif"
                  checked={settings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, smsNotifications: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="securityAlerts" className="text-sm">Оповещения безопасности</Label>
                  <p className="text-xs text-gray-500">Неудачные попытки входа</p>
                </div>
                <Switch
                  id="securityAlerts"
                  checked={settings.securityAlerts}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, securityAlerts: checked })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dailyReports" className="text-sm">Ежедневные отчеты</Label>
                  <p className="text-xs text-gray-500">Статистика за день</p>
                </div>
                <Switch
                  id="dailyReports"
                  checked={settings.dailyReports}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, dailyReports: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Access Rights */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Права доступа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Управление сотрудниками</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Полный доступ
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Логи событий</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Полный доступ
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Карта помещений</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Полный доступ
                  </Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">Импорт/Экспорт</span>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                    Полный доступ
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Информация</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">ID администратора</p>
                <p className="font-mono font-medium">#ADM-001</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Уровень доступа</p>
                <p className="font-medium">Максимальный</p>
              </div>
              <Separator />
              <div>
                <p className="text-gray-500">Последнее обновление профиля</p>
                <p className="font-medium">2026-03-01 14:30</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
