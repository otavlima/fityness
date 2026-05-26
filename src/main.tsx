import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initTheme } from './hooks/useTheme.ts'
import { UserProfileProvider } from './contexts/UserProfileContext'
import AppToaster from './components/AppToaster.tsx'
import "./i18n"

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <TooltipProvider>
            <AppToaster />
            <App />
          </TooltipProvider>
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)