import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useTheme } from './hooks/useTheme';

function AppToaster() {
  const { darkMode } = useTheme();

  return <Toaster richColors position="top-right" theme={darkMode ? 'dark' : 'light'} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <AppToaster />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
