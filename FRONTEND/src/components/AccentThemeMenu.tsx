import { HStack, Icon, Menu, Text } from "@chakra-ui/react";
import { LuCheck, LuPalette } from "react-icons/lu";
import { useAccentTheme } from "../hooks/useAccentTheme";
import type { AccentTheme } from "../contexts/AccentThemeContext";

const THEME_LABEL: Record<AccentTheme, string> = {
  casual: "Casual",
  cute: "Cute",
};

export function AccentThemeMenu() {
  const { theme, setTheme } = useAccentTheme();

  return (
    <Menu.Root>
      <Menu.Trigger asChild>
        <Icon as={LuPalette} boxSize="5" />
      </Menu.Trigger>
      <Menu.Positioner>
        <Menu.Content>
          {(Object.keys(THEME_LABEL) as AccentTheme[]).map((option) => (
            <Menu.Item
              key={option}
              value={option}
              onSelect={() => setTheme(option)}
            >
              <HStack justify="space-between" w="full">
                <Text>{THEME_LABEL[option]}</Text>
                {theme === option && <LuCheck />}
              </HStack>
            </Menu.Item>
          ))}
        </Menu.Content>
      </Menu.Positioner>
    </Menu.Root>
  );
}
