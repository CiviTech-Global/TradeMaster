import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./presentation/context/AuthContext";
import TMDashboard from "./presentation/pages/dashboard";
import TMSignin from "./presentation/pages/authentication/signin";
import TMForgotPassword from "./presentation/pages/authentication/forgotPassword";
import TMSetNewPassword from "./presentation/pages/authentication/setNewPassword";
import TMSignup from "./presentation/pages/authentication/signup";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TMDashboard />} />
          <Route path="/dashboard" element={<TMDashboard />} />
          <Route path="/signin" element={<TMSignin />} />
          <Route path="/signup" element={<TMSignup />} />
          <Route path="/forgot-password" element={<TMForgotPassword />} />
          <Route path="/set-new-password" element={<TMSetNewPassword />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
