import React, { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Bot,
  Check,
  GraduationCap,
  LoaderCircle,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import "./NaaCollegeAssistant.css";

type ChatRole = "user" | "assistant";
type ChatMessage = { id: string; role: ChatRole; content: string };

const CHAT_ENDPOINT =
  "https://asia-southeast1-manofstudy-live.cloudfunctions.net/websiteAssistantChat";

const WELCOME_MESSAGE: ChatMessage = {
  id: "nca-welcome",
  role: "assistant",
  content:
    "Hi! I’m Naa College AI. Ask me how to use our AP/TG EAPCET tools, find scholarships, explore roadmaps, or navigate any student resource on this website.",
};

const QUICK_QUESTIONS = [
  "Where can I find AP allotments?",
  "Help me find scholarships",
  "Show me engineering roadmaps",
];

function renderSafeLinks(text: string): React.ReactNode[] {
  const pieces: React.ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let pieceKey = 0;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      pieces.push(text.slice(lastIndex, match.index));
    }
    const label = match[1];
    const href = match[2];
    const isInternal = href.startsWith("/") && !href.startsWith("//");
    const isHttp = href.startsWith("https://") || href.startsWith("http://");

    if (isInternal || isHttp) {
      pieces.push(
        <a
          key={"nca-link-" + pieceKey++}
          className="nca-chat-inline-link"
          href={href}
          {...(!isInternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
          {!isInternal && <ArrowUpRight size={12} aria-hidden="true" />}
        </a>
      );
    } else {
      pieces.push(label);
    }
    lastIndex = linkPattern.lastIndex;
  }

  if (lastIndex < text.length) pieces.push(text.slice(lastIndex));
  return pieces;
}

function renderMessage(content: string): React.ReactNode {
  return content.split("\n").map((line, index, all) => (
    <React.Fragment key={"nca-line-" + index}>
      {renderSafeLinks(line)}
      {index < all.length - 1 && <br />}
    </React.Fragment>
  ));
}

export function NaaCollegeAssistant() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [connectionMessage, setConnectionMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [open, messages, sending]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const sendMessage = async (messageText: string) => {
    const cleaned = messageText.trim();
    if (!cleaned || sending) return;

    setConnectionMessage("");
    const userMessage: ChatMessage = {
      id: "nca-" + Date.now() + "-user",
      role: "user",
      content: cleaned.slice(0, 1200),
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-8).map((item) => ({
            role: item.role,
            content: item.content,
          })),
          pagePath: window.location.pathname,
          pageTitle: document.title,
        }),
      });

      const result = await response.json().catch(() => ({} as { error?: string; code?: string; answer?: string }));

      if (!response.ok) {
        if (result.code === "SETUP_REQUIRED") {
          throw new Error("SETUP_REQUIRED");
        }
        if (response.status === 429) {
          throw new Error("Too many messages in a short time. Please wait a little and try again.");
        }
        throw new Error(
          result.error || "I couldn’t connect just now. Please try again in a moment."
        );
      }

      const answer =
        typeof result.answer === "string" && result.answer.trim()
          ? result.answer.trim()
          : "I couldn’t prepare an answer for that question. Please try asking it another way.";

      setMessages((current) => [
        ...current,
        { id: "nca-" + Date.now() + "-assistant", role: "assistant", content: answer },
      ]);
    } catch (error) {
      const message =
        error instanceof Error && error.message === "SETUP_REQUIRED"
          ? "The chat interface is ready, but its secure AI connection still needs to be configured. Please check back soon."
          : error instanceof Error && error.message
            ? error.message
            : "Network connection failed. Please try again.";

      setConnectionMessage(message);
      setMessages((current) => [
        ...current,
        {
          id: "nca-" + Date.now() + "-error",
          role: "assistant",
          content: message,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(draft);
  };

  const clearConversation = () => {
    if (sending) return;
    setMessages([WELCOME_MESSAGE]);
    setConnectionMessage("");
    setDraft("");
  };

  return (
    <div className="nca-assistant-root">
      {open && (
        <section
          id="nca-chat-panel"
          className="nca-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="nca-chat-title"
        >
          <header className="nca-chat-header">
            <div className="nca-chat-brand-icon">
              <GraduationCap size={21} aria-hidden="true" />
            </div>
            <div className="nca-chat-header-copy">
              <h2 id="nca-chat-title">Ask Naa College AI</h2>
              <p><span className="nca-chat-online-dot" /> Website guide for students</p>
            </div>
            <div className="nca-chat-header-actions">
              <button
                type="button"
                className="nca-chat-icon-button"
                onClick={clearConversation}
                disabled={sending}
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                type="button"
                className="nca-chat-icon-button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </header>

          <div className="nca-chat-messages" aria-live="polite" aria-relevant="additions text">
            {messages.map((message) => (
              <div
                key={message.id}
                className={"nca-chat-message-row " + (message.role === "user" ? "is-user" : "is-assistant")}
              >
                {message.role === "assistant" && (
                  <div className="nca-chat-avatar" aria-hidden="true"><Bot size={15} /></div>
                )}
                <div className="nca-chat-bubble">
                  <div className="nca-chat-message-content">{renderMessage(message.content)}</div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="nca-chat-message-row is-assistant" role="status" aria-label="Naa College AI is answering">
                <div className="nca-chat-avatar" aria-hidden="true"><Bot size={15} /></div>
                <div className="nca-chat-bubble nca-chat-thinking">
                  <LoaderCircle size={15} className="nca-chat-spinner" />
                  <span>Thinking through your question…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && !sending && (
            <div className="nca-chat-suggestions" aria-label="Suggested questions">
              <p><Sparkles size={13} aria-hidden="true" /> Try asking</p>
              {QUICK_QUESTIONS.map((question) => (
                <button key={question} type="button" onClick={() => void sendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>
          )}

          {connectionMessage && connectionMessage.includes("configured") && (
            <div className="nca-chat-setup-note" role="status">
              The secure server key must be added before AI replies can work.
            </div>
          )}

          <form className="nca-chat-composer" onSubmit={handleSubmit}>
            <label className="nca-chat-sr-only" htmlFor="nca-chat-input">Ask a question about Naa College</label>
            <input
              ref={inputRef}
              id="nca-chat-input"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about tools, scholarships, EAPCET…"
              maxLength={1200}
              disabled={sending}
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              aria-label="Send message"
              title="Send"
            >
              {sending ? <LoaderCircle size={17} className="nca-chat-spinner" /> : <Send size={17} />}
            </button>
          </form>
          <div className="nca-chat-disclaimer">
            <Check size={12} aria-hidden="true" />
            <span>Verify admission and scholarship decisions with official sources. Don’t share passwords or private details.</span>
          </div>
        </section>
      )}

      <button
        type="button"
        className={"nca-chat-launcher " + (open ? "is-open" : "")}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close Naa College AI assistant" : "Open Naa College AI assistant"}
        aria-expanded={open}
        aria-controls="nca-chat-panel"
      >
        {open ? <X size={23} /> : <MessageCircle size={23} />}
        {!open && <span className="nca-chat-launcher-sparkle"><Sparkles size={12} /></span>}
        {!open && <span className="nca-chat-launcher-label">Ask Naa AI</span>}
      </button>
    </div>
  );
}
