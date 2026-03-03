import type { ApiError } from "../types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

// Sends a JSON request to the backend and unwraps API errors into plain Error instances.
export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiError | null;
    throw new Error(errorPayload?.message ?? "Request failed");
  }

  return response.json() as Promise<T>;
}
