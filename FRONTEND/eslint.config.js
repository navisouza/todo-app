import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Regra nova da v7 do plugin, reclama de qualquer setState dentro de
      // useEffect - inclusive o padrão padrão de "buscar dados no mount",
      // usado em várias telas aqui. Desligando até avaliarmos migrar pra
      // uma lib de data fetching (React Query/SWR) que resolveria isso de
      // verdade.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // Snippets gerados pelo CLI do Chakra UI (`npx @chakra-ui/cli snippet add`).
    // Misturam hooks e valores exportados junto com componentes por design -
    // é assim que o próprio Chakra distribui esses arquivos, então não faz
    // sentido reestruturar (perderíamos a possibilidade de atualizar via CLI).
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
