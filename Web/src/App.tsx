import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./application/redux";
import { DashboardLayout } from "./presentation/components";
import TMDashboard from "./presentation/pages/dashboard";
import TMHome from "./presentation/pages/dashboard/home";
import TMSettings from "./presentation/pages/dashboard/settings";
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
      </AppInitializer>
    </Provider>
  );
}

export default App;
