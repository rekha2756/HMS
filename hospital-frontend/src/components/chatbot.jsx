import React, { useState, useRef, useEffect } from "react";
import "../css/chatbot.css";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [chat, setChat] = useState([
    { sender: "bot", text: "Hi 😊 How can I help you today?" }
  ]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat(prev => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    // typing effect
    setChat(prev => [...prev, { sender: "bot", text: "..." }]);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
      });

      const data = await res.json();

      setTimeout(() => {
        setChat(prev => {
          const updated = [...prev];
          updated.pop();
          return [...updated, { sender: "bot", text: data.reply }];
        });
        setLoading(false);
      }, 600);

    } catch {
      setChat(prev => {
        const updated = [...prev];
        updated.pop();
        return [...updated, { sender: "bot", text: "Server error" }];
      });
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cute Floating Button */}
      <div className="chatbot-circle" onClick={toggleChat}>
        🤖
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">

          <div className="chat-header">
            HMS Assistant
            <span onClick={toggleChat}>✖</span>
          </div>

          <div className="chat-body">
            {chat.map((msg, i) => (
              <div key={i} className={`msg ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              disabled={loading}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
          </div>

        </div>
      )}
    </>
  );
}