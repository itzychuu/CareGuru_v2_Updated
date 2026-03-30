import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import "../styles/doctors.css";

function HospitalDetails() {
  const { id } = useParams(); // This is the hospitalId (uid)
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add("light-navbar");
    fetchHospitalAndDoctors();
    return () => document.body.classList.remove("light-navbar");
  }, [id]);

  const fetchHospitalAndDoctors = async () => {
    setLoading(true);
    try {
      // Fetch Hospital details
      const hospitalSnap = await getDoc(doc(db, "users", id));
      if (hospitalSnap.exists()) {
        const hData = hospitalSnap.data();
        setHospital({
          id: id,
          name: hData.hospitalName || hData.displayName || hData.email.split('@')[0],
          ...hData
        });
      }

      // Fetch Doctors for this hospital
      const q = query(
        collection(db, "doctors"), 
        where("hospitalId", "==", id),
        where("isAvailable", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const docsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctors(docsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="doctor-page" style={{ padding: "150px", textAlign: "center" }}>
          <h2>Loading...</h2>
        </div>
      </>
    );
  }

  if (!hospital) {
    return (
      <>
        <Navbar />
        <div className="doctor-page" style={{ padding: "150px", textAlign: "center" }}>
          <h2>Hospital not found</h2>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="doctor-page" style={{ padding: "120px 20px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Hospital Header Header */}
        <div className="glass-card" style={{ padding: "40px", marginBottom: "50px", textAlign: "center" }}>
          <h1 style={{ color: "var(--primary)", fontSize: "36px", marginBottom: "10px" }}>{hospital.name}</h1>
          <p style={{ color: "var(--primary)", fontWeight: "600", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            📍 {hospital.address}
          </p>
          <div style={{ maxWidth: "700px", margin: "20px auto 0", color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.7" }}>
            {hospital.description}
          </div>
        </div>

        <h2 style={{ fontSize: "28px", color: "var(--text-main)", marginBottom: "30px", paddingLeft: "10px" }}>Available Specialists</h2>

        <div className="doctor-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
          {doctors.length === 0 ? (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "100px 0" }}>
              <div style={{ fontSize: "64px", marginBottom: "20px" }}>👨‍⚕️</div>
              <p style={{ fontSize: "18px", color: "var(--text-muted)" }}>No doctors available at the moment.</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div className="glass-card" key={doctor.id} style={{ padding: "25px", textAlign: "center", transition: "var(--transition)" }}>
                {/* Profile Image */}
                <div style={{ width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 20px", overflow: "hidden", border: "4px solid rgba(0, 90, 160, 0.1)", boxShadow: "var(--shadow-md)" }}>
                  <img
                    src={doctor.image || "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"}
                    alt={doctor.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <h3 style={{ fontSize: "22px", color: "var(--primary)", marginBottom: "5px" }}>{doctor.name}</h3>
                <p className="badge badge-info" style={{ marginBottom: "20px", textTransform: "none", fontSize: "12px" }}>{doctor.specialization}</p>

                <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "25px", minHeight: "60px", lineHeight: "1.5" }}>
                  Expert in {doctor.specialization.toLowerCase()} with years of dedicated clinical experience.
                </p>

                <button
                  className="nav-btn"
                  style={{ width: "100%", background: "var(--primary)", color: "white", border: "none" }}
                  onClick={() =>
                    navigate("/book-appointment", {
                      state: { 
                        doctor, 
                        hospitalName: hospital.name,
                        hospitalId: id 
                      },
                    })
                  }
                >
                  Book Appointment
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default HospitalDetails;
