import { useState } from "react";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";

import styles from "./AIAssistant.module.css";

function normalizeAssistantText(raw) {
  let text = String(raw || "").replace(/\r\n/g, "\n");

  // Remove markdown symbols so replies read like normal prose.
  text = text.replace(/^#{1,6}\s*/gm, "");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/`{1,3}([^`]+)`{1,3}/g, "$1");
  text = text.replace(/^\s*[-*]\s+/gm, "• ");
  text = text.replace(/^\s*\d+\.\s+/gm, "• ");
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, "$1");

  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  }

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function MessageContent({ role, text }) {
  const normalized = role === "assistant" ? normalizeAssistantText(text) : String(text || "");
  const lines = normalized.split("\n").filter((line) => line.trim().length > 0);

  return (
    <div className={styles.content}>
      {lines.map((line, index) => {
        const isBullet = line.trim().startsWith("• ");
        if (isBullet) {
          return <p key={`${index}-${line}`} className={styles.bullet}>{line}</p>;
        }
        return <p key={`${index}-${line}`}>{line}</p>;
      })}
    </div>
  );
}

export default function AIAssistant({ messages, onSend, loading }) {
  const [input, setInput] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <section className={`${styles.panel} card`}>
      <div className={styles.messages}>
        {messages.map((m) => (
          <div key={m.id} className={`${styles.msg} ${m.role === "assistant" ? styles.ai : styles.user}`}>
            <span>{m.role === "assistant" ? "AI" : "You"}</span>
            <MessageContent role={m.role} text={m.message} />
            <small>{new Date(m.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
        {loading && <div className={styles.typing}>TravelMind is typing...</div>}
      </div>
      <form onSubmit={submit} className={styles.inputBar}>
        <input className="input" value={input} placeholder="Ask TravelMind..." onChange={(e) => setInput(e.target.value)} />
        <button className="btn" type="button">
          <FaMicrophone />
        </button>
        <button className="btn btn-primary" type="submit">
          <FaPaperPlane />
        </button>
      </form>
    </section>
  );
}
