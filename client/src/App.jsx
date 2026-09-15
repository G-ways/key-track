import { Routes, Route } from "react-router-dom";
import Display from "./pages/Display.jsx";
import ScanForm from "./pages/ScanForm.jsx";
import AdminLogs from "./pages/AdminLogs.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Display />} />
      <Route path="/scan" element={<ScanForm />} />
      <Route path="/admin/logs" element={<AdminLogs />} />
    </Routes>
  );
}
