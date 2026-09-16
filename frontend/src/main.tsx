import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import App from "./app/App.tsx";
import { oidcConfig } from "./app/auth/oidcConfig";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider {...oidcConfig}>
    <App />
  </AuthProvider>
);
  