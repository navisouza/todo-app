import { useEffect, useState, type ReactNode } from "react";
import {
  getMe,
  login as loginRequest,
  register as registerRequest,
} from "../api/auth";
import type { User } from "../types";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(username: string, password: string) {
    const tokens = await loginRequest(username, password);
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
    setUser(await getMe());
  }

  async function register(
    username: string,
    email: string,
    password: string,
    passwordConfirm: string,
  ) {
    const result = await registerRequest({
      username,
      email,
      password,
      password_confirm: passwordConfirm,
    });
    localStorage.setItem("access_token", result.access);
    localStorage.setItem("refresh_token", result.refresh);
    setUser(result.user);
  }

  function logout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
