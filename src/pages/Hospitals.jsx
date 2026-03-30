import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/hospitals.css";

function Hospitals() {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState([]);
  const [allHospitals, setAllHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("light-navbar");
    fetchHospitals();
    return () => document.body.classList.remove("light-navbar");
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "hospital"));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.data().hospitalName || doc.data().displayName || doc.data().email.split('@')[0],
        address: doc.data().address || "Location not specified",
        description: doc.data().description || "Medical facility specialized in various healthcare services."
      }));
      setHospitals(data);
      setAllHospitals(data);
    } catch (error) {
      console.error("Error fetching hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const findNearestHospital = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const sorted = [...allHospitals]
        .map((h) => ({
          ...h,
          distance: calculateDistance(latitude, longitude, h.lat, h.lng),
        }))
        .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
      setHospitals(sorted);
    });
  };

  const openMaps = (h) => {
    if (h.mapsUrl) {
      window.open(h.mapsUrl, "_blank");
    } else if (h.lat && h.lng) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}`,
        "_blank"
      );
    } else {
      alert("Location details not set for this hospital");
    }
  };

  const handleSearch = (e) => {
    const text = e.target.value.toLowerCase();
    const filtered = allHospitals.filter((h) =>
      h.name.toLowerCase().includes(text)
    );
    setHospitals(filtered);
  };

  return (
    <>
      <Navbar />

      <div className="hospital-page" style={{ padding: "120px 20px 80px", maxWidth: "1100px", margin: "0 auto" }}>

        <div className="glass-card" style={{ padding: "40px", marginBottom: "60px", display: "flex", flexDirection: "column", alignItems: "center", gap: "25px", textAlign: "center" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "36px", marginBottom: "5px" }}>Find Care Near You</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "18px", maxWidth: "600px", marginBottom: "10px" }}>Discover top-rated medical facilities and specialist doctors in your vicinity.</p>
          
          <div style={{ width: "100%", maxWidth: "700px", display: "flex", gap: "15px", flexWrap: "wrap", justifyContent: "center" }}>
            <input
              className="footer-form"
              style={{ flex: "2 1 400px", margin: 0, padding: "16px 25px", borderRadius: "var(--radius-full)", border: "1.5px solid #e2e8f0", background: "white" }}
              placeholder="🔍 Search hospitals by name or location..."
              onChange={handleSearch}
            />

            <button 
              className="nav-btn" 
              onClick={findNearestHospital}
              style={{ background: "var(--primary)", color: "white", border: "none", height: "54px" }}
            >
              📍 Find Nearest
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "30px" }}>
          {hospitals.map((hospital) => (
            <div className="glass-card" key={hospital.id} style={{ padding: "30px", border: "1px solid rgba(0,0,0,0.03)", transition: "var(--transition)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
                
                <div style={{ flex: "1 1 400px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <h2 style={{ fontSize: "24px", color: "var(--primary)" }}>{hospital.name}</h2>
                    {hospital.distance && (
                      <span className="badge badge-info" style={{ textTransform: "none" }}>{hospital.distance} km away</span>
                    )}
                  </div>
                  <p style={{ color: "var(--text-muted)", marginBottom: "15px", fontSize: "15px", lineHeight: "1.6" }}>{hospital.description}</p>
                  <p style={{ fontSize: "14px", color: "var(--primary)", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                    📍 {hospital.address}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button
                    className="nav-btn"
                    style={{ background: "var(--primary)", color: "white", border: "none" }}
                    onClick={() => navigate(`/hospital/${hospital.id}`)}
                  >
                    Find Doctors
                  </button>

                  <button
                    className="nav-btn"
                    style={{ background: "white", color: "var(--primary)" }}
                    onClick={() => openMaps(hospital)}
                  >
                    Navigate ✈
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {hospitals.length === 0 && (
            <div style={{ textAlign: "center", padding: "100px 0" }}>
              <p style={{ fontSize: "20px", color: "var(--text-muted)" }}>No hospitals found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Hospitals;