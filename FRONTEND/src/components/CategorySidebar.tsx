import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react";
import { LuPencil, LuTrash2, LuX, LuCheck, LuPlus } from "react-icons/lu";
import type { Category } from "../types";
import { useAccentTheme } from "../hooks/useAccentTheme";

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (id: number | null) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function CategorySidebar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  onCreate,
  onRename,
  onDelete,
}: CategorySidebarProps) {
  const { colorPalette } = useAccentTheme();
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    await onCreate(newName.trim());
    setNewName("");
  }

  function startEditing(category: Category) {
    setEditingId(category.id);
    setEditingName(category.name);
  }

  async function confirmEditing() {
    if (editingId !== null && editingName.trim()) {
      await onRename(editingId, editingName.trim());
    }
    setEditingId(null);
  }

  return (
    <Box
      w="280px"
      bg="white"
      _dark={{ bg: "gray.800" }}
      boxShadow="sm"
      p="5"
      h="100vh"
      overflowY="auto"
    >
      <Heading size="sm" mb="4" color="fg.muted" letterSpacing="wide" textTransform="uppercase">
        Categorias
      </Heading>

      <Stack gap="1" mb="5">
        <Button
          justifyContent="flex-start"
          borderRadius="lg"
          colorPalette={colorPalette}
          variant={selectedCategoryId === null ? "solid" : "ghost"}
          onClick={() => onSelectCategory(null)}
        >
          Todas as Categorias
        </Button>

        {categories.map((category) => (
          <HStack key={category.id} justify="space-between">
            {editingId === category.id ? (
              <HStack flex="1">
                <Input
                  size="sm"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                />
                <IconButton
                  size="sm"
                  aria-label="Salvar"
                  onClick={confirmEditing}
                >
                  <LuCheck />
                </IconButton>
                <IconButton
                  size="sm"
                  aria-label="Cancelar"
                  onClick={() => setEditingId(null)}
                >
                  <LuX />
                </IconButton>
              </HStack>
            ) : (
              <>
                <Button
                  flex="1"
                  justifyContent="flex-start"
                  borderRadius="lg"
                  colorPalette={colorPalette}
                  variant={
                    selectedCategoryId === category.id ? "solid" : "ghost"
                  }
                  onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </Button>
                <IconButton
                  size="sm"
                  variant="ghost"
                  borderRadius="lg"
                  aria-label="Editar"
                  onClick={() => startEditing(category)}
                >
                  <LuPencil />
                </IconButton>
                <IconButton
                  size="sm"
                  variant="ghost"
                  borderRadius="lg"
                  aria-label="Excluir"
                  onClick={() => onDelete(category.id)}
                >
                  <LuTrash2 />
                </IconButton>
              </>
            )}
          </HStack>
        ))}

        {categories.length === 0 && (
          <Text fontSize="sm" color="gray.500">
            Nenhuma categoria ainda.
          </Text>
        )}
      </Stack>

      <form onSubmit={handleCreate}>
        <HStack>
          <Input
            data-testid="new-category-input"
            size="sm"
            variant="subtle"
            placeholder="Nova categoria"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <IconButton
            data-testid="new-category-submit"
            size="sm"
            colorPalette={colorPalette}
            type="submit"
            aria-label="Adicionar categoria"
          >
            <LuPlus />
          </IconButton>
        </HStack>
      </form>
    </Box>
  );
}
