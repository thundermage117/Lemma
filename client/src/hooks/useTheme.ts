import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lemma-theme'

function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme
    }
  } catch {
    // Ignore storage access failures and fall back to runtime defaults.
  }

  return null
}

function getInitialTheme(): Theme {
  const storedTheme = getStoredTheme()
  if (storedTheme) {
    return storedTheme
  }

  if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
    return 'dark'
  }

  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  root.style.colorScheme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Ignore storage access failures.
    }
  }, [theme])

  const toggleTheme = () => {
    const isDarkNow = document.documentElement.classList.contains('dark')
    setTheme(isDarkNow ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme }
}
