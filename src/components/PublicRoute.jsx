import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Spinner from './Spinner';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="h-12 w-12" />
      </div>
    );
  }

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}