import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { initTheme } from './hooks/useTheme.ts'
import { UserProfileProvider } from './contexts/UserProfileContext'

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Toaster
      position="top-right"
      visibleToasts={2}
      closeButton
      expand
      duration={5000}
      richColors
    />
    <BrowserRouter>
      <AuthProvider>
        <UserProfileProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </UserProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
