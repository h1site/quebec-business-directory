'use client'

import { useMemo, useState, useEffect, createContext, useContext } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'

type Mode = 'light' | 'dark'

interface ColorModeContextType {
  mode: Mode
  toggleMode: () => void
}

export const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleMode: () => {},
})

export function useColorMode() {
  return useContext(ColorModeContext)
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('dark')

  useEffect(() => {
    const stored = localStorage.getItem('theme-mode') as Mode | null
    if (stored === 'light' || stored === 'dark') {
      setMode(stored)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme-mode', mode)
    document.documentElement.setAttribute('data-theme', mode)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [mode])

  const toggleMode = () => setMode(prev => prev === 'dark' ? 'light' : 'dark')

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'dark' ? {
        background: { default: '#0f172a', paper: '#1e293b' },
        primary: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7' },
        secondary: { main: '#22d3ee' },
        text: { primary: '#f8fafc', secondary: '#94a3b8' },
      } : {
        background: { default: '#f8fafc', paper: '#ffffff' },
        primary: { main: '#0284c7', light: '#0ea5e9', dark: '#0369a1' },
        secondary: { main: '#0891b2' },
        text: { primary: '#0f172a', secondary: '#475569' },
      }),
    },
    typography: {
      fontFamily: "'Inter', sans-serif",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, borderRadius: 12 },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: { borderRadius: 16, backgroundImage: 'none' },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
    },
  }), [mode])

  return (
    <ColorModeContext.Provider value={{ mode, toggleMode }}>
      <AppRouterCacheProvider options={{ key: 'mui' }}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AppRouterCacheProvider>
    </ColorModeContext.Provider>
  )
}
