import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./application/redux";
import { DashboardLayout, ProtectedRoute, PublicRoute } from "./presentation/components";
import TMDashboard from "./presentation/pages/dashboard";
import TMHome from "./presentation/pages/dashboard/home";
import TMSettings from "./presentation/pages/dashboard/settings";
import TMProfile from "./presentation/pages/dashboard/profile";
import TMMyBusinesses from "./presentation/pages/dashboard/my-businesses";
import TMProducts from "./presentation/pages/dashboard/products";
import TMOrders from "./presentation/pages/dashboard/orders";
import TMMessages from "./presentation/pages/dashboard/messages";
import TMReviews from "./presentation/pages/dashboard/reviews";
import TMDBoard from "./presentation/pages/dashboard/dboard";
import TMSignin from "./presentation/pages/authentication/signin";
import TMForgotPassword from "./presentation/pages/authentication/forgotPassword";
import TMSetNewPassword from "./presentation/pages/authentication/setNewPassword";
import TMSignup from "./presentation/pages/authentication/signup";
import TMLanding from "./presentation/pages/landing";
import AppInitializer from "./presentation/components/AppInitializer";

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Page */}
            <Route path="/landing" element={<TMLanding />} />

            {/* Authentication Routes */}
            <Route path="/signin" element={
              <PublicRoute>
                <TMSignin />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <TMSignup />
              </PublicRoute>
            } />
            <Route path="/forgot-password" element={
              <PublicRoute>
                <TMForgotPassword />
              </PublicRoute>
            } />
            <Route path="/set-new-password" element={
              <PublicRoute>
                <TMSetNewPassword />
              </PublicRoute>
            } />

            {/* Dashboard Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <TMDashboard />
              </ProtectedRoute>
            } />
            <Route path="/dboard" element={
              <ProtectedRoute>
                <TMDBoard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route path="home" element={<TMHome />} />
              <Route path="my-businesses" element={<TMMyBusinesses />} />
              <Route path="products/:businessId" element={<TMProducts />} />
              <Route path="orders" element={<TMOrders />} />
              <Route path="messages" element={<TMMessages />} />
              <Route path="reviews" element={<TMReviews />} />
              <Route path="profile" element={<TMProfile />} />
              <Route path="settings" element={<TMSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </Provider>
  );
}

export default App;
