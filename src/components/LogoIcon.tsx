import { useState, useEffect } from 'react'
import logoWhite from '../../public/logo-white.png'
import logoBlack from '../../public/logo-black.png'

const LogoIcon = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : document.documentElement.classList.contains('dark')
  })

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  return <img src={isDark ? logoWhite : logoBlack} alt='Fityness' className='w-6 h-6' />
}

export default LogoIcon