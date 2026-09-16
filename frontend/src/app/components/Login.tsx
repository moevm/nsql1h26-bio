import { Navigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function Login() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход</CardTitle>
        </CardHeader>
        <CardContent>
          {auth.error && (
            <div className="text-sm text-red-600 mb-4">
              Ошибка входа: {auth.error.message}
            </div>
          )}
          <Button className="w-full" onClick={() => auth.signinRedirect()}>
            Войти через Keycloak
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}