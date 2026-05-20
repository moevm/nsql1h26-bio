import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { apiFetch } from "../api/client";

type Person = {
    _id: string; full_name: string; role: string;
    department: string; status: string; group_ids?: string[];
    created_at: string; updated_at: string;
};
type Group = { _id: string; name: string };

const roleLabel: Record<string, string> = {
    student: "Студент", staff: "Сотрудник", guest: "Гость",
};

export default function PersonDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [person, setPerson] = useState<Person | null>(null);
    const [groups, setGroups] = useState<Group[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<Person>(`/api/v1/people/${id}/`),
            apiFetch<Group[]>("/api/v1/groups/"),
        ]).then(([p, g]) => {
            setPerson(p);
            setGroups(g);
        }).catch(() => navigate("/people"))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;
    if (!person) return null;

    const personGroups = groups.filter((g) => person.group_ids?.includes(g._id));

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/people")}>
                    <ArrowLeft className="size-4 mr-1" /> Назад
                </Button>
                <h1 className="text-2xl font-semibold flex-1">{person.full_name}</h1>
                <Button variant="outline" size="sm" onClick={() => navigate("/people")}>
                    <Edit className="size-4 mr-1" /> Редактировать
                </Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <dt className="text-gray-500 mb-1">Роль</dt>
                            <dd>{roleLabel[person.role] ?? person.role}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Статус</dt>
                            <dd>
                                <Badge className={person.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"}>
                                    {person.status === "active" ? "Активен" : "Заблокирован"}
                                </Badge>
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Отдел</dt>
                            <dd>{person.department}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Группы</dt>
                            <dd>
                                {personGroups.length > 0
                                    ? personGroups.map((g) => (
                                        <Badge key={g._id} variant="secondary" className="mr-1">{g.name}</Badge>
                                    ))
                                    : "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Создан</dt>
                            <dd className="font-mono text-xs">{new Date(person.created_at).toLocaleString()}</dd>
                        </div>
                        <div>
                            <dt className="text-gray-500 mb-1">Обновлён</dt>
                            <dd className="font-mono text-xs">{new Date(person.updated_at).toLocaleString()}</dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>
        </div>
    );
}