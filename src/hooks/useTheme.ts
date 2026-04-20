import { useState, useEffect } from 'react'

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') ?? 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(old => old === 'light' ? 'dark' : 'light')

  return { theme, toggleTheme }
}

export const initTheme = () => {
  const saved = localStorage.getItem('theme') ?? 'dark'
  document.documentElement.classList.toggle('dark', saved === 'dark')
}