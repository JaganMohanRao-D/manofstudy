import {StrictMode, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './modulePreloader.ts';
import './scholarshipUx.css';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { MosStudentExperience } from './components/MosStudentExperience.tsx';
import MockTestAccountControl from './components/MockTestAccountControl.tsx';
import SiteUxFixes from './components/SiteUxFixes.tsx';

function AppBootstrap() {
  useEffect(() => {
    // Release the initial HTML/SEO fallback cover only after the React app has committed.
    document.documentElement.classList.add('app-ready');
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <App />
        <MosStudentExperience />
        <MockTestAccountControl />
        <SiteUxFixes />
        <GoogleAuthModal />
      </ThemeProvider>
    </AuthProvider>
  );
}

const mountNode = document.getElementById('root');
if (!mountNode) throw new Error('Naa College app root was not found.');

createRoot(mountNode).render(
  <StrictMode>
    <AppBootstrap />
  </StrictMode>,
);
