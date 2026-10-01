import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { MosStudentExperience } from './components/MosStudentExperience.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
        <MosStudentExperience />
        <GoogleAuthModal />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
