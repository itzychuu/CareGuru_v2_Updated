import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

function Appointments() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setTickets(snap.data().appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    }
  };

  useEffect(() => {
    document.body.classList.add("light-navbar");
    fetchAppointments();
    return () => document.body.classList.remove("light-navbar");
  }, [user]);

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Are you sure you want to remove this appointment record?")) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const updatedTickets = tickets.filter(t => t.ticketId !== ticketId);
      await updateDoc(userRef, { appointments: updatedTickets });
      setTickets(updatedTickets);
      alert("Appointment record removed.");
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("Failed to delete appointment record.");
    }
  };

  return (
    <>
      <Navbar />

      <div className="appointments-page" style={{ padding: "140px 20px 80px", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", color: "var(--primary)", marginBottom: "15px", fontWeight: "800" }}>My Medical Tickets</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "18px", marginBottom: "40px" }}>Access your active bookings and medical history with ease.</p>

        {tickets.length === 0 ? (
          <div className="glass-card" style={{ padding: "80px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📅</div>
            <h2 style={{ color: "var(--text-main)", marginBottom: "10px" }}>No Appointments Yet</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>You haven't scheduled any medical consultations yet.</p>
            <button className="nav-btn" onClick={() => navigate("/hospitals")} style={{ background: "var(--primary)", color: "white", border: "none" }}>Book Your First Visit</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            {tickets.map((t, i) => (
              <div
                key={i}
                className="glass-card"
                style={{
                  padding: "40px",
                  borderLeft: "8px solid var(--primary)",
                  position: "relative",
                  transition: "var(--transition)"
                }}
              >
                {/* Status and Action Header */}
                <div style={{ position: "absolute", top: "30px", right: "30px", display: "flex", gap: "15px", alignItems: "center" }}>
                  <div className={`badge ${t.status === "Attended & Expired" ? "badge-neutral" : "badge-success"}`} style={{ textTransform: "none", fontSize: "12px", padding: "6px 15px" }}>
                    {t.status === "Attended & Expired" ? "✓ Attended" : "● Active Booking"}
                  </div>
                  <button 
                    onClick={() => handleDelete(t.ticketId)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "var(--danger)", opacity: "0.6", transition: "var(--transition)" }}
                    onMouseEnter={(e) => e.target.style.opacity = "1"}
                    onMouseLeave={(e) => e.target.style.opacity = "0.6"}
                    title="Remove record"
                  >
                    🗑️
                  </button>
                </div>
                
                {/* Ticket Body */}
                <div style={{ marginBottom: "30px" }}>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Ticket ID: {t.ticketId || "OP-XXXXXX"}</p>
                  <h2 style={{ fontSize: "28px", color: "var(--primary)", fontWeight: "800" }}>{t.hospitalName || "CareGuru Medical Facility"}</h2>
                  <p style={{ fontSize: "16px", color: "var(--text-main)", fontWeight: "600", marginTop: "5px" }}>{t.specialization || "General Consultation"}</p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "30px", borderTop: "1.5px solid #f1f5f9", paddingTop: "30px" }}>
                  <div>
                    <p style={{ color: "var(--text-muted)", marginBottom: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Specialist</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>{t.doctorName}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)", marginBottom: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Schedule</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>{t.date}</p>
                    <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>at {t.bookingTime}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)", marginBottom: "8px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Payment</p>
                    <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>{t.paymentMethod}</p>
                    <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: "600" }}>₹550.00 Paid</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Appointments;
