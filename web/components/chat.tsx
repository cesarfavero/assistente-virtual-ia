"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const SUGESTOES = [
  "Quanto gastei com alimentação?",
  "Onde estou gastando mais?",
  "Como está minha reserva de emergência?",
  "O que é CDI?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Não consegui processar agora. Tente novamente em instantes.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <p className="brand-name">Mira</p>
            <p className="brand-tag">Organização financeira</p>
          </div>
        </div>

        <div className="sidebar-block">
          <p className="sidebar-label">Cliente fictício</p>
          <p className="sidebar-text">João Silva, 32 anos</p>
          <p className="sidebar-muted">Meta: reserva de emergência</p>
        </div>

        <div className="sidebar-block">
          <p className="sidebar-label">Sugestões</p>
          <div className="suggestions">
            {SUGESTOES.map((s) => (
              <button
                key={s}
                type="button"
                className="suggestion"
                onClick={() => send(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="sidebar-foot">
          Projeto DIO · Base de conhecimento estruturada · Anti-alucinação
        </p>
      </aside>

      <main className="main">
        <header className="header">
          <h1>Como posso ajudar nas suas finanças?</h1>
          <p>
            Pergunte sobre gastos, reserva de emergência ou próximos passos.
          </p>
        </header>

        <div className="messages">
          {!hasMessages && !loading && (
            <div className="empty animate-fade-up">
              <p className="empty-title">Comece com uma pergunta</p>
              <p className="empty-sub">
                Respostas baseadas nos dados mockados do repositório.
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={`${msg.role}-${i}`}
              className={`row ${msg.role} animate-fade-up`}
            >
              {msg.role === "assistant" && (
                <div className="avatar assistant-avatar">M</div>
              )}
              <div className={`bubble ${msg.role}`}>{msg.content}</div>
            </div>
          ))}

          {loading && (
            <div className="row assistant animate-fade-up">
              <div className="avatar assistant-avatar">M</div>
              <div className="bubble assistant typing">
                <span />
                <span />
                <span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida financeira..."
            disabled={loading}
            autoComplete="off"
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Enviar
          </button>
        </form>
      </main>

      <style jsx>{`
        .shell {
          display: grid;
          grid-template-columns: 280px 1fr;
          height: 100vh;
          max-width: 1200px;
          margin: 0 auto;
          padding: 16px;
          gap: 16px;
        }

        .sidebar {
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(12px);
          border: 1px solid var(--pearl-200);
          border-radius: 24px;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          box-shadow: var(--shadow);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-mark {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(145deg, var(--accent), #7a8f78);
          color: white;
          display: grid;
          place-items: center;
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .brand-name {
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.1;
        }

        .brand-tag {
          font-size: 0.8rem;
          color: var(--ink-500);
        }

        .sidebar-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--ink-400);
          margin-bottom: 8px;
        }

        .sidebar-text {
          font-size: 0.95rem;
          font-weight: 500;
        }

        .sidebar-muted {
          font-size: 0.85rem;
          color: var(--ink-500);
          margin-top: 4px;
        }

        .suggestions {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestion {
          text-align: left;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid var(--pearl-200);
          background: var(--pearl-50);
          color: var(--ink-700);
          cursor: pointer;
          font-size: 0.82rem;
          line-height: 1.35;
          transition: all 0.2s ease;
        }

        .suggestion:hover:not(:disabled) {
          background: var(--accent-soft);
          border-color: #c5d4c3;
        }

        .suggestion:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .sidebar-foot {
          margin-top: auto;
          font-size: 0.72rem;
          color: var(--ink-400);
          line-height: 1.5;
        }

        .main {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: blur(12px);
          border: 1px solid var(--pearl-200);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }

        .header {
          padding: 28px 32px 12px;
          border-bottom: 1px solid var(--pearl-100);
        }

        .header h1 {
          font-family: var(--font-display), Georgia, serif;
          font-size: clamp(1.6rem, 3vw, 2.1rem);
          font-weight: 500;
          letter-spacing: -0.02em;
        }

        .header p {
          margin-top: 6px;
          color: var(--ink-500);
          font-size: 0.95rem;
        }

        .messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .empty {
          margin: auto;
          text-align: center;
          max-width: 360px;
        }

        .empty-title {
          font-family: var(--font-display), Georgia, serif;
          font-size: 1.4rem;
          margin-bottom: 8px;
        }

        .empty-sub {
          color: var(--ink-500);
          font-size: 0.9rem;
        }

        .row {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .row.user {
          justify-content: flex-end;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 0.85rem;
          font-weight: 600;
          flex-shrink: 0;
        }

        .assistant-avatar {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .bubble {
          max-width: min(72%, 560px);
          padding: 14px 18px;
          border-radius: var(--radius);
          font-size: 0.95rem;
          line-height: 1.55;
        }

        .bubble.user {
          background: var(--user-bubble);
          color: #f8f6f2;
          border-bottom-right-radius: 6px;
        }

        .bubble.assistant {
          background: var(--assistant-bubble);
          border: 1px solid var(--pearl-200);
          color: var(--ink-700);
          border-bottom-left-radius: 6px;
          box-shadow: 0 2px 8px rgba(26, 24, 20, 0.04);
        }

        .typing {
          display: flex;
          gap: 5px;
          align-items: center;
          min-height: 24px;
        }

        .typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--ink-400);
          animation: pulse-dot 1.2s infinite;
        }

        .typing span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .composer {
          display: flex;
          gap: 10px;
          padding: 16px 20px 20px;
          border-top: 1px solid var(--pearl-100);
          background: rgba(250, 249, 247, 0.6);
        }

        .composer input {
          flex: 1;
          padding: 14px 18px;
          border-radius: 16px;
          border: 1px solid var(--pearl-200);
          background: white;
          outline: none;
          transition: border-color 0.2s;
        }

        .composer input:focus {
          border-color: #b8c4b6;
        }

        .composer button {
          padding: 0 22px;
          border-radius: 14px;
          border: none;
          background: var(--accent);
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .composer button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        @media (max-width: 860px) {
          .shell {
            grid-template-columns: 1fr;
            height: auto;
            min-height: 100vh;
          }

          .sidebar {
            display: none;
          }

          .main {
            min-height: calc(100vh - 32px);
          }
        }
      `}</style>
    </div>
  );
}