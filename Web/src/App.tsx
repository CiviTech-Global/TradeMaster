import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./application/redux";
import { DashboardLayout, ProtectedRoute, PublicRoute } from "./presentation/components";
import TMDashboard from "./presentation/pages/dashboard";
import TMHome from "./presentation/pages/dashboard/home";
import TMSettings from "./presentation/pages/dashboard/settings";
import TMMyBusinesses from "./presentation/pages/dashboard/my-businesses";
import TMDBoard from "./presentation/pages/dashboard/dboard";
import TMSignin from "./presentation/pages/authentication/signin";
import TMForgotPassword from "./presentation/pages/authentication/forgotPassword";
import TMSetNewPassword from "./presentation/pages/authentication/setNewPassword";
import TMSignup from "./presentation/pages/authentication/signup";
import AppInitializer from "./presentation/components/AppInitializer";

function App() {
  return (
    <Provider store={store}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
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
              <Route path="settings" element={<TMSettings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </Provider>
  );
}

export default App;
