import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterDoctor from "@/pages/RegisterDoctor";
import PatientIntake from "@/pages/PatientIntake";
import History from "@/pages/History";
import CaseDetail from "@/pages/CaseDetail";
import Doctors from "@/pages/Doctors";
import DoctorProfile from "@/pages/DoctorProfile";
import DoctorDashboard from "@/pages/DoctorDashboard";
import Medicines from "@/pages/Medicines";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDoctors from "@/pages/admin/AdminDoctors";
import AdminMedicines from "@/pages/admin/AdminMedicines";
import AdminAudit from "@/pages/admin/AdminAudit";

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/doctor" element={<RegisterDoctor />} />

              <Route path="/patient" element={<ProtectedRoute roles={["patient"]}><PatientIntake /></ProtectedRoute>} />
              <Route path="/history" element={<ProtectedRoute roles={["patient"]}><History /></ProtectedRoute>} />
              <Route path="/case/:id" element={<ProtectedRoute roles={["patient", "admin"]}><CaseDetail /></ProtectedRoute>} />

              <Route path="/doctors" element={<ProtectedRoute roles={["patient", "doctor", "admin"]}><Doctors /></ProtectedRoute>} />
              <Route path="/doctors/:id" element={<ProtectedRoute roles={["patient", "doctor", "admin"]}><DoctorProfile /></ProtectedRoute>} />
              <Route path="/medicines" element={<ProtectedRoute roles={["patient", "doctor", "admin"]}><Medicines /></ProtectedRoute>} />

              <Route path="/doctor" element={<ProtectedRoute roles={["doctor"]}><DoctorDashboard /></ProtectedRoute>} />

              <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/doctors" element={<ProtectedRoute roles={["admin"]}><AdminDoctors /></ProtectedRoute>} />
              <Route path="/admin/medicines" element={<ProtectedRoute roles={["admin"]}><AdminMedicines /></ProtectedRoute>} />
              <Route path="/admin/audit" element={<ProtectedRoute roles={["admin"]}><AdminAudit /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
