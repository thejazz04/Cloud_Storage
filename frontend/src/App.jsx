import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/Layout/DashboardLayout';

// Import Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyFiles from './pages/MyFiles';
import SharedFiles from './pages/SharedFiles';
import AuditLogs from './pages/AuditLogs';
import Users from './pages/Users';
import Departments from './pages/Departments';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 gap-3">
        <div className="w-10 h-10 border-4 border-slate-700 border-t-brand-500 rounded-full animate-spin"></div>
        <p className="text-xs text-slate-400 font-medium">Verifying active credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Employee & Admin Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/files" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
                <MyFiles />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/shared" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'Employee']}>
                <SharedFiles />
              </ProtectedRoute>
            } 
          />

          {/* Protected Admin Only Routes */}
          <Route 
            path="/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users-admin" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Users />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/departments-admin" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Departments />
              </ProtectedRoute>
            } 
          />

          {/* Default Redirection */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
