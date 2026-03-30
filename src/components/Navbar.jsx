import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Navbar({ variant = "dark" }) {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [profileImage, setProfileImage] = useState(null);
  const isLight = variant === "light";

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            setProfileImage(snap.data().profile?.image || user.photoURL);
          } else {
            setProfileImage(user.photoURL);
          }
        } catch (error) {
          console.error("Error fetching navbar profile:", error);
          setProfileImage(user.photoURL);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    setProfileImage(null);
    navigate("/");
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    contactSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="nav-wrapper">
      <nav className="navbar">
        {/* LOGO / BRAND (Optional, can just be 'Home' for now) */}
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <Link to="/" style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary)", opacity: 1, padding: 0 }}>CareGuru</Link>
          
          <div style={{ display: "flex", gap: "10px", marginLeft: "20px" }}>
            <Link to="/">Home</Link>
            {role === "hospital" ? (
              <>
                <Link to="/hospital-dashboard">Dashboard</Link>
                <Link to="/doctor-appointments">Appointments</Link>
              </>
            ) : (
              <Link to="/hospitals">Find Hospitals</Link>
            )}
            {user && role === "patient" && (
              <>
                <Link to="/appointments">My Appointments</Link>
                <Link to="/chatbot">Alan (AI)</Link>
              </>
            )}
            <Link to="/about">About Us</Link>
          </div>
        </div>

        {/* AUTH & ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {!user ? (
            <Link to="/login" className="nav-btn nav-btn-primary">
              Sign In
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button 
                onClick={handleLogout}
                className="nav-btn"
                style={{ height: "40px", padding: "0 20px" }}
              >
                Logout
              </button>
              
              <div
                className={`profile-icon ${isLight ? "profile-light" : ""}`}
                onClick={() => navigate("/profile")}
                style={{ width: "45px", height: "45px", fontSize: "18px", overflow: "hidden" }}
                title="Your Profile"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span>👤</span>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;