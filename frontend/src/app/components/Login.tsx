import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { setToken, getToken, loginRequest } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getToken()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!login.trim() || !password.trim()) {
      setError("Введите логин и пароль.");
      return;
    }

    setLoading(true);
    try {
      const token = await loginRequest(login, password);
      setToken(token);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ошибка подключения к серверу.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Вход</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                    id="login"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                />
              </div>

              {error && <div className="text-sm text-red-600">{error}</div>}

              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Вход..." : "Войти"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
  );
}