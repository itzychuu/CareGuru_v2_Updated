import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/chatbot.css";
import { getAIResponse } from "../services/aiService";

function Chatbot() {
  // ================= STATE =================
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= STATIC DATA =================
  const recommendations = [
    "Prepare me a diet",
    "Healthy daily routine",
    "Tips to improve immunity",
  ];

  // ================= FUNCTIONS =================

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;

    // User message
    const userMessage = {
      sender: "user",
      text: userText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Save chat history only once per conversation
    if (messages.length === 0) {
      setChatHistory((prev) => [
        ...prev,
        `Chat ${prev.length + 1}`,
      ]);
    }

    // AI typing placeholder
    const typingMessage = {
      sender: "ai",
      text: "AI is typing...",
    };

    setMessages((prev) => [...prev, typingMessage]);

    // Get AI response (real or demo)
    const aiReply = await getAIResponse(userText);

    // Replace typing with real AI message
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        sender: "ai",
        text: aiReply,
      },
    ]);
  };

  // ================= UI =================
  return (
    <div className="chatbot-container">
      {/* ================= LEFT PANEL ================= */}
      <div className="chat-left">
        <h3 style={{ marginTop: "40px" }}>Health Tips</h3>

        {recommendations.map((rec, index) => (
          <button
            key={index}
            className="recommend-btn"
            onClick={() => setInput(rec)}
          >
            {rec}
          </button>
        ))}

        <h4>Session History</h4>

        <ul className="chat-history">
          {chatHistory.length === 0 ? (
            <li className="empty">No recent consultations</li>
          ) : (
            chatHistory.map((chat, index) => (
              <li key={index}>● {chat}</li>
            ))
          )}
        </ul>
      </div>

      {/* ================= CENTER CHAT ================= */}
      <div className="chat-center">
        <div className="chat-area">
          {messages.length === 0 && (
            <div className="empty-chat">
              <h2 style={{ color: "var(--primary)", marginBottom: "10px" }}>Consult Alan</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>
                Your personal health companion. Ask me anything about your wellness or medical symptoms.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.sender}`}
            >
              <div style={{ fontSize: "12px", fontWeight: "800", marginBottom: "5px", opacity: 0.6, textTransform: "uppercase" }}>
                {msg.sender === "ai" ? "Alan ● Assistant" : "You"}
              </div>
              {msg.text}
            </div>
          ))}
        </div>

        {/* INPUT BAR */}
        <div className="chat-input shadow-premium">
          <button className="icon-btn" title="Add Image (Coming Soon)">
            📷
          </button>
          
          <input
            type="text"
            placeholder="Type your health query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && handleSendMessage()
            }
          />

          <button
            className="send-btn"
            title="Send Message"
            onClick={handleSendMessage}
          >
            <span style={{ transform: "rotate(-45deg)", display: "inline-block" }}>➤</span>
          </button>
        </div>
      </div>

      {/* ================= RIGHT SLIDE MENU ================= */}
      <div className={`chat-right ${menuOpen ? "open" : ""}`}>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className="side-nav">
          <Link to="/">Home Dashboard</Link>
          <Link to="/hospitals">Find Specialists</Link>
          <Link to="/about">Our Mission</Link>
          <button className="share-btn" style={{ border: "2px solid var(--primary)", padding: "12px", borderRadius: "10px" }}>
             Copy Chat Link
          </button>
        </nav>
      </div>
    </div>
  );
}

export default Chatbot;
