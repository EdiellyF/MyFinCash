import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
