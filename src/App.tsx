import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Catalog } from './pages/Catalog';
import { Admin } from './pages/Admin';
import { AdminOrders } from './pages/AdminOrders';
import { AdminProducts } from './pages/AdminProducts';
import { AdminSettings } from './pages/AdminSettings';
import { Login } from './pages/Login';
import type { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center" style={{ color: 'var(--color-primary, #8C4A5A)' }}>Carregando...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicStore() {
  const { uid } = useParams<{ uid: string }>();
  if (!uid) return <Navigate to="/login" replace />;
  return <Catalog uid={uid} />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/loja/:uid" element={<PublicStore />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/mayluce"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
