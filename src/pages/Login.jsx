import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import { auth, provider, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../styles/main.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (email && password) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        // Clear inputs if using Google Login
        setEmail("");
        setPassword("");
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }

      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.role === "hospital") {
          navigate("/hospital-dashboard");
        } else {
          navigate("/dashboard");
        }
      } else {
        // User doesn't have a role yet, redirect to register
        navigate("/register");
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Failed to login: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar variant="light" />
      <div className="login-container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 20px 60px", background: "url('https://images.unsplash.com/photo-1576091160550-217359f4ecf8?auto=format&fit=crop&q=80&w=2070') center/cover no-repeat", position: "relative" }}>
        {/* Abstract Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0, 90, 160, 0.8), rgba(0, 192, 250, 0.4))", zIndex: 1 }}></div>

        <div className="glass-card" style={{ padding: "50px 40px", textAlign: "center", maxWidth: "450px", width: "100%", position: "relative", zIndex: 2 }}>
          <h2 style={{ marginBottom: "10px", color: "var(--primary)", fontSize: "32px" }}>Welcome Back</h2>
          <p style={{ marginBottom: "40px", color: "var(--text-muted)", fontSize: "16px" }}>Login to your CareGuru account</p>
          
          <form onSubmit={handleLogin} style={{ textAlign: "left" }}>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Email Address</label>
              <input 
                type="email" 
                placeholder="name@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none", transition: "var(--transition)" }} 
              />
            </div>
            
            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ width: "100%", padding: "14px 20px", borderRadius: "var(--radius-md)", border: "1.5px solid #e2e8f0", background: "white", outline: "none", transition: "var(--transition)" }} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="nav-btn"
              style={{ width: "100%", height: "54px", fontSize: "16px", background: "var(--primary)", color: "white", border: "none", boxShadow: "var(--shadow-md)" }}
            >
              {loading ? "Authenticating..." : "Login to Account"}
            </button>
          </form>

          <div style={{ margin: "30px 0", display: "flex", alignItems: "center" }}>
            <hr style={{ flex: 1, border: "none", height: "1px", background: "#e2e8f0" }} />
            <span style={{ padding: "0 15px", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600" }}>OR CONTINUE WITH</span>
            <hr style={{ flex: 1, border: "none", height: "1px", background: "#e2e8f0" }} />
          </div>

          <button 
            onClick={() => handleLogin()} 
            disabled={loading} 
            className="nav-btn"
            style={{ width: "100%", height: "54px", background: "white", color: "var(--text-main)", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width="20" />
            Google Workspace
          </button>
          
          <p style={{ marginTop: "30px", fontSize: "15px", color: "var(--text-muted)" }}>
            New to CareGuru? <span onClick={() => navigate("/register")} style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "700", textDecoration: "underline" }}>Create an account</span>
          </p>
        </div>
      </div>
    </>
  );
}

export default Login;
