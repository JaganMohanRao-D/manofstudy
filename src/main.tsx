import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './modulePreloader.ts';
import './scholarshipUx.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { MosStudentExperience } from './components/MosStudentExperience.tsx';
import SiteUxFixes from './components/SiteUxFixes.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
        <MosStudentExperience />
        <SiteUxFixes />
        <GoogleAuthModal />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);
