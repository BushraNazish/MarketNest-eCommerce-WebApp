import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then(module => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then(module => ({ default: module.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const OnboardingPage = lazy(() => import('./pages/vendor/OnboardingPage').then(module => ({ default: module.OnboardingPage })));
const SellerDashboardPage = lazy(() => import('./pages/vendor/SellerDashboardPage').then(module => ({ default: module.SellerDashboardPage })));
const VendorOrderManagementPage = lazy(() => import('./pages/vendor/VendorOrderManagementPage'));
const ProductListPage = lazy(() => import('./pages/vendor/products/ProductListPage'));
const ProductCreatePage = lazy(() => import('./pages/vendor/products/ProductCreatePage'));
const VendorReviewsPage = lazy(() => import('./pages/vendor/VendorReviewsPage'));
const ProductDetailsPage = lazy(() => import('./pages/product/ProductDetailsPage'));
const SearchPage = lazy(() => import('./pages/public/SearchPage'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const VendorProfilePage = lazy(() => import('./pages/public/VendorProfilePage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const WishlistPage = lazy(() => import('./pages/wishlist/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/order/OrderSuccessPage'));
const OrderHistoryPage = lazy(() => import('./pages/order/OrderHistoryPage'));
const OrderDetailsPage = lazy(() => import('./pages/order/OrderDetailsPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminConfigsPage = lazy(() => import('./pages/admin/AdminConfigsPage'));
const AdminCouponsPage = lazy(() => import('./pages/admin/AdminCouponsPage'));

const PageLoader = () => (
  <div className="flex h-[50vh] w-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Main Layout containing Navbar */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products/search" element={<SearchPage />} />
              <Route path="/products/:slug" element={<ProductDetailsPage />} />
              <Route path="/vendor/:id" element={<VendorProfilePage />} />

              {/* Protected Routes inside Main Layout */}
              <Route element={<ProtectedRoute />}>
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order/success/:id" element={<OrderSuccessPage />} />
                <Route path="/orders" element={<OrderHistoryPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/vendor/dashboard" element={<SellerDashboardPage />} />
                <Route path="/vendor/orders" element={<VendorOrderManagementPage />} />
                <Route path="/vendor/products" element={<ProductListPage />} />
                <Route path="/vendor/products/new" element={<ProductCreatePage />} />
                <Route path="/vendor/reviews" element={<VendorReviewsPage />} />
                <Route path="/vendor/onboarding" element={<OnboardingPage />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="configs" element={<AdminConfigsPage />} />
                  <Route path="coupons" element={<AdminCouponsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Authentication Routes (No Navbar) */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route index element={<Navigate to="login" replace />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
