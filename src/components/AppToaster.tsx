import { Toaster } from '@/components/ui/sonner'
import { useState, useEffect } from 'react'

const AppToaster = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light')
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return (
    <Toaster
      position="top-right"
      visibleToasts={2}
      closeButton
      expand
      duration={5000}
      richColors
      theme={theme}
    />
  )
}

export default AppToaster