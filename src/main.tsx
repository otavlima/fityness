import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { Toaster } from '@/components/ui/sonner.tsx'

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
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
