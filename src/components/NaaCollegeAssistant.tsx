import React, { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  Bot,
  Check,
  GraduationCap,
  LoaderCircle,
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
    "Hi! I’m NaaCox AI from Naa College. I can help you understand our website, find tools, explore scholarships and roadmaps, and answer questions about Naa College. Ask in English or Telugu-English.",
};

const QUICK_QUESTIONS = [
  "Who founded Naa College?",
  "Find scholarships",
  "Where can I find AP allotments?",
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


function localNaaCoxFallback(question: string, pagePath: string): string {
  const q = question.toLowerCase();
  const teluguEnglish = /\b(ela|enti|enduku|cheppu|cheppandi|undha|undi|bro|naaku|nenu|meeru|kavali|ekkada|eppudu|ante|ivvu|ivvandi)\b/i.test(q);
  const prefix = teluguEnglish ? "Bro, simple ga cheptha:\n" : "";
  const link = (label: string, path: string) => "[" + label + "](" + path + ")";
  if (/\b(hi|hello|hey|hai|namaste|namaskaram|how are you)\b/i.test(q)) {
    return "Hi! I’m NaaCox AI from Naa College 😊 Ask me about AP/TG EAPCET, scholarships, college choices, study plans, programming, DSA, projects, internships, or website tools. You can type in English or Telugu-English.";
  }
  if (/\b(who are you|your name|founder|who founded|who created naa college)\b/i.test(q)) {
    return "I’m NaaCox AI, the student assistant for Naa College. Naa College was founded by Jagan Mohan Rao Dunna. I’m a software assistant, not a human.";
  }
  if (/scholarship|stipend|fee reimbursement|fee waiver|financial aid/.test(q)) {
    return "Explore " + link("Naa College Scholarships", "/scholarships/") + " for listed schemes and provider links. Always verify current eligibility, deadlines, required documents and application status on the official provider portal. If you share your state, course/year and scheme name, I can help you identify what to check.";
  }
  if (/ap eapcet|andhra pradesh|ap allotment|ap counselling|ap counseling/.test(q)) {
    return "Open the “For AP” menu to find AP EAPCET allotment and college exploration tools. Historical ranks are guides, not guaranteed seats; verify current dates, fees and seat matrix on the official counselling portal.";
  }
  if (/tg eapcet|ts eamcet|telangana|tg allotment/.test(q)) {
    return "Open the “For TG” menu to find Telangana EAPCET allotment and college discovery tools. Check the official counselling portal for current dates, fees, seat matrix and eligibility.";
  }
  if (/attendance|bunk/.test(q)) {
    return "Use the Attendance Calculator on Naa College. Enter classes held and attended, then confirm the required percentage with your college. Share those two numbers and your target percentage if you want me to calculate an estimate.";
  }
  if (/cgpa|sgpa|gpa|grade point/.test(q)) {
    return "I can help with CGPA/SGPA calculations. Share your subject credits and grade points, plus your university's formula if known. Don’t include your student ID or other private details.";
  }
  if (/programming|coding|python|javascript|java|c language|html|css|react|error|debug/.test(q)) {
    return "I can help explain programming concepts and debug common issues. Send the language, what you expected, the exact error/output and a small relevant code snippet. Remove API keys, passwords and private data before sharing.";
  }
  if (/dsa|data structures|algorithm|leetcode|competitive programming/.test(q)) {
    return "Begin DSA with arrays and strings, searching/sorting, recursion, linked lists, stacks/queues, hashing, trees/graphs and then dynamic programming. For each topic, understand it, implement it yourself and solve small problems before moving on.";
  }
  if (/internship|placement|resume|portfolio|github|career|roadmap|web development|machine learning|ai ml/.test(q)) {
    return "A practical path is to choose one track, learn fundamentals, build 2–3 complete projects, document them on GitHub, create a portfolio and apply to relevant internships. Explore " + link("engineering roadmaps", "/engineering-roadmaps/") + " and the " + link("AI Student Gap Analyzer", "/ai-gap-analyzer") + ". Tell me your year and preferred track for a focused plan.";
  }
  if (/college|branch|cse|ece|rank|cutoff|seat|engineering/.test(q)) {
    return "Compare colleges using total fees, curriculum, commute/hostel costs, verified placement reports, internship opportunities and your interest in the branch. Use Naa College’s “For AP” or “For TG” tools for available historical data, and verify current counselling details officially. Share your state, rank range, preferred branches and budget range for a useful shortlist.";
  }
  if (/study plan|timetable|exam|study tips|first year/.test(q)) {
    return "Start with short focused blocks: revise today’s class, practise questions without looking at solutions, note doubts and review older topics weekly. Tell me the subject, exam date and daily available time, and I can make a realistic schedule.";
  }
  if (/naa college|website|what can you do|features|help me/.test(q)) {
    return "Naa College brings together AP/TG allotment exploration, scholarships, attendance and CGPA tools, student blogs, roadmaps and learning resources. Start with " + link("Scholarships", "/scholarships/") + ", " + link("Blogs", "/blog/") + ", " + link("Engineering roadmaps", "/engineering-roadmaps/") + ", or " + link("AI Student Gap Analyzer", "/ai-gap-analyzer") + ".";
  }
  return prefix + "I can help with Naa College tools, AP/TG EAPCET, scholarships, college choices, study planning, programming, DSA, projects, internships and general learning questions. " +
    (pagePath && pagePath !== "/" ? "You’re currently on " + pagePath + ". " : "") +
    "Tell me the goal and a little context, and I’ll try a more targeted answer. For current admission or scholarship decisions, always verify official notices.";
}

export function NaaCollegeAssistant({ embedded = false }: { embedded?: boolean } = {}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [connectionMessage, setConnectionMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedded) {
      const container = messagesContainerRef.current;
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      return;
    }
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
      return () => window.clearTimeout(timer);
    }
  }, [open, embedded, messages, sending]);

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
    const conversationBase = embedded ? messages.filter((item) => item.id !== WELCOME_MESSAGE.id) : messages;
    const nextMessages = [...conversationBase, userMessage];
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
      // Keep the chat useful even if the remote endpoint is temporarily unreachable.
      // This local knowledge fallback does not require an API key or network access.
      const fallbackAnswer = localNaaCoxFallback(cleaned, window.location.pathname);
      setConnectionMessage("");
      setMessages((current) => [
        ...current,
        {
          id: "nca-" + Date.now() + "-assistant-fallback",
          role: "assistant",
          content: fallbackAnswer,
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
    <div className={"nca-assistant-root" + (embedded ? " nca-assistant-root-embedded" : "")}>
      {(open || embedded) && (
        <section
          id={embedded ? "nca-chat-panel-embedded" : "nca-chat-panel"}
          className={"nca-chat-panel" + (embedded ? " nca-chat-panel-embedded" : "")}
          role={embedded ? "region" : "dialog"}
          aria-modal={embedded ? undefined : false}
          aria-labelledby={embedded ? "nca-chat-title-embedded" : "nca-chat-title"}
        >
          <header className="nca-chat-header">
            <div className="nca-chat-brand-icon">
              <GraduationCap size={21} aria-hidden="true" />
            </div>
            <div className="nca-chat-header-copy">
              <h2 id={embedded ? "nca-chat-title-embedded" : "nca-chat-title"}>NaaCox AI</h2>
              <p><span className="nca-chat-online-dot" /> Your Naa College student assistant</p>
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
              {!embedded && (
                <button
                  type="button"
                  className="nca-chat-icon-button"
                  onClick={() => setOpen(false)}
                  aria-label="Close assistant"
                  title="Close"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </header>

          <div ref={messagesContainerRef} className="nca-chat-messages" aria-live="polite" aria-relevant="additions text">
            {messages.filter((message) => !embedded || message.id !== WELCOME_MESSAGE.id).map((message) => (
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
              <div className="nca-chat-message-row is-assistant" role="status" aria-label="NaaCox AI is answering">
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

          <form className="nca-chat-composer" onSubmit={handleSubmit}>
            <label className="nca-chat-sr-only" htmlFor={embedded ? "nca-chat-input-embedded" : "nca-chat-input"}>Ask a question about Naa College</label>
            <input
              ref={inputRef}
              id={embedded ? "nca-chat-input-embedded" : "nca-chat-input"}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask NaaCox AI about Naa College…"
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
          <p className="nca-chat-footer-note">NaaCox AI <em>may make mistakes, because humans do too.</em></p>
        </section>
      )}

      {!embedded && <button
        type="button"
        className={"nca-chat-launcher " + (open ? "is-open" : "")}
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close NaaCox AI assistant" : "Open NaaCox AI assistant"}
        aria-expanded={open}
        aria-controls="nca-chat-panel"
      >
        {open ? (
          <X size={23} />
        ) : (
          <img
            src="/robot-head-3d-icon-png-download-13156297.png"
            alt=""
            width={48}
            height={48}
            className="nca-chat-launcher-robot"
            draggable={false}
          />
        )}
      </button>}
    </div>
  );
}
