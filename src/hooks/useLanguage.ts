import { useEffect, useState } from 'react'
import i18n from '@/i18n'

type Language = 'pt' | 'en' | 'es'

const getBrowserLanguage = (): Language => {
  const lang = navigator.language
    .toLowerCase()

  if (lang.startsWith('pt'))
    return 'pt'

  if (lang.startsWith('es'))
    return 'es'

  return 'en'
}

export const useLanguage = () => {
  const [language, setLanguage] =
    useState<Language>(() => {
      const saved =
        localStorage.getItem(
          'fityness-language'
        ) as Language | null

      return (
        saved ||
        getBrowserLanguage()
      )
    })

  useEffect(() => {
    i18n.changeLanguage(language)

    localStorage.setItem(
      'fityness-language',
      language
    )
  }, [language])

  const changeLanguage = (
    lang: string
  ) => {
    setLanguage(lang as Language)
  }

  return {
    language,
    changeLanguage,
  }
}