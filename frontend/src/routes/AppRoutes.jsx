import { Routes, Route } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import HomePage from "../pages/HomePage";
import RegisterStudentPage from "../pages/RegisterStudentPage";
import LiveMonitoringPage from "../pages/LiveMonitoringPage";
import RecordPage from "../pages/RecordPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/register" element={<RegisterStudentPage />} />
      <Route path="/monitor" element={<LiveMonitoringPage />} />
      <Route path="/records" element={<RecordPage />} />
    </Routes>
  );
}
