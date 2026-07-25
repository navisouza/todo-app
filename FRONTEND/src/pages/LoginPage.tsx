import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Field,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAccentTheme } from "../hooks/useAccentTheme";
import { ColorModeButton } from "@/components/ui/color-mode";
import { AccentThemeMenu } from "../components/AccentThemeMenu";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { colorPalette } = useAccentTheme();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      setError("Usuário ou senha inválidos.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt="20">
      <HStack justify="space-between" mb="6">
        <Heading>Entrar</Heading>
        <HStack>
          <AccentThemeMenu />
          <ColorModeButton />
        </HStack>
      </HStack>
      <form onSubmit={handleSubmit}>
        <Stack gap="4">
          <Field.Root required>
            <Field.Label>Usuário</Field.Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Senha</Field.Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          {error && <Text color="red.500">{error}</Text>}

          <Button type="submit" colorPalette={colorPalette} loading={isSubmitting}>
            Entrar
          </Button>

          <Text>
            Não tem conta?{" "}
            <ChakraLink asChild color={colorPalette === "cute" ? "cute.600" : "blue.500"}>
              <RouterLink to="/register">Cadastre-se</RouterLink>
            </ChakraLink>
          </Text>
        </Stack>
      </form>
    </Box>
  );
}
