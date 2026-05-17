import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Shield, Lock, Bell, Save, User } from "lucide-react";
import { Switch } from "./ui/switch";
import { apiFetch } from "../api/client";

type UserMe = { username: string; role: string; full_name: string };

const roleLabel: Record<string, string> = {
  admin: "Администратор",
  guard: "Охранник",
};

export default function Profile() {
  const [user, setUser] = useState<UserMe | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    lastName: "",
    firstName: "",
    middleName: "",
    department: "",
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

  useEffect(() => {
    apiFetch<UserMe>("/api/v1/auth/me").then((u) => {
      setUser(u);
      const parts = u.full_name.split(" ");
      setProfileData({
        lastName: parts[0] ?? "",
        firstName: parts[1] ?? "",
        middleName: parts[2] ?? "",
        department: "Служба безопасности",
      });
    }).catch(() => {});
  }, []);

  const initials = user?.full_name
      ? user.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
      : "?";

  const handleSaveProfile = () => {
    setIsEditing(false);
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
    alert("Пароль успешно изменен");
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!user) return <div className="p-6 text-gray-500">Загрузка...</div>;

  return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Личный кабинет</h1>
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Shield className="size-3 mr-1" />
            {roleLabel[user.role] ?? user.role}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Личные данные</CardTitle>
                  {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>Редактировать</Button>
                  ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Отмена</Button>
                        <Button onClick={handleSaveProfile}>
                          <Save className="size-4 mr-2" />Сохранить
                        </Button>
                      </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="size-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-gray-500">{roleLabel[user.role] ?? user.role}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Фамилия</Label>
                    <Input value={profileData.lastName}
                           onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                           disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input value={profileData.firstName}
                           onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                           disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Отчество</Label>
                    <Input value={profileData.middleName}
                           onChange={(e) => setProfileData({ ...profileData, middleName: e.target.value })}
                           disabled={!isEditing} placeholder="Не указано" />
                  </div>
                  <div className="space-y-2">
                    <Label>Отдел</Label>
                    <Input value={profileData.department}
                           onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                           disabled={!isEditing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Логин</Label>
                    <Input value={user.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Роль</Label>
                    <Input value={roleLabel[user.role] ?? user.role} disabled />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="size-5" />
                  Смена пароля
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Текущий пароль</Label>
                  <Input type="password" value={passwordData.currentPassword}
                         onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Новый пароль</Label>
                  <Input type="password" value={passwordData.newPassword}
                         onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Подтвердите пароль</Label>
                  <Input type="password" value={passwordData.confirmPassword}
                         onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                </div>
                <Button onClick={handleChangePassword} variant="outline" className="w-full">
                  Изменить пароль
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="size-5" />
                  Уведомления
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Email уведомления", desc: "Получать на почту" },
                  { key: "smsNotifications", label: "SMS уведомления", desc: "Получать на телефон" },
                  { key: "securityAlerts", label: "Оповещения безопасности", desc: "Неудачные попытки входа" },
                  { key: "dailyReports", label: "Ежедневные отчеты", desc: "Статистика за день" },
                ].map((item, i) => (
                    <div key={item.key}>
                      {i > 0 && <Separator className="mb-4" />}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm">{item.label}</Label>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <Switch
                            checked={settings[item.key as keyof typeof settings]}
                            onCheckedChange={(checked) =>
                                setSettings({ ...settings, [item.key]: checked })
                            }
                        />
                      </div>
                    </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Логин</p>
                  <p className="font-mono font-medium">{user.username}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-gray-500">Роль</p>
                  <p className="font-medium">{roleLabel[user.role] ?? user.role}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}