import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { apiFetch } from "../api/client";

type Group = { _id: string; name: string; parent_group_id?: string | null; description?: string | null };
type Person = { _id: string; full_name: string; role: string; status: string; group_ids?: string[] };

const roleLabel: Record<string, string> = {
    student: "Студент", staff: "Сотрудник", guest: "Гость",
};

export default function GroupDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [group, setGroup] = useState<Group | null>(null);
    const [parent, setParent] = useState<Group | null>(null);
    const [members, setMembers] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiFetch<Group>(`/api/v1/groups/${id}/`),
            apiFetch<Person[]>("/api/v1/people/"),
            apiFetch<Group[]>("/api/v1/groups/"),
        ]).then(([g, people, groups]) => {
            setGroup(g);
            setMembers(people.filter((p) => p.group_ids?.includes(id!)));
            if (g.parent_group_id) {
                const p = groups.find((gr) => gr._id === g.parent_group_id);
                setParent(p ?? null);
            }
        }).catch(() => navigate("/groups"))
            .finally(() => setIsLoading(false));
    }, [id]);

    if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;
    if (!group) return null;

    return (
        <div className="p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate("/groups")}>
                    <ArrowLeft className="size-4 mr-1" /> Назад
                </Button>
                <h1 className="text-2xl font-semibold flex-1">{group.name}</h1>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader><CardTitle>Информация</CardTitle></CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-y-4 text-sm">
                            <div>
                                <dt className="text-gray-500 mb-1">Описание</dt>
                                <dd>{group.description ?? "—"}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500 mb-1">Родительская группа</dt>
                                <dd>{parent ? parent.name : "—"}</dd>
                            </div>
                        </dl>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Участники ({members.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {members.length === 0 ? (
                            <p className="text-sm text-gray-500">Нет участников</p>
                        ) : (
                            <div className="space-y-2">
                                {members.map((p) => (
                                    <div key={p._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">{p.full_name}</p>
                                            <p className="text-xs text-gray-500">{roleLabel[p.role] ?? p.role}</p>
                                        </div>
                                        <Badge className={p.status === "active"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"}>
                                            {p.status === "active" ? "Активен" : "Заблокирован"}
                                        </Badge>
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