import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../styles/main.css";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hospitalDetails, setHospitalDetails] = useState({
    hospitalName: "",
    address: "",
    description: "",
    mapsUrl: ""
  });
  const [loading, setLoading] = useState(false);

  const extractCoords = (url) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return { lat: null, lng: null };
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (email && password) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }

      const { lat, lng } = extractCoords(hospitalDetails.mapsUrl);

      const userData = {
        uid: user.uid,
        email: user.email,
        role: role,
        ...(role === "hospital" ? { ...hospitalDetails, lat, lng } : {})
      };

      await setDoc(doc(db, "users", user.uid), userData, { merge: true });

      navigate(role === "hospital" ? "/hospital-dashboard" : "/dashboard");
    } catch (error) {
      console.error("Registration Error:", error);
      alert("Failed to register: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar variant="light" />
      <div className="login-container" style={{ minHeight: "130vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "140px 20px 80px", background: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2053') center/cover no-repeat", position: "relative" }}>
        {/* Abstract Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0, 90, 160, 0.85), rgba(0, 192, 250, 0.45))", zIndex: 1 }}></div>

        <div className="glass-card" style={{ padding: "50px 40px", textAlign: "center", maxWidth: "550px", width: "100%", position: "relative", zIndex: 2 }}>
          <h2 style={{ marginBottom: "10px", color: "var(--primary)", fontSize: "32px" }}>Create Your Account</h2>
          <p style={{ marginBottom: "35px", color: "var(--text-muted)", fontSize: "16px" }}>Join the CareGuru healthcare network</p>
          
          <div className="role-selection" style={{ display: "flex", gap: "15px", marginBottom: "40px", justifyContent: "center" }}>
            <button 
              onClick={() => setRole("patient")} 
              className="nav-btn"
              style={{ flex: 1, height: "54px", background: role === "patient" ? "var(--primary)" : "white", color: role === "patient" ? "white" : "var(--text-main)", border: role === "patient" ? "none" : "1.5px solid #e2e8f0", boxShadow: role === "patient" ? "var(--shadow-md)" : "none" }}
            >
              I'm a Patient
            </button>
            <button 
              onClick={() => setRole("hospital")} 
              className="nav-btn"
              style={{ flex: 1, height: "54px", background: role === "hospital" ? "var(--primary)" : "white", color: role === "hospital" ? "white" : "var(--text-main)", border: role === "hospital" ? "none" : "1.5px solid #e2e8f0", boxShadow: role === "hospital" ? "var(--shadow-md)" : "none" }}
            >
              We're a Hospital
            </button>
          </div>

          <form onSubmit={handleRegister} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Email Address</label>
              <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none", transition: "var(--transition)" }} />
            </div>
            
            <div style={{ marginBottom: "25px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Password</label>
              <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none", transition: "var(--transition)" }} />
            </div>

            {role === "hospital" && (
              <div className="hospital-fields" style={{ borderTop: "2px solid #f1f5f9", paddingTop: "25px", marginTop: "10px", marginBottom: "30px" }}>
                <p style={{ fontWeight: "700", marginBottom: "20px", color: "var(--primary)", fontSize: "18px" }}>Hospital Profile Information</p>
                
                <div style={{ marginBottom: "15px" }}>
                  <input type="text" placeholder="Official Hospital Name" value={hospitalDetails.hospitalName} onChange={(e) => setHospitalDetails({ ...hospitalDetails, hospitalName: e.target.value })} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
                </div>
                
                <div style={{ marginBottom: "15px" }}>
                  <input type="text" placeholder="Full Location / Address" value={hospitalDetails.address} onChange={(e) => setHospitalDetails({ ...hospitalDetails, address: e.target.value })} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
                </div>
                
                <div style={{ marginBottom: "5px" }}>
                  <input type="text" placeholder="Google Maps Share Link" value={hospitalDetails.mapsUrl} onChange={(e) => setHospitalDetails({ ...hospitalDetails, mapsUrl: e.target.value })} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
                </div>
                <p style={{ fontSize: "12px", color: "var(--primary)", marginBottom: "15px", fontWeight: "500", paddingLeft: "5px" }}>💡 Pro Tip: Paste the Google Maps URL to enable emergency proximity tracking.</p>
                
                <textarea placeholder="Facility Overview & Specialties" value={hospitalDetails.description} onChange={(e) => setHospitalDetails({ ...hospitalDetails, description: e.target.value })} required style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none", minHeight: "100px", resize: "vertical" }} />
              </div>
            )}

            <button type="submit" disabled={loading} className="nav-btn" style={{ width: "100%", height: "54px", fontSize: "16px", background: "var(--primary)", color: "white", border: "none", boxShadow: "var(--shadow-md)" }}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{ margin: "30px 0", display: "flex", alignItems: "center" }}>
            <hr style={{ flex: 1, border: "none", height: "1px", background: "#e2e8f0" }} />
            <span style={{ padding: "0 15px", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600" }}>OR JOIN WITH</span>
            <hr style={{ flex: 1, border: "none", height: "1px", background: "#e2e8f0" }} />
          </div>

          <button onClick={() => handleRegister()} disabled={loading} className="nav-btn" style={{ width: "100%", height: "54px", background: "white", color: "var(--text-main)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Google Identity
          </button>
          
          <p style={{ marginTop: "30px", fontSize: "15px", color: "var(--text-muted)" }}>
            Already registered? <span onClick={() => navigate("/login")} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}>Sign In</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Register;
