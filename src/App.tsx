import "./index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FundsPage from "./pages/Funds";
import LoginPage from "./pages/Login";
import TransactionPage from "./pages/Transactions";
import { ChangePasswordPage } from "./pages/ChangePassword";
import DashboardPage from "./pages/Dashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/funds" element={<FundsPage />} />
        <Route path="/transaction" element={<TransactionPage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
