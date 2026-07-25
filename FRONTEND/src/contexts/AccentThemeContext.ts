import { createContext } from "react"

export type AccentTheme = "casual" | "cute"

interface AccentThemeContextValue {
  theme: AccentTheme
  setTheme: (theme: AccentTheme) => void
  colorPalette: string
}

export const AccentThemeContext = createContext<AccentThemeContextValue | undefined>(
  undefined,
)
