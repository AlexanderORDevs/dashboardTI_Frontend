import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { useAuth } from '@/context/loginContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  //⏳ Mientras se verifica el token
  if (loading) {
    return <div className="p-6">Loading session...</div>;
  }

  //🚫 No autenticado
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // ✅ Autenticado
  return children;
};
