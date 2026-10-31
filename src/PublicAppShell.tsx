import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { GoogleAuthModal } from './components/GoogleAuthModal.tsx';
import { MosStudentExperience } from './components/MosStudentExperience.tsx';
import MockTestAccountControl from './components/MockTestAccountControl.tsx';
import SiteUxFixes from './components/SiteUxFixes.tsx';

/**
 * Public visitor bundle. Keep owner-only Firebase Auth and admin UI out of the
 * public startup graph so a private portal dependency cannot block the site.
 */
export default function PublicAppShell() {
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
