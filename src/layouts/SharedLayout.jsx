import { useAuth } from '../hooks/useAuth';
import MainLayout from './MainLayout';
import AppLayout from './AppLayout';

/**
 * Layout for pages shared between public visitors and authenticated users.
 * Authenticated users (e.g. ENTREPRENEUR, CUSTOMER) get the AppLayout with the
 * persistent sidebar so navigating here (e.g. /trainings, /challenges) never
 * closes, moves, or hides the sidebar. Public visitors get the standard
 * MainLayout with navbar + footer.
 */
export default function SharedLayout({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <AppLayout>{children}</AppLayout>
  ) : (
    <MainLayout>{children}</MainLayout>
  );
}