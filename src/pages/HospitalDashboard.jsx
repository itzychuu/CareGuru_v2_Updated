import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import "../styles/main.css";

function HospitalDashboard() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [hospitalProfile, setHospitalProfile] = useState({
    hospitalName: "",
    address: "",
    description: "",
    mapsUrl: ""
  });
  const [newDoctor, setNewDoctor] = useState({ name: "", specialization: "" });
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDoctors();
      fetchHospitalProfile();
    }
  }, [user]);

  const extractCoords = (url) => {
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = url.match(regex);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return { lat: null, lng: null };
  };

  const fetchHospitalProfile = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setHospitalProfile({
          hospitalName: data.hospitalName || "",
          address: data.address || "",
          description: data.description || "",
          mapsUrl: data.mapsUrl || ""
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "doctors"), where("hospitalId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(docsData);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { lat, lng } = extractCoords(hospitalProfile.mapsUrl);
      await updateDoc(doc(db, "users", user.uid), {
        ...hospitalProfile,
        lat,
        lng
      });
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.specialization) return alert("Please fill in all fields");
    try {
      await addDoc(collection(db, "doctors"), {
        ...newDoctor,
        hospitalId: user.uid,
        isAvailable: true
      });
      setNewDoctor({ name: "", specialization: "" });
      fetchDoctors();
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const toggleAvailability = async (doctorId, currentStatus) => {
    try {
      const docRef = doc(db, "doctors", doctorId);
      await updateDoc(docRef, { isAvailable: !currentStatus });
      fetchDoctors();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await deleteDoc(doc(db, "doctors", doctorId));
      fetchDoctors();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  return (
    <>
      <Navbar variant="light" />
      <div className="hospital-dashboard" style={{ padding: "120px 20px 80px", maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Hospital Info Header */}
        <div className="glass-card" style={{ padding: "40px", marginBottom: "40px", transition: "var(--transition)" }}>
          {!editingProfile ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
              <div style={{ flex: "1 1 500px" }}>
                <h1 style={{ color: "var(--primary)", fontSize: "36px", marginBottom: "15px" }}>{hospitalProfile.hospitalName || "Hospital Dashboard"}</h1>
                <p style={{ color: "var(--text-main)", fontWeight: "600", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  📍 {hospitalProfile.address || "Address not provided"}
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.7", maxWidth: "800px" }}>
                  {hospitalProfile.description || "No description provided yet. Click edit to add a facility overview."}
                </p>
              </div>
              <button 
                onClick={() => setEditingProfile(true)}
                className="nav-btn"
                style={{ background: "white", color: "var(--primary)" }}
              >
                ⚙️ Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} style={{ maxWidth: "800px" }}>
              <h2 style={{ marginBottom: "30px", fontSize: "28px", color: "var(--primary)" }}>Update Hospital Profile</h2>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Hospital Name</label>
                  <input type="text" placeholder="Hospital Name" value={hospitalProfile.hospitalName} onChange={(e) => setHospitalProfile({...hospitalProfile, hospitalName: e.target.value})} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Google Maps URL</label>
                  <input type="text" placeholder="Google Maps URL" value={hospitalProfile.mapsUrl} onChange={(e) => setHospitalProfile({...hospitalProfile, mapsUrl: e.target.value})} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Full Address</label>
                <input type="text" placeholder="Address" value={hospitalProfile.address} onChange={(e) => setHospitalProfile({...hospitalProfile, address: e.target.value})} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Facility Description</label>
                <textarea placeholder="Description" value={hospitalProfile.description} onChange={(e) => setHospitalProfile({...hospitalProfile, description: e.target.value})} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none", minHeight: "120px", resize: "vertical" }} />
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button type="submit" className="nav-btn" style={{ background: "var(--primary)", color: "white", border: "none" }}>Save Profile Changes</button>
                <button type="button" onClick={() => setEditingProfile(false)} className="nav-btn" style={{ background: "white", color: "var(--text-muted)", borderColor: "#e2e8f0" }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px" }}>
          {/* Add Doctor Form */}
          <div className="glass-card" style={{ padding: "40px" }}>
            <h2 style={{ marginBottom: "10px", fontSize: "24px", color: "var(--text-main)" }}>Onboard New Doctor</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "15px" }}>Add specialist doctors to your hospital's public profile.</p>
            
            <form onSubmit={handleAddDoctor}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Doctor's Full Name</label>
                <input type="text" placeholder="Dr. John Doe" value={newDoctor.name} onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
              </div>
              <div style={{ marginBottom: "30px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600" }}>Specialization</label>
                <input type="text" placeholder="e.g., Cardiologist" value={newDoctor.specialization} onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })} style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1.5px solid #e2e8f0", background: "white", outline: "none" }} />
              </div>
              <button type="submit" className="nav-btn" style={{ width: "100%", background: "var(--primary)", color: "white", border: "none" }}>Add Specialist</button>
            </form>
          </div>

          {/* Doctors List */}
          <div className="glass-card" style={{ padding: "40px" }}>
            <h2 style={{ marginBottom: "10px", fontSize: "24px", color: "var(--text-main)" }}>Facility Specialists</h2>
            <p style={{ color: "var(--text-muted)", marginBottom: "30px", fontSize: "15px" }}>Manage availability and listings for your medical staff.</p>
            
            {loading ? <p>Synchronizing staff data...</p> : doctors.length === 0 ? <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No doctors registered yet.</p> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "var(--text-muted)", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                      <th style={{ padding: "0 10px" }}>Doctor</th>
                      <th style={{ padding: "0 10px" }}>Status</th>
                      <th style={{ padding: "0 10px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((docItem) => (
                      <tr key={docItem.id} style={{ transition: "var(--transition)" }}>
                        <td style={{ padding: "15px 10px", background: "white", borderRadius: "12px 0 0 12px", border: "1px solid #f1f5f9", borderRight: "none" }}>
                          <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "15px" }}>{docItem.name}</p>
                          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{docItem.specialization}</p>
                        </td>
                        <td style={{ padding: "15px 10px", background: "white", border: "1px solid #f1f5f9", borderLeft: "none", borderRight: "none" }}>
                          <button 
                            onClick={() => toggleAvailability(docItem.id, docItem.isAvailable)} 
                            className={`badge ${docItem.isAvailable ? "badge-success" : "badge-neutral"}`}
                            style={{ border: "none", cursor: "pointer", transition: "var(--transition)" }}
                          >
                            {docItem.isAvailable ? "Available" : "On Leave"}
                          </button>
                        </td>
                        <td style={{ padding: "15px 10px", background: "white", borderRadius: "0 12px 12px 0", border: "1px solid #f1f5f9", borderLeft: "none", textAlign: "right" }}>
                          <button onClick={() => handleDeleteDoctor(docItem.id)} style={{ color: "var(--danger)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }} title="Remove Expert">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default HospitalDashboard;
