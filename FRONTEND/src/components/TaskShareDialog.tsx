import { useState, type FormEvent } from "react";
import {
  Button,
  Dialog,
  HStack,
  IconButton,
  Input,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";
import type { Task } from "../types";

interface TaskShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onShare: (taskId: number, emails: string[]) => Promise<void>;
  onUnshare: (taskId: number, emails: string[]) => Promise<void>;
}

export function TaskShareDialog({
  isOpen,
  onClose,
  task,
  onShare,
  onUnshare,
}: TaskShareDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!task || !email.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onShare(task.id, [email.trim()]);
      setEmail("");
    } catch {
      setError(
        "Não foi possível compartilhar — confirme se o email está cadastrado.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemove(userEmail: string) {
    if (!task) return;
    await onUnshare(task.id, [userEmail]);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Compartilhar "{task?.title}"</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="4">
                <Stack gap="2">
                  <Text fontWeight="medium">Compartilhada com:</Text>
                  {task?.shared_with.length === 0 && (
                    <Text fontSize="sm" color="gray.500">
                      Ninguém ainda.
                    </Text>
                  )}
                  {task?.shared_with.map((sharedUser) => (
                    <HStack key={sharedUser.id} justify="space-between">
                      <Text fontSize="sm">{sharedUser.email}</Text>
                      <IconButton
                        size="xs"
                        variant="ghost"
                        aria-label="Remover"
                        onClick={() => handleRemove(sharedUser.email)}
                      >
                        <LuX />
                      </IconButton>
                    </HStack>
                  ))}
                </Stack>

                <form onSubmit={handleAdd}>
                  <HStack>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button type="submit" loading={isSubmitting}>
                      Adicionar
                    </Button>
                  </HStack>
                </form>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose}>
                Fechar
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
