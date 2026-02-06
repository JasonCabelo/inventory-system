import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import ProductForm from '@/pages/ProductForm'
import CategoryForm from '@/pages/CategoryForm'
import SupplierForm from '@/pages/SupplierForm'
import UserForm from '@/pages/UserForm'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/products/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <ProductForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <CategoryForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/categories/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <CategoryForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suppliers/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SupplierForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/suppliers/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <SupplierForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/users/new" 
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UserForm />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}

export default App
