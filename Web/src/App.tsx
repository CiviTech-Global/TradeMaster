import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./presentation/context/AuthContext";
import { DashboardLayout } from "./presentation/components";
import TMDashboard from "./presentation/pages/dashboard";
import TMHome from "./presentation/pages/dashboard/home";
import TMSettings from "./presentation/pages/dashboard/settings";
import TMSignin from "./presentation/pages/authentication/signin";
import TMForgotPassword from "./presentation/pages/authentication/forgotPassword";
import TMSetNewPassword from "./presentation/pages/authentication/setNewPassword";
import TMSignup from "./presentation/pages/authentication/signup";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/signin" element={<TMSignin />} />
          <Route path="/signup" element={<TMSignup />} />
          <Route path="/forgot-password" element={<TMForgotPassword />} />
          <Route path="/set-new-password" element={<TMSetNewPassword />} />

          {/* Dashboard Routes */}
          <Route path="/" element={<TMDashboard />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="home" element={<TMHome />} />
            <Route path="settings" element={<TMSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
