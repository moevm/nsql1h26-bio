
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000"\;

export function getToken() {

  return localStorage.getItem("access_token");

}

export function setToken(token: string) {

  localStorage.setItem("access_token", token);

}

export function clearToken() {

  localStorage.removeItem("access_token");

}

export async function apiFetch<T>(

  path: string,

  options: RequestInit = {}

): Promise<T> {

  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {

    ...options,

    headers: {

      "Content-Type": "application/json",

      ...(token ? { Authorization: `Bearer ${token}` } : {}),

      ...(options.headers ?? {}),

    },

  });

  if (response.status === 401) {

    clearToken();

    window.location.href = "/login";

    throw new Error("Unauthorized");

  }

  if (!response.ok) {

    const text = await response.text();

    throw new Error(text || `Request failed with status ${response.status}`);

  }

  if (response.status === 204) {

    return undefined as T;

  }

  return response.json();

}

