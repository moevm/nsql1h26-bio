import type { AuthProviderProps } from "react-oidc-context";

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL ?? "http://localhost:8081";

export const oidcConfig: AuthProviderProps = {
  authority: `${KEYCLOAK_URL}/realms/skud`,
  client_id: "skud-frontend",
  redirect_uri: window.location.origin,
  response_type: "code",
  scope: "openid profile",
  onSigninCallback: () => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
};