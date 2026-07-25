import { useContext } from "react"
import { AccentThemeContext } from "../contexts/AccentThemeContext"

export function useAccentTheme() {
  const context = useContext(AccentThemeContext)
  if (!context) {
    throw new Error("useAccentTheme precisa ser usado dentro de um AccentThemeProvider")
  }
  return context
}
