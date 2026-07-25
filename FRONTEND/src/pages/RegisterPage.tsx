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
import { isAxiosError } from "axios";
import { useAuth } from "../hooks/useAuth";
import { useAccentTheme } from "../hooks/useAccentTheme";
import { ColorModeButton } from "@/components/ui/color-mode";
import { AccentThemeMenu } from "../components/AccentThemeMenu";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { colorPalette } = useAccentTheme();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register(username, email, password, passwordConfirm);
      navigate("/");
    } catch (err) {
      if (isAxiosError(err) && err.response?.data) {
        const data = err.response.data as Record<string, string[]>;
        const firstError = Object.values(data).flat()[0];
        setError(firstError ?? "Não foi possível criar a conta.");
      } else {
        setError("Não foi possível criar a conta.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box maxW="sm" mx="auto" mt="20">
      <HStack justify="space-between" mb="6">
        <Heading>Criar conta</Heading>
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
              data-testid="register-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Email</Field.Label>
            <Input
              data-testid="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Senha</Field.Label>
            <Input
              data-testid="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Confirmar senha</Field.Label>
            <Input
              data-testid="register-password-confirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </Field.Root>

          {error && <Text color="red.500">{error}</Text>}

          <Button
            data-testid="register-submit"
            type="submit"
            colorPalette={colorPalette}
            loading={isSubmitting}
          >
            Criar conta
          </Button>

          <Text>
            Já tem conta?{" "}
            <ChakraLink asChild color={colorPalette === "cute" ? "cute.600" : "blue.500"}>
              <RouterLink to="/login">Entrar</RouterLink>
            </ChakraLink>
          </Text>
        </Stack>
      </form>
    </Box>
  );
}
