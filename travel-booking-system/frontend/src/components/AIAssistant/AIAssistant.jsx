import { useState } from "react";
import { FaPaperPlane, FaMicrophone } from "react-icons/fa";

import styles from "./AIAssistant.module.css";

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
            <p>{m.message}</p>
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
