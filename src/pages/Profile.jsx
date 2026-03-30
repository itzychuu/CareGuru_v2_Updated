import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/profile.css";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

function Profile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState(null);

  // ✅ Fetch profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          setProfileData(snap.data().profile || {});
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, [user]);

  // Light navbar
  useEffect(() => {
    document.body.classList.add("light-navbar");
    return () => document.body.classList.remove("light-navbar");
  }, []);

  if (loading) {
    return <div style={{ padding: "150px" }}>Loading...</div>;
  }

  return (
    <>
      <Navbar />

      <div className="profile-page" style={{ padding: "140px 20px 80px", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Profile Header / Actions */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "32px", color: "var(--primary)" }}>My Profile</h1>
          {user && (
            <button
              className="nav-btn"
              onClick={async () => await signOut(auth)}
              style={{ background: "white", color: "var(--danger)", borderColor: "var(--danger)" }}
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Profile Content Container */}
        <div className="glass-card" style={{ width: "100%", padding: "50px 40px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
          
          <button
            className="nav-btn"
            style={{ position: "absolute", top: "30px", right: "30px", padding: "8px 15px", height: "auto" }}
            onClick={() => navigate("/profile/edit")}
          >
            ✏ Edit Details
          </button>

          {/* Avatar Section */}
          <div style={{ width: "150px", height: "150px", borderRadius: "50%", padding: "5px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "var(--shadow-lg)", marginBottom: "30px" }}>
            <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {profileData?.image ? (
                <img src={profileData?.image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: "60px" }}>👤</span>
              )}
            </div>
          </div>

          <h2 style={{ fontSize: "28px", color: "var(--text-main)", marginBottom: "5px" }}>{user?.displayName || "User Name"}</h2>
          <p style={{ color: "var(--primary)", fontWeight: "600", marginBottom: "40px" }}>{user?.email}</p>

          {/* Info Grid */}
          <div style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "25px", borderTop: "1.5px solid #f1f5f9", paddingTop: "40px" }}>
            {[
              { label: "Age", value: profileData?.age, icon: "🎂" },
              { label: "Gender", value: profileData?.gender, icon: "⚧" },
              { label: "Blood Group", value: profileData?.bloodGroup, icon: "🩸" },
              { label: "Contact No", value: profileData?.contact, icon: "📞" }
            ].map((item, i) => (
              <div key={i} style={{ padding: "20px", background: "#f8fafc", borderRadius: "var(--radius-md)", border: "1px solid #f1f5f9", textAlign: "center" }}>
                <p style={{ fontSize: "24px", marginBottom: "10px" }}>{item.icon}</p>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "5px" }}>{item.label}</p>
                <p style={{ fontSize: "18px", color: "var(--text-main)", fontWeight: "700" }}>{item.value || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile;
