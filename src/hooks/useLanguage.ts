import { useState } from 'react'

export const useLanguage = () => {
  const [language, setLanguage] = useState<'en' | 'pt'>(() => {
    return (localStorage.getItem('language') as 'en' | 'pt') ?? 'en'
  })

  const changeLanguage = (lang: 'en' | 'pt') => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return { language, changeLanguage }
}