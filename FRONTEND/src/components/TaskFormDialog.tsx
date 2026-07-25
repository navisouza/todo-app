import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Textarea,
  Text,
} from "@chakra-ui/react";
import type { Category, Task } from "../types";
import type { TaskPayload } from "../api/tasks";
import { checkHoliday } from "@/api/external";
import { useAccentTheme } from "../hooks/useAccentTheme";

interface TaskFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  initialTask: Task | null;
  onSubmit: (payload: TaskPayload) => Promise<void>;
}

export function TaskFormDialog({
  isOpen,
  onClose,
  categories,
  initialTask,
  onSubmit,
}: TaskFormDialogProps) {
  const { colorPalette } = useAccentTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [holidayWarning, setHolidayWarning] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setCategoryId(
        initialTask.category_id ? String(initialTask.category_id) : "",
      );
      setPriority(initialTask.priority);
      setDueDate(initialTask.due_date ?? "");
    } else {
      setTitle("");
      setDescription("");
      setCategoryId("");
      setPriority("medium");
      setDueDate("");
    }
  }, [initialTask, isOpen]);

  useEffect(() => {
    if (!dueDate) {
      setHolidayWarning(null);
      return;
    }
    let isCurrent = true;
    checkHoliday(dueDate).then((result) => {
      if (!isCurrent) return;
      setHolidayWarning(
        result.is_holiday
          ? `Atenção: ${result.holiday?.name} é feriado nacional.`
          : null,
      );
    });
    return () => {
      isCurrent = false;
    };
  }, [dueDate]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        title,
        description,
        category_id: categoryId ? Number(categoryId) : null,
        priority,
        due_date: dueDate || null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form onSubmit={handleSubmit}>
              <Dialog.Header>
                <Dialog.Title>
                  {initialTask ? "Editar tarefa" : "Nova tarefa"}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>Título</Field.Label>
                    <Input
                      data-testid="task-title-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      autoFocus
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Descrição</Field.Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Categoria</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                      >
                        <option value="">Sem categoria</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Prioridade</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        value={priority}
                        onChange={(e) =>
                          setPriority(e.target.value as Task["priority"])
                        }
                      >
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Data de vencimento</Field.Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                    {holidayWarning && (
                      <Text fontSize="sm" color="orange.500" mt="1">
                        {holidayWarning}
                      </Text>
                    )}
                  </Field.Root>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer>
                <Button variant="ghost" onClick={onClose} type="button">
                  Cancelar
                </Button>
                <Button
                  data-testid="task-save-button"
                  type="submit"
                  colorPalette={colorPalette}
                  loading={isSubmitting}
                >
                  Salvar
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
