import { useEffect, useState, type ReactNode } from "react"
import { AccentThemeContext, type AccentTheme } from "./AccentThemeContext"

const STORAGE_KEY = "accent_theme"

const PALETTE_BY_THEME: Record<AccentTheme, string> = {
  casual: "blue",
  cute: "cute",
}

function getInitialTheme(): AccentTheme {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === "cute" ? "cute" : "casual"
}

export function AccentThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AccentTheme>(getInitialTheme)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  function setTheme(next: AccentTheme) {
    setThemeState(next)
  }

  return (
    <AccentThemeContext.Provider
      value={{ theme, setTheme, colorPalette: PALETTE_BY_THEME[theme] }}
    >
      {children}
    </AccentThemeContext.Provider>
  )
}
