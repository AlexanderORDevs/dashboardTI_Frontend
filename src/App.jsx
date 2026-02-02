import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Dashboard, Auth } from '@/layouts';
import { ProtectedRoute } from '../src/routesProtect/ProtectedRoute';
import { UsersProvider } from '@/context/allUsers';
import { AuthProvider } from '@/context/loginContext';

function App() {
  const location = useLocation();

  return (
    <AuthProvider key={location.pathname}>
      <Routes>
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <UsersProvider>
                <Dashboard />
              </UsersProvider>
            </ProtectedRoute>
          }
        />

        {/* Public routes */}
        <Route path="/auth/*" element={<Auth />} />

        {/* Default redirection */}
        <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
