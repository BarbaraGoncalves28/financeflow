import { api } from "./api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: AuthUser;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await api.get<AuthResponse>("/auth/me");

  return response.data.user;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}