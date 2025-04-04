import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Categories from './pages/Categories';

function App() {
  const { fetchAdminProfile, isAuth } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      await fetchAdminProfile();
    };

    initAuth();
  }, [fetchAdminProfile]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuth ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute>
            <AdminLayout>
              <Users />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/categories" element={
          <ProtectedRoute>
            <AdminLayout>
              <Categories />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;