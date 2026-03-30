import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Hospitals from "./pages/Hospitals";
import HospitalDetails from "./pages/HospitalDetails";
import BookAppointment from "./pages/BookAppointment";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import Appointments from "./pages/Appointments";
import Chatbot from "./pages/Chatbot";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HospitalDashboard from "./pages/HospitalDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";

// Role-based Route Protection
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <div style={{ padding: "100px", textAlign: "center" }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" />;

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Patient Routes */}
        <Route path="/dashboard" element={<Navigate to="/hospitals" />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/hospital/:id" element={<HospitalDetails />} />
        <Route path="/book-appointment" element={<ProtectedRoute allowedRoles={["patient"]}><BookAppointment /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><ProfileEdit /></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={["patient"]}><Appointments /></ProtectedRoute>} />
        
        {/* Hospital Routes */}
        <Route path="/hospital-dashboard" element={<ProtectedRoute allowedRoles={["hospital"]}><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/doctor-appointments" element={<ProtectedRoute allowedRoles={["hospital"]}><DoctorAppointments /></ProtectedRoute>} />

        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
