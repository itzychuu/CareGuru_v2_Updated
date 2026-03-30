import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import "../styles/main.css";

// 🔹 Import images from src/assets
import heroImage from "../assets/hero.jpeg";
import card1 from "../assets/card1.jpeg";
import card2 from "../assets/card2.jpeg";
import card3 from "../assets/card3.jpeg";

function Home() {
  const navigate = useNavigate();
  const { role } = useAuth();

  // 🚨 SOS Logic
  const handleSOS = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        alert(
          "🚨 Emergency Alert Sent!\n\n" +
            "Latitude: " +
            position.coords.latitude +
            "\nLongitude: " +
            position.coords.longitude +
            "\n\nNearby hospitals have been notified."
        );
      },
      () => {
        alert("Location access denied");
      }
    );
  };

  return (
    <>
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section
        className="hero"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(0, 90, 160, 0.4),
              rgba(0, 90, 160, 0.4)
            ),
            url(${heroImage})
          `,
          backgroundPosition: "center 0%",
        }}
      >
        <div style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}>
          <h1 style={{ textShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
            CareGuru<br/>
            Your Health, <br />
            <span>Our Priority.</span>
          </h1>
          <p style={{ fontSize: "20px", marginTop: "20px", fontWeight: "500", opacity: "0.95", textShadow: "0 2px 4px rgba(0,0,0,0.3)" }}>
            CareGuru connects you with the best hospitals and medical care 24/7.
          </p>

          {role !== "hospital" && (
            <div style={{ marginTop: "40px" }}>
              <button className="sos-btn" onClick={handleSOS}>
                SOS EMERGENCY
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================= CARDS SECTION ================= */}
      <section className="cards">
        {role !== "hospital" && (
          <>
            <div
              className="card"
              style={{ backgroundImage: `url(${card1})` }}
              onClick={() => navigate("/hospitals")}
            >
              <h3>Book Appointments</h3>
            </div>

            <div
              className="card"
              style={{ backgroundImage: `url(${card2})` }}
              onClick={() => navigate("/hospitals")}
            >
              <h3>Find Specialists</h3>
            </div>
          </>
        )}

        <div
          className="card"
          style={{ backgroundImage: `url(${card3})` }}
          onClick={() => navigate("/chatbot")}
        >
          <h3>Alan - Our AI Assistant</h3>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default Home;
