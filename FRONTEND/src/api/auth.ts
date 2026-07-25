import { apiClient } from "./client";
import type { User } from "../types";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export async function register(
  payload: RegisterPayload,
): Promise<{ user: User } & AuthTokens> {
  const { data } = await apiClient.post("/auth/register/", payload);
  return data;
}

export async function login(
  username: string,
  password: string,
): Promise<AuthTokens> {
  const { data } = await apiClient.post("/auth/login/", { username, password });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get("/auth/me/");
  return data;
}
