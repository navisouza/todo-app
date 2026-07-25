import {
  Badge,
  Box,
  Checkbox,
  HStack,
  IconButton,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuPencil, LuShare2, LuTrash2 } from "react-icons/lu";
import type { Task } from "../types";

const PRIORITY_LABEL: Record<Task["priority"], string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const PRIORITY_COLOR: Record<Task["priority"], string> = {
  low: "gray",
  medium: "yellow",
  high: "red",
};

interface TaskCardProps {
  task: Task;
  currentUserId: number;
  onToggleComplete: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onShare: (task: Task) => void;
}

export function TaskCard({
  task,
  currentUserId,
  onToggleComplete,
  onEdit,
  onDelete,
  onShare,
}: TaskCardProps) {
  const isOwner = task.owner.id === currentUserId;

  return (
    <Box
      data-testid={`task-card-${task.id}`}
      bg="white"
      _dark={{ bg: "gray.800" }}
      borderRadius="xl"
      boxShadow="sm"
      p="4"
      transition="box-shadow 0.15s ease, transform 0.15s ease"
      _hover={{ boxShadow: "md" }}
      opacity={task.is_completed ? 0.65 : 1}
    >
      <HStack align="start" gap="3">
        <Box pt="1">
          <Checkbox.Root
            data-testid="task-checkbox"
            checked={task.is_completed}
            colorPalette={isOwner ? undefined : "purple"}
            onCheckedChange={() => onToggleComplete(task.id)}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        </Box>

        <Stack gap="1.5" flex="1">
          <Text
            data-testid="task-title"
            textDecoration={task.is_completed ? "line-through" : "none"}
            fontWeight="semibold"
          >
            {task.title}
          </Text>
          {task.description && (
            <Text fontSize="sm" color="fg.muted">
              {task.description}
            </Text>
          )}
          <HStack gap="2" wrap="wrap" mt="1">
            <Badge colorPalette={PRIORITY_COLOR[task.priority]} borderRadius="full">
              {PRIORITY_LABEL[task.priority]}
            </Badge>
            {task.due_date && (
              <Badge variant="outline" borderRadius="full">
                {task.due_date}
              </Badge>
            )}
            {!isOwner && (
              <Badge colorPalette="purple" variant="subtle" borderRadius="full">
                Compartilhada por {task.owner.username}
              </Badge>
            )}
            {isOwner && task.shared_with.length > 0 && (
              <Badge variant="outline" borderRadius="full">
                Compartilhada com {task.shared_with.length}
              </Badge>
            )}
          </HStack>
        </Stack>

        <Spacer />

        {isOwner && (
          <HStack gap="1">
            <IconButton
              size="sm"
              variant="ghost"
              borderRadius="lg"
              aria-label="Compartilhar"
              onClick={() => onShare(task)}
            >
              <LuShare2 />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              borderRadius="lg"
              aria-label="Editar"
              onClick={() => onEdit(task)}
            >
              <LuPencil />
            </IconButton>
            <IconButton
              size="sm"
              variant="ghost"
              borderRadius="lg"
              colorPalette="red"
              aria-label="Excluir"
              onClick={() => onDelete(task.id)}
            >
              <LuTrash2 />
            </IconButton>
          </HStack>
        )}
      </HStack>
    </Box>
  );
}
