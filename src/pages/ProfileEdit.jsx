import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/profileEdit.css";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";

function ProfileEdit() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    bloodGroup: "",
    contact: "",
    image: ""
  });

  // ✅ Fetch existing data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists() && snap.data().profile) {
          setFormData(snap.data().profile);
        } else {
          // Fallback to Auth data if Firestore is empty
          setFormData(prev => ({
            ...prev,
            name: user.displayName || "",
            image: user.photoURL || ""
          }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    document.body.classList.add("light-navbar");
    return () => document.body.classList.remove("light-navbar");
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ✅ Limit file size before processing
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a file under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // ✅ Canvas-based compression to prevent Firestore 1MB limit errors
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Get compressed base64
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setFormData((prev) => ({
          ...prev,
          image: compressedBase64,
        }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please login first");
      return;
    }

    try {
      // 1. Sanitize formData for Firestore (ensure no complex objects)
      const sanitizedProfile = {
        name: formData.name || "",
        age: formData.age || "",
        gender: formData.gender || "",
        bloodGroup: formData.bloodGroup || "",
        contact: formData.contact || "",
        image: formData.image || ""
      };

      // 2. Update Firestore
      await setDoc(doc(db, "users", user.uid), {
        profile: sanitizedProfile,
        displayName: sanitizedProfile.name,
        email: user.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // 3. Update Firebase Auth Profile
      // ⚠️ IMPORTANT: Only update photoURL if it's NOT a massive base64 string
      // Firebase Auth photoURL has a strict 2048 character limit.
      const authUpdates = { displayName: sanitizedProfile.name };
      if (sanitizedProfile.image && !sanitizedProfile.image.startsWith("data:")) {
        authUpdates.photoURL = sanitizedProfile.image;
      }

      await updateProfile(auth.currentUser, authUpdates);

      alert("Profile updated successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save profile: " + error.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="profile-edit-page" style={{ padding: "140px 20px 80px", maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <h1 style={{ fontSize: "32px", color: "var(--primary)", marginBottom: "40px", alignSelf: "flex-start" }}>Edit Personal Profile</h1>

        <div className="glass-card" style={{ width: "100%", padding: "50px 40px" }}>
          
          {/* Avatar Upload Selection */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
            <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", padding: "4px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "var(--shadow-md)" }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {formData.image ? (
                  <img src={formData.image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "50px" }}>👤</span>
                )}
              </div>
              <label style={{ position: "absolute", bottom: "0", right: "0", background: "var(--primary)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", border: "3px solid white", boxShadow: "var(--shadow-sm)" }}>
                📷
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </label>
            </div>
            <p style={{ marginTop: "15px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Update Profile Photo</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px" }}>
            
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Full Name</label>
              <input name="name" value={formData.name} placeholder="Enter Your Name" onChange={handleChange} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", outline: "none" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Age</label>
                <input name="age" type="number" value={formData.age} placeholder="Age" onChange={handleChange} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", outline: "none" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }}>
                  <option value="">Select Group</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Phone Number</label>
                <input name="contact" value={formData.contact} placeholder="Contact No" onChange={handleChange} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "15px" }}>
              <button 
                className="nav-btn" 
                onClick={handleSave}
                style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", height: "54px" }}
              >
                Save My Profile
              </button>
              <button 
                className="nav-btn" 
                onClick={() => navigate("/profile")}
                style={{ flex: 1, background: "white", color: "var(--text-muted)", borderColor: "#e2e8f0", height: "54px" }}
              >
                Discard
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileEdit;