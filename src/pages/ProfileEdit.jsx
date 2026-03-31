import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "../styles/profileEdit.css";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "firebase/auth";

function ProfileEdit() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const isHospital = role === "hospital";

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    name: "", age: "", gender: "", bloodGroup: "", contact: "", image: ""
  });

  // Hospital form state
  const [hospitalForm, setHospitalForm] = useState({
    hospitalName: "", address: "", contact: "", description: ""
  });

  // Fetch existing data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (isHospital) {
            setHospitalForm({
              hospitalName: data.hospitalName || "",
              address:      data.address || "",
              contact:      data.profile?.contact || "",
              description:  data.description || ""
            });
          } else {
            const profile = data.profile || {};
            setPatientForm({
              name:       profile.name || user.displayName || "",
              age:        profile.age || "",
              gender:     profile.gender || "",
              bloodGroup: profile.bloodGroup || "",
              contact:    profile.contact || "",
              image:      profile.image || user.photoURL || ""
            });
          }
        } else {
          if (!isHospital) {
            setPatientForm(prev => ({ ...prev, name: user.displayName || "", image: user.photoURL || "" }));
          }
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      }
    };
    fetchProfile();
  }, [user, isHospital]);

  useEffect(() => {
    document.body.classList.add("light-navbar");
    return () => document.body.classList.remove("light-navbar");
  }, []);

  const handlePatientChange = (e) => setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  const handleHospitalChange = (e) => setHospitalForm({ ...hospitalForm, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image is too large. Please select a file under 2MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 400;
        let { width, height } = img;
        if (width > height) { if (width > MAX) { height *= MAX / width; width = MAX; } }
        else { if (height > MAX) { width *= MAX / height; height = MAX; } }
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        setPatientForm(prev => ({ ...prev, image: canvas.toDataURL("image/jpeg", 0.7) }));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!user) { alert("Please login first"); return; }
    try {
      if (isHospital) {
        await setDoc(doc(db, "users", user.uid), {
          hospitalName: hospitalForm.hospitalName || "",
          address:      hospitalForm.address || "",
          description:  hospitalForm.description || "",
          profile:      { contact: hospitalForm.contact || "" },
          email:        user.email,
          updatedAt:    new Date().toISOString()
        }, { merge: true });

        // Update display name in Firebase Auth
        await updateProfile(auth.currentUser, { displayName: hospitalForm.hospitalName });

        alert("Hospital profile updated successfully!");
      } else {
        const sanitized = {
          name:       patientForm.name || "",
          age:        patientForm.age || "",
          gender:     patientForm.gender || "",
          bloodGroup: patientForm.bloodGroup || "",
          contact:    patientForm.contact || "",
          image:      patientForm.image || ""
        };
        await setDoc(doc(db, "users", user.uid), {
          profile:     sanitized,
          displayName: sanitized.name,
          email:       user.email,
          updatedAt:   new Date().toISOString()
        }, { merge: true });

        const authUpdates = { displayName: sanitized.name };
        if (sanitized.image && !sanitized.image.startsWith("data:")) {
          authUpdates.photoURL = sanitized.image;
        }
        await updateProfile(auth.currentUser, authUpdates);

        alert("Profile updated successfully!");
      }
      navigate("/profile");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save profile: " + error.message);
    }
  };

  const inputStyle = { width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", outline: "none", background: "white" };
  const labelStyle = { display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "700", color: "var(--text-main)" };

  return (
    <>
      <Navbar />
      <div className="profile-edit-page" style={{ padding: "140px 20px 80px", maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <h1 style={{ fontSize: "32px", color: "var(--primary)", marginBottom: "40px", alignSelf: "flex-start" }}>
          {isHospital ? "Edit Hospital Profile" : "Edit Personal Profile"}
        </h1>

        <div className="glass-card" style={{ width: "100%", padding: "50px 40px" }}>

          {/* Avatar upload — only for patients */}
          {!isHospital && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
              <div style={{ position: "relative", width: "120px", height: "120px", borderRadius: "50%", padding: "4px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", boxShadow: "var(--shadow-md)" }}>
                <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "white", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {patientForm.image ? <img src={patientForm.image} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <span style={{ fontSize: "50px" }}>👤</span>}
                </div>
                <label style={{ position: "absolute", bottom: "0", right: "0", background: "var(--primary)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", cursor: "pointer", border: "3px solid white", boxShadow: "var(--shadow-sm)" }}>
                  📷<input type="file" accept="image/*" hidden onChange={handleImageChange} />
                </label>
              </div>
              <p style={{ marginTop: "15px", fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Update Profile Photo</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "25px" }}>

            {isHospital ? (
              <>
                <div>
                  <label style={labelStyle}>Hospital Name</label>
                  <input name="hospitalName" value={hospitalForm.hospitalName} placeholder="e.g. CityMed Hospital" onChange={handleHospitalChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Full Address</label>
                  <input name="address" value={hospitalForm.address} placeholder="Street, City, State" onChange={handleHospitalChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Contact / Phone Number</label>
                  <input name="contact" value={hospitalForm.contact} placeholder="+91 XXXXX XXXXX" onChange={handleHospitalChange} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Facility Description</label>
                  <textarea name="description" value={hospitalForm.description} placeholder="Brief description of your hospital and services..." onChange={handleHospitalChange} style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input name="name" value={patientForm.name} placeholder="Enter Your Name" onChange={handlePatientChange} style={inputStyle} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>Age</label>
                    <input name="age" type="number" value={patientForm.age} placeholder="Age" onChange={handlePatientChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Gender</label>
                    <select name="gender" value={patientForm.gender} onChange={handlePatientChange} style={inputStyle}>
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  <div>
                    <label style={labelStyle}>Blood Group</label>
                    <select name="bloodGroup" value={patientForm.bloodGroup} onChange={handlePatientChange} style={inputStyle}>
                      <option value="">Select Group</option>
                      <option>A+</option><option>A-</option>
                      <option>B+</option><option>B-</option>
                      <option>AB+</option><option>AB-</option>
                      <option>O+</option><option>O-</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Phone Number</label>
                    <input name="contact" value={patientForm.contact} placeholder="Contact No" onChange={handlePatientChange} style={inputStyle} />
                  </div>
                </div>
              </>
            )}

            <div style={{ marginTop: "10px", display: "flex", gap: "15px" }}>
              <button className="nav-btn" onClick={handleSave} style={{ flex: 1, background: "var(--primary)", color: "white", border: "none", height: "54px" }}>
                Save Changes
              </button>
              <button className="nav-btn" onClick={() => navigate("/profile")} style={{ flex: 1, background: "white", color: "var(--text-muted)", borderColor: "#e2e8f0", height: "54px" }}>
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

