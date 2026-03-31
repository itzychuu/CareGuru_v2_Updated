import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import "../styles/bookappointment.css";

import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { bookTicket } from "../services/ticketService";

function BookAppointment() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const doctor = location.state?.doctor || null;
  const hospitalName = location.state?.hospitalName || "Unknown Hospital";

  const [paymentMethod, setPaymentMethod] = useState("");

  // Light navbar for white background
  useEffect(() => {
    document.body.classList.add("light-navbar");
    return () => document.body.classList.remove("light-navbar");
  }, []);

  // Safety guard
  if (!doctor) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "150px", textAlign: "center" }}>
          <h2>No Doctor Selected</h2>
          <p>Please go back and select a doctor.</p>
        </div>
      </>
    );
  }

  const handleProceed = async () => {
    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    if (!user) {
      alert("Please login to book an appointment");
      return;
    }

    try {
      const date = new Date().toISOString().split('T')[0];

      const result = await bookTicket({
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalId: location.state?.hospitalId || null,
        hospitalName: hospitalName,
        specialization: doctor.specialization || doctor.field,
        date: date,
        userId: user.uid,
        patientName: user.displayName || user.email.split('@')[0],
        source: "app",
        paymentMethod: paymentMethod
      });

      alert(`Appointment booked successfully! Your Ticket ID is ${result.ticketId}`);
      navigate("/appointments");
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.message || "Failed to book appointment");
    }
  };

  return (
    <>
      <Navbar />

      <div 
        className="book-page" 
        style={{ 
          padding: "140px 20px 80px", 
          maxWidth: "1000px", 
          margin: "0 auto", 
          display: "flex", 
          gap: "40px", 
          flexWrap: "wrap",
          alignItems: "flex-start" 
        }}
      >
        {/* LEFT CARD - DOCTOR SUMMARY */}
        <div className="glass-card" style={{ flex: "1 1 350px", padding: "40px", textAlign: "center", position: "sticky", top: "120px" }}>
          <div style={{ width: "160px", height: "160px", borderRadius: "50%", margin: "0 auto 30px", overflow: "hidden", border: "5px solid rgba(0, 90, 160, 0.1)", boxShadow: "var(--shadow-md)" }}>
            <img 
              src={doctor.image || "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"} 
              alt={doctor.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h3 style={{ color: "var(--primary)", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>{hospitalName}</h3>
          <h2 style={{ fontSize: "28px", color: "var(--text-main)", marginBottom: "5px" }}>{doctor.name}</h2>
          <p className="badge badge-info" style={{ textTransform: "none", fontSize: "14px", padding: "8px 20px" }}>{doctor.specialization || doctor.field}</p>
          
          <div style={{ marginTop: "40px", paddingTop: "30px", borderTop: "1px solid #f1f5f9", textAlign: "left" }}>
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px" }}>
              <span style={{ color: "var(--text-muted)" }}>Consultation Fee</span>
              <span style={{ fontWeight: "700", color: "var(--primary)" }}>₹500.00</span>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "15px" }}>
              <span style={{ color: "var(--text-muted)" }}>Service Charge</span>
              <span style={{ fontWeight: "700", color: "var(--primary)" }}>₹50.00</span>
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "15px", borderTop: "2px dashed #f1f5f9", fontSize: "18px", fontWeight: "800" }}>
              <span>Total Payable</span>
              <span style={{ color: "var(--primary)" }}>₹550.00</span>
            </div>
          </div>
        </div>

        {/* RIGHT PAYMENT */}
        <div className="glass-card" style={{ flex: "2 1 500px", padding: "40px" }}>
          <h2 style={{ fontSize: "24px", color: "var(--text-main)", marginBottom: "30px" }}>Secure Checkout</h2>
          
          <p style={{ fontWeight: "600", marginBottom: "15px", color: "var(--text-muted)", fontSize: "14px", textTransform: "uppercase" }}>Select Payment Method</p>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "40px" }}>
            {[
              { id: "GPay", label: "Google Pay", icon: "📱" },
              { id: "Card", label: "Credit / Debit Card", icon: "💳" },
              { id: "UPI", label: "Other UPI ID", icon: "🔗" },
              { id: "Paytm", label: "Paytm / Wallet", icon: "💰" }
            ].map((method) => (
              <div 
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-md)",
                  border: paymentMethod === method.id ? "2px solid var(--primary)" : "1.5px solid #f1f5f9",
                  background: paymentMethod === method.id ? "rgba(0, 90, 160, 0.03)" : "white",
                  cursor: "pointer",
                  transition: "var(--transition)",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px"
                }}
              >
                <span style={{ fontSize: "24px" }}>{method.icon}</span>
                <span style={{ fontWeight: "600", color: paymentMethod === method.id ? "var(--primary)" : "var(--text-main)" }}>{method.label}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", marginBottom: "30px", fontSize: "14px", color: "var(--text-muted)", borderLeft: "4px solid var(--primary)" }}>
            🔒 Your payment is secured and encrypted. By clicking confirm, you agree to our terms of service and medical privacy policy.
          </div>

          <button 
            className="nav-btn" 
            onClick={handleProceed}
            style={{ 
              width: "100%", 
              height: "60px", 
              fontSize: "18px", 
              background: "var(--primary)", 
              color: "white", 
              border: "none",
              boxShadow: "0 10px 25px rgba(0, 90, 160, 0.25)"
            }}
          >
            Confirm & Book Appointment
          </button>
          
          <button 
            className="nav-btn" 
            onClick={() => navigate(-1)}
            style={{ 
              width: "100%", 
              height: "50px", 
              fontSize: "14px", 
              background: "transparent", 
              color: "var(--text-muted)", 
              border: "none",
              marginTop: "10px"
            }}
          >
            Cancel and Return
          </button>
        </div>
      </div>
    </>
  );
}

export default BookAppointment;
