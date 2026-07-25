import { apiClient } from "./client";
import type { Task, PaginatedResponse } from "../types";

export interface TaskFilters {
  is_completed?: boolean;
  category_id?: number;
  priority?: "low" | "medium" | "high";
  search?: string;
  ordering?: string;
  page?: number;
}

export interface TaskPayload {
  title: string;
  description?: string;
  category_id?: number | null;
  priority?: "low" | "medium" | "high";
  due_date?: string | null;
}

export async function listTasks(
  filters: TaskFilters = {},
): Promise<PaginatedResponse<Task>> {
  const { data } = await apiClient.get<PaginatedResponse<Task>>("/tasks/", {
    params: filters,
  });
  return data;
}

export async function createTask(payload: TaskPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks/", payload);
  return data;
}

export async function updateTask(
  id: number,
  payload: Partial<TaskPayload>,
): Promise<Task> {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}/`);
}

export async function toggleTaskComplete(id: number): Promise<Task> {
  const { data } = await apiClient.post<Task>(`/tasks/${id}/toggle-complete/`);
  return data;
}

export async function shareTask(id: number, emails: string[]): Promise<Task> {
  const { data } = await apiClient.post<Task>(`/tasks/${id}/share/`, {
    emails,
  });
  return data;
}

export async function unshareTask(id: number, emails: string[]): Promise<Task> {
  const { data } = await apiClient.post<Task>(`/tasks/${id}/unshare/`, {
    emails,
  });
  return data;
}
