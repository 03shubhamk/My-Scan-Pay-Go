import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastContainer } from './components/ToastContainer';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardOverview } from './features/dashboard/DashboardOverview';
import { ProductsPage } from './features/products/ProductsPage';
import { AddProductPage } from './features/products/AddProductPage';
import { EditProductPage } from './features/products/EditProductPage';
import { InventoryPage } from './features/inventory/InventoryPage';
import { OrdersPage } from './features/orders/OrdersPage';
import { PaymentsPage } from './features/payments/PaymentsPage';
import { ExitScanPage } from './features/exit-verifier/ExitScanPage';
import { CustomersPage } from './features/customers/CustomersPage';
import { ReportsPage } from './features/reports/ReportsPage';
import { SettingsPage } from './features/settings/SettingsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <ToastContainer />
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

          {/* Inventory Management Route */}
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />

          {/* Orders & Payments */}
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <PaymentsPage />
              </ProtectedRoute>
            }
          />

          {/* Exit Gate Verifier */}
          <Route
            path="/exit-verifier"
            element={
              <ProtectedRoute>
                <ExitScanPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Accounts */}
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <CustomersPage />
              </ProtectedRoute>
            }
          />

          {/* Reports & Analytics */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />

          {/* Store Settings */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  </AuthProvider>
);
};

export default App;
