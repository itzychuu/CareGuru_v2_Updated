import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../styles/main.css";

function DoctorAppointments() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all doctors for this hospital
      const drQuery = query(collection(db, "doctors"), where("hospitalId", "==", user.uid));
      const drSnapshot = await getDocs(drQuery);
      const drData = drSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(drData);

      // 2. Fetch all appointments for this hospital
      const appQuery = query(collection(db, "appointments"), where("hospitalId", "==", user.uid));
      const appSnapshot = await getDocs(appQuery);
      const appData = appSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllAppointments(appData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttended = async (appointment) => {
    try {
      // 1. Update status in global 'appointments' collection
      const appDocRef = doc(db, "appointments", appointment.id);
      await updateDoc(appDocRef, { status: "Attended & Expired" });

      // 2. Update status in patient's 'users' document array
      const userDocRef = doc(db, "users", appointment.userId);
      const userSnap = await getDoc(userDocRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const updatedUserAppointments = userData.appointments.map(app => {
          if (app.ticketId === appointment.ticketId) {
            return { ...app, status: "Attended & Expired" };
          }
          return app;
        });
        
        await updateDoc(userDocRef, { appointments: updatedUserAppointments });
      }

      alert("Appointment marked as Attended & Expired!");
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update appointment status");
    }
  };

  const filteredAppointments = allAppointments.filter(app => app.doctorId === selectedDoctorId);
  const selectedDoctor = doctors.find(dr => dr.id === selectedDoctorId);

  return (
    <>
      <Navbar variant="light" />
      <div style={{ padding: "120px 20px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#005aa0", marginBottom: "40px", textAlign: "center" }}>Doctor Appointments</h1>

        {loading ? (
          <p style={{ textAlign: "center", fontSize: "18px" }}>Loading data...</p>
        ) : (
          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Left: Doctor Cards Sidebar */}
            <div style={{ flex: "1 1 300px", display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "10px", color: "#333" }}>Select a Doctor</h2>
              {doctors.length === 0 ? (
                <p style={{ color: "#888" }}>No doctors found.</p>
              ) : (
                doctors.map((dr) => (
                  <div 
                    key={dr.id}
                    onClick={() => setSelectedDoctorId(dr.id)}
                    style={{
                      padding: "20px",
                      borderRadius: "15px",
                      background: selectedDoctorId === dr.id ? "#005aa0" : "white",
                      color: selectedDoctorId === dr.id ? "white" : "#333",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "1.5px solid",
                      borderColor: selectedDoctorId === dr.id ? "#005aa0" : "#eee"
                    }}
                  >
                    <h3 style={{ fontSize: "18px", marginBottom: "5px" }}>{dr.name}</h3>
                    <p style={{ opacity: 0.8, fontSize: "14px" }}>{dr.specialization}</p>
                  </div>
                ))
              )}
            </div>

            {/* Right: Appointment Details List */}
            <div style={{ flex: "2 1 600px", background: "white", padding: "40px", borderRadius: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", minHeight: "400px" }}>
              {!selectedDoctorId ? (
                <div style={{ textAlign: "center", padding: "100px 0" }}>
                  <div style={{ fontSize: "50px", marginBottom: "20px" }}>👨‍⚕️</div>
                  <h3 style={{ color: "#666" }}>Please select a doctor to view their appointments</h3>
                </div>
              ) : (
                <>
                  <div style={{ borderBottom: "2px solid #f6f6f6", paddingBottom: "20px", marginBottom: "30px" }}>
                    <h2 style={{ fontSize: "24px", color: "#005aa0", marginBottom: "5px" }}>Appointments for {selectedDoctor?.name}</h2>
                    <p style={{ color: "#888" }}>Total Bookings: {filteredAppointments.length}</p>
                  </div>

                  {filteredAppointments.length === 0 ? (
                    <p style={{ textAlign: "center", padding: "50px", color: "#888" }}>No appointments found for this doctor.</p>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }}>
                      {filteredAppointments.map((app) => (
                        <div key={app.id} style={{ padding: "20px", borderRadius: "15px", background: "#f8fbff", border: "1px solid #e1ecf8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <p style={{ color: "#005aa0", fontWeight: "bold", fontSize: "14px", marginBottom: "5px" }}>{app.ticketId}</p>
                            <h4 style={{ fontSize: "18px", marginBottom: "2px" }}>{app.patientName}</h4>
                            <p style={{ fontSize: "12px", color: "#888" }}>Booked on {app.date} at {app.bookingTime}</p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            {app.status === "Attended & Expired" ? (
                              <span className="badge badge-neutral">ATTENDED & EXPIRED</span>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                <span className="badge badge-success">CONFIRMED</span>
                                <button 
                                  onClick={() => handleMarkAttended(app)}
                                  className="nav-btn"
                                  style={{ padding: "8px 15px", fontSize: "12px" }}
                                >
                                  Mark Attended
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}

export default DoctorAppointments;
