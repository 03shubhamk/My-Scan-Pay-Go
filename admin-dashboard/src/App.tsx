import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { ProductsPage } from './features/products/ProductsPage';
import { AddProductPage } from './features/products/AddProductPage';
import { EditProductPage } from './features/products/EditProductPage';
import { MainLayout } from './components/MainLayout';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardOverview />
              </ProtectedRoute>
            }
          />
          
          {/* Products Management Routes */}
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/new"
            element={
              <ProtectedRoute>
                <AddProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <ProtectedRoute>
                <EditProductPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <MainLayout pageTitle="Orders & Payments">
                  <div className="p-6 bg-white rounded-lg border border-surface-border space-y-2">
                    <h2 className="text-xl font-bold">Customer Orders & Razorpay Logs</h2>
                    <p className="text-text-secondary text-sm">Real-time order monitoring and transaction details.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/exit-verifier"
            element={
              <ProtectedRoute>
                <MainLayout pageTitle="Exit Gate Verifier">
                  <div className="p-6 bg-white rounded-lg border border-surface-border space-y-2">
                    <h2 className="text-xl font-bold">Exit QR Verification Counter</h2>
                    <p className="text-text-secondary text-sm">Scan customer exit tokens and verify item counts.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <MainLayout pageTitle="Customer Accounts">
                  <div className="p-6 bg-white rounded-lg border border-surface-border space-y-2">
                    <h2 className="text-xl font-bold">Registered Customer Profiles</h2>
                    <p className="text-text-secondary text-sm">User accounts and shopping history.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MainLayout pageTitle="Reports & Analytics">
                  <div className="p-6 bg-white rounded-lg border border-surface-border space-y-2">
                    <h2 className="text-xl font-bold">Sales & Peak Hours Analytics</h2>
                    <p className="text-text-secondary text-sm">Store performance graphs and inventory turnover.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <MainLayout pageTitle="Store Settings">
                  <div className="p-6 bg-white rounded-lg border border-surface-border space-y-2">
                    <h2 className="text-xl font-bold">Store & Gate Configuration</h2>
                    <p className="text-text-secondary text-sm">System parameters and security keys.</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
