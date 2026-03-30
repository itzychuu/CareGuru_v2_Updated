import { useEffect } from "react";
import Navbar from "../components/Navbar";

function About() {
  useEffect(() => {
    document.body.classList.add("light-navbar");
    return () => document.body.classList.remove("light-navbar");
  }, []);

  return (
    <>
      <Navbar variant="light" />
      
      <div className="about-page" style={{ padding: "140px 20px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* HERO SECTION */}
        <div style={{ display: "flex", gap: "60px", alignItems: "center", marginBottom: "120px", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 500px" }}>
            <h1 style={{ fontSize: "64px", color: "var(--primary)", fontWeight: "800", marginBottom: "30px", lineHeight: "1.05", letterSpacing: "-2px" }}>
              Healthcare, <br />Reimagined For <br /><span style={{ color: "var(--secondary)" }}>Everyone.</span>
            </h1>
            <p style={{ fontSize: "22px", color: "var(--text-muted)", lineHeight: "1.6", marginBottom: "40px", fontWeight: "400" }}>
              CareGuru is more than just a booking platform. We are bridging the gap between specialized medical care and those who need it most, through innovative technology and a patient-first approach.
            </p>
            <button className="nav-btn" style={{ background: "var(--primary)", color: "white", border: "none", height: "60px", padding: "0 40px", fontSize: "18px" }}>Explore Our Vision</button>
          </div>
          <div style={{ flex: "1 1 450px", position: "relative" }}>
            <div style={{ position: "absolute", inset: "-20px", background: "var(--secondary)", opacity: "0.1", borderRadius: "40px", transform: "rotate(-3deg)", zIndex: -1 }}></div>
            <img 
              src="https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg" 
              alt="CareGuru Medical Illustration" 
              style={{ width: "100%", borderRadius: "30px", boxShadow: "var(--shadow-premium)" }} 
            />
          </div>
        </div>

        {/* MISSION & VISION */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "40px", marginBottom: "120px" }}>
          <div className="glass-card" style={{ padding: "50px", border: "1px solid rgba(0, 90, 160, 0.05)" }}>
            <div style={{ fontSize: "40px", marginBottom: "25px" }}>🎯</div>
            <h2 style={{ color: "var(--primary)", fontSize: "28px", marginBottom: "20px" }}>Our Mission</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "18px", lineHeight: "1.8" }}>
              To simplify hospital discovery and appointment booking for everyone, everywhere. We believe that finding the right doctor should be a seamless, supportive, and stress-free experience.
            </p>
          </div>
          <div className="glass-card" style={{ padding: "50px", border: "1px solid rgba(0, 192, 250, 0.05)" }}>
            <div style={{ fontSize: "40px", marginBottom: "25px" }}>🚀</div>
            <h2 style={{ color: "var(--primary)", fontSize: "28px", marginBottom: "20px" }}>Our Vision</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "18px", lineHeight: "1.8" }}>
              A world where quality medical care is just a click away. We are building the infrastructure of digital healthcare, connecting hospitals and patients through transparency and real-time management.
            </p>
          </div>
        </div>

        {/* KEY FEATURES GRID */}
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={{ fontSize: "42px", color: "var(--text-main)", marginBottom: "15px" }}>Why Choose CareGuru?</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "18px" }}>The digital backbone of modern healthcare accessibility.</p>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "30px", marginBottom: "120px" }}>
          {[
            { icon: "🏥", title: "Hospital Discovery", desc: "Explore a global network of hospitals with verified details and real-time availability." },
            { icon: "📅", title: "Smart Booking", desc: "Instantly schedule appointments with top specialized doctors without any hassle." },
            { icon: "📍", title: "Live Navigation", desc: "Integrated Google Maps support to guide you directly to your chosen medical facility." },
            { icon: "🛡️", title: "Secure Profiles", desc: "Your medical records and appointment history are protected with industry-standard security." }
          ].map((feature, i) => (
            <div key={i} className="glass-card" style={{ textAlign: "center", padding: "40px 30px", border: "1px solid rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "48px", marginBottom: "25px" }}>{feature.icon}</div>
              <h3 style={{ marginBottom: "15px", fontSize: "20px", color: "var(--text-main)" }}>{feature.title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: "1.6" }}>{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CALL TO ACTION */}
        <div style={{ 
          textAlign: "center", 
          padding: "100px 50px", 
          background: "linear-gradient(135deg, var(--primary), var(--secondary))", 
          borderRadius: "50px", 
          color: "white",
          boxShadow: "0 30px 60px rgba(0, 90, 160, 0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", top: "-100px", right: "-100px", width: "300px", height: "300px", background: "white", opacity: "0.05", borderRadius: "50%" }}></div>
          <div style={{ position: "absolute", bottom: "-50px", left: "-50px", width: "200px", height: "200px", background: "white", opacity: "0.05", borderRadius: "50%" }}></div>
          
          <h2 style={{ fontSize: "48px", marginBottom: "25px", fontWeight: "800", textShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>Ready to prioritize your health?</h2>
          <p style={{ fontSize: "20px", marginBottom: "50px", opacity: "0.95", maxWidth: "700px", margin: "0 auto 50px" }}>Join thousands of users who trust CareGuru for their medical assistance and specialized care.</p>
          <button className="nav-btn" style={{ height: "64px", padding: "0 50px", fontSize: "18px", fontWeight: "800", color: "var(--primary)", background: "white", border: "none", boxShadow: "var(--shadow-lg)" }}>
            Get Started For Free
          </button>
        </div>
      </div>
    </>
  );
}

export default About;
