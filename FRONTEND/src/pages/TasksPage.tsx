import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  NativeSelect,
  Separator,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuLogOut, LuPlus } from "react-icons/lu";
import { useAuth } from "../hooks/useAuth";
import { CategorySidebar } from "../components/CategorySidebar";
import { TaskCard } from "../components/TaskCard";
import { TaskFormDialog } from "../components/TaskFormDialog";
import { TaskShareDialog } from "../components/TaskShareDialog";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../api/categories";
import {
  createTask,
  deleteTask,
  listTasks,
  shareTask,
  toggleTaskComplete,
  unshareTask,
  updateTask,
} from "../api/tasks";
import type { TaskPayload } from "../api/tasks";
import type { Category, Task } from "../types";
import { toaster } from "@/components/ui/toaster";
import { ColorModeButton } from "@/components/ui/color-mode";
import { useAccentTheme } from "../hooks/useAccentTheme";
import { AccentThemeMenu } from "../components/AccentThemeMenu";

export default function TasksPage() {
  const { user, logout } = useAuth();
  const { colorPalette } = useAccentTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCount, setTaskCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [isShareOpen, setIsShareOpen] = useState(false);
  const [sharingTask, setSharingTask] = useState<Task | null>(null);

  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [priorityFilter, setPriorityFilter] = useState<
    "" | "low" | "medium" | "high"
  >("");
  const [searchText, setSearchText] = useState("");

  const loadCategories = useCallback(async () => {
    const data = await listCategories();
    setCategories(data);
  }, []);

  const loadTasks = useCallback(async () => {
    setIsLoadingTasks(true);
    try {
      const data = await listTasks({
        category_id: selectedCategoryId ?? undefined,
        is_completed: statusFilter === "" ? undefined : statusFilter === "true",
        priority: priorityFilter === "" ? undefined : priorityFilter,
        search: searchText || undefined,
        page,
      });
      setTasks(data.results);
      setTaskCount(data.count);
      setHasNext(data.next !== null);
      setHasPrevious(data.previous !== null);
    } finally {
      setIsLoadingTasks(false);
    }
  }, [selectedCategoryId, statusFilter, priorityFilter, searchText, page]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategoryId, statusFilter, priorityFilter, searchText]);

  async function handleCreateCategory(name: string) {
    try {
      await createCategory(name);
      await loadCategories();
      toaster.create({ title: "Categoria criada", type: "success" });
    } catch {
      toaster.create({ title: "Erro ao criar categoria", type: "error" });
    }
  }

  async function handleRenameCategory(id: number, name: string) {
    try {
      await updateCategory(id, name);
      await loadCategories();
      toaster.create({ title: "Categoria renomeada", type: "success" });
    } catch {
      toaster.create({ title: "Erro ao renomear categoria", type: "error" });
    }
  }

  async function handleDeleteCategory(id: number) {
    try {
      await deleteCategory(id);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
      await loadCategories();
      toaster.create({ title: "Categoria excluída", type: "success" });
    } catch {
      toaster.create({ title: "Erro ao excluir categoria", type: "error" });
    }
  }

  async function handleToggleComplete(id: number) {
    try {
      await toggleTaskComplete(id);
      await loadTasks();
    } catch {
      toaster.create({ title: "Erro ao atualizar tarefa", type: "error" });
    }
  }

  async function handleDeleteTask(id: number) {
    try {
      await deleteTask(id);
      await loadTasks();
      toaster.create({ title: "Tarefa excluída", type: "success" });
    } catch {
      toaster.create({ title: "Erro ao excluir tarefa", type: "error" });
    }
  }

  function openCreateForm() {
    setEditingTask(null);
    setIsFormOpen(true);
  }

  function openEditForm(task: Task) {
    setEditingTask(task);
    setIsFormOpen(true);
  }

  async function handleSubmitTask(payload: TaskPayload) {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, payload);
        toaster.create({ title: "Tarefa atualizada", type: "success" });
      } else {
        await createTask(payload);
        toaster.create({ title: "Tarefa criada", type: "success" });
      }
      await loadTasks();
    } catch {
      toaster.create({ title: "Erro ao salvar tarefa", type: "error" });
      throw new Error("Falha ao salvar tarefa");
    }
  }

  function openShareDialog(task: Task) {
    setSharingTask(task);
    setIsShareOpen(true);
  }

  async function handleShare(taskId: number, emails: string[]) {
    const updatedTask = await shareTask(taskId, emails);
    setSharingTask(updatedTask);
    await loadTasks();
  }

  async function handleUnshare(taskId: number, emails: string[]) {
    const updatedTask = await unshareTask(taskId, emails);
    setSharingTask(updatedTask);
    await loadTasks();
  }

  if (!user) return null;

  return (
    <Flex h="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <CategorySidebar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        onCreate={handleCreateCategory}
        onRename={handleRenameCategory}
        onDelete={handleDeleteCategory}
      />

      <Box flex="1" p={{ base: "4", md: "8" }} overflowY="auto">
        <HStack mb="8" gap="4">
          <Heading size="xl" letterSpacing="tight">
            Minhas tarefas
          </Heading>
          <Spacer />

          <HStack gap="2">
            <Avatar.Root size="sm" colorPalette={colorPalette}>
              <Avatar.Fallback name={user.username} />
            </Avatar.Root>
            <Text fontSize="sm" color="fg.muted">
              {user.username}
            </Text>
          </HStack>

          <Separator orientation="vertical" h="6" />

          <HStack gap="1">
            <AccentThemeMenu />
            <ColorModeButton />
          </HStack>

          <Button size="sm" variant="ghost" onClick={logout}>
            <LuLogOut /> Sair
          </Button>
        </HStack>

        <Box
          bg="white"
          _dark={{ bg: "gray.800" }}
          borderRadius="xl"
          boxShadow="sm"
          p="4"
          mb="6"
        >
          <HStack gap="3" wrap="wrap">
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              maxW="300px"
              variant="subtle"
            />

            <NativeSelect.Root maxW="180px">
              <NativeSelect.Field
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
              >
                <option value="">Todos os status</option>
                <option value="false">Pendentes</option>
                <option value="true">Concluídas</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <NativeSelect.Root maxW="180px">
              <NativeSelect.Field
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as typeof priorityFilter)
                }
              >
                <option value="">Todas as prioridades</option>
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Spacer />

            <Button colorPalette={colorPalette} onClick={openCreateForm}>
              <LuPlus /> Nova tarefa
            </Button>
          </HStack>
        </Box>

        <Stack gap="3">
          {isLoadingTasks && (
            <Text color="fg.muted" textAlign="center" py="8">
              Carregando...
            </Text>
          )}

          {!isLoadingTasks && tasks.length === 0 && (
            <Box
              bg="white"
              _dark={{ bg: "gray.800" }}
              borderRadius="xl"
              borderWidth="1px"
              borderStyle="dashed"
              py="12"
              textAlign="center"
            >
              <Text color="fg.muted">Nenhuma tarefa encontrada.</Text>
            </Box>
          )}

          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              currentUserId={user.id}
              onToggleComplete={handleToggleComplete}
              onEdit={openEditForm}
              onDelete={handleDeleteTask}
              onShare={openShareDialog}
            />
          ))}
        </Stack>

        {hasNext || hasPrevious ? (
          <HStack mt="6" justify="center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrevious}
            >
              Anterior
            </Button>
            <Text fontSize="sm" color="fg.muted">
              Página {page} · {taskCount} tarefa(s)
            </Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
            >
              Próxima
            </Button>
          </HStack>
        ) : (
          taskCount > 0 && (
            <Text mt="6" textAlign="center" fontSize="sm" color="fg.muted">
              {taskCount} tarefa(s)
            </Text>
          )
        )}
      </Box>

      <TaskFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categories={categories}
        initialTask={editingTask}
        onSubmit={handleSubmitTask}
      />

      <TaskShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        task={sharingTask}
        onShare={handleShare}
        onUnshare={handleUnshare}
      />
    </Flex>
  );
}
