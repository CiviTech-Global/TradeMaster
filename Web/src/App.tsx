import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./application/redux";
import { DashboardLayout, ProtectedRoute, PublicRoute } from "./presentation/components";
import TMDashboard from "./presentation/pages/dashboard";
import TMHome from "./presentation/pages/dashboard/home";
import TMSettings from "./presentation/pages/dashboard/settings";
import TMProfile from "./presentation/pages/dashboard/profile";
import TMMyBusinesses from "./presentation/pages/dashboard/my-businesses";
// [DISABLED] Products not shown in business directory mode
// import TMProducts from "./presentation/pages/dashboard/products";
// [DISABLED] Orders not shown in business directory mode
// import TMOrders from "./presentation/pages/dashboard/orders";
// [DISABLED] Messaging not shown in business directory mode
// import TMMessages from "./presentation/pages/dashboard/messages";
// [DISABLED] Reviews management not shown in business directory mode
// import TMReviews from "./presentation/pages/dashboard/reviews";
import TMDBoard from "./presentation/pages/dashboard/dboard";
import TMSignin from "./presentation/pages/authentication/signin";
import TMForgotPassword from "./presentation/pages/authentication/forgotPassword";
import TMSetNewPassword from "./presentation/pages/authentication/setNewPassword";
import TMSignup from "./presentation/pages/authentication/signup";
import TMLanding from "./presentation/pages/landing";
import AppInitializer from "./presentation/components/AppInitializer";
import ErrorBoundary from "./presentation/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
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
              {/* [DISABLED] Products not shown in business directory mode */}
              {/* <Route path="products/:businessId" element={<TMProducts />} /> */}
              {/* [DISABLED] Orders not shown in business directory mode */}
              {/* <Route path="orders" element={<TMOrders />} /> */}
              {/* [DISABLED] Messaging not shown in business directory mode */}
              {/* <Route path="messages" element={<TMMessages />} /> */}
              {/* [DISABLED] Reviews management not shown in business directory mode */}
              {/* <Route path="reviews" element={<TMReviews />} /> */}
              <Route path="profile" element={<TMProfile />} />
              <Route path="settings" element={<TMSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </Provider>
    </ErrorBoundary>
  );
}

export default App;
