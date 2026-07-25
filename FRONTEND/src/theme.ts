import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        cute: {
          50: { value: "#fdf4ff" },
          100: { value: "#fae8ff" },
          200: { value: "#f3d1fb" },
          300: { value: "#e9b8f5" },
          400: { value: "#d99ae8" },
          500: { value: "#c77dd9" },
          600: { value: "#b05fc0" },
          700: { value: "#8f479c" },
          800: { value: "#713a7c" },
          900: { value: "#5c3065" },
          950: { value: "#3a1d40" },
        },
      },
    },
    semanticTokens: {
      colors: {
        cute: {
          solid: { value: "{colors.cute.500}" },
          contrast: { value: "{colors.cute.50}" },
          fg: { value: "{colors.cute.700}" },
          muted: { value: "{colors.cute.100}" },
          subtle: { value: "{colors.cute.50}" },
          emphasized: { value: "{colors.cute.300}" },
          focusRing: { value: "{colors.cute.500}" },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
