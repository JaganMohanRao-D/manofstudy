/**
 * Naa College website-aware AI assistant.
 * The Gemini API key is kept in Firebase Secret Manager and never sent to the browser.
 */
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");

const geminiApiKey = defineSecret("GEMINI_API_KEY");
const MODEL = "gemini-3.8-flash";
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 1200;
const rateWindows = new Map();

const ALLOWED_ORIGINS = new Set([
  "https://naacollege.in",
  "https://www.naacollege.in",
  "http://localhost:3000",
  "http://localhost:4173",
]);

const SITE_KNOWLEDGE = [
  "Naa College is a student-tools and education-guidance website for students, especially in Andhra Pradesh and Telangana.",
  "The website includes AP EAPCET college prediction and published allotment exploration, Telangana EAPCET prediction and allotment exploration, scholarship directory, engineering roadmaps, student blogs/guides, AI Student Gap Analyzer, attendance and CGPA/SGPA calculators, mock tests, PDF/image utilities, and an autonomous-colleges directory.",
  "Known canonical pages: Home / ; Scholarship directory /scholarships/ ; Blog /blog/ ; AI Student Gap Analyzer /ai-gap-analyzer ; Engineering roadmaps /engineering-roadmaps/ ; Autonomous colleges directory /autonomous-colleges/.",
  "Students can use the site navigation menus to locate AP and TG counselling/allotment tools, college tools, mock tests and utility tools. Do not invent routes if the exact route is not in the known canonical page list.",
  "The scholarship directory has search, filters, deadline/status information and individual detail pages. Scholarship eligibility, amounts, deadline dates, counselling rules, seat availability and cutoffs may change. Always tell users to confirm consequential details with the official provider/counselling authority. Do not invent a live status or claim that this assistant checked an official portal.",
  "The AI Student Gap Analyzer provides a skills/readiness report and recommended improvement areas. Engineering roadmaps help organise topics and projects. The attendance and CGPA/SGPA tools are calculators; results depend on the values and rules a student enters.",
].join("\n");

const SYSTEM_PROMPT = [
  "You are Naa College AI, a helpful website guide for students using naacollege.in.",
  "Prioritise questions about Naa College features, how to use the site's tools, finding a relevant page, and understanding the purpose of those tools.",
  "Use the website knowledge below and the visitor's current page context. Do not claim access to private accounts, live databases, records, or the visitor's screen beyond the stated page context.",
  "Never invent scholarship deadlines, amounts, eligibility, official rules, admission predictions, ranks, cutoffs, or seat availability. If the answer requires live or official information you do not have, say so plainly and guide the student to the relevant site page and official source.",
  "When a known page is helpful, include a Markdown link using exactly one of the known internal paths in the knowledge list. Do not invent an internal URL. External official URLs should only be provided when you know them confidently; otherwise ask the visitor to use the official-source link shown on the relevant page.",
  "Reply in the language/style used by the visitor: English, Telugu, or Telugu written in English letters. Keep answers concise, practical and student-friendly. Explain navigation step by step when needed.",
  "Do not request passwords, authentication codes, payment details, or other sensitive personal information. Do not ask users to share private student records.",
  "If asked something unrelated to the website, provide a brief useful answer where appropriate, then explain that your main role is helping them use Naa College.",
  "Website knowledge:\n" + SITE_KNOWLEDGE,
].join("\n\n");

function originIsAllowed(origin) {
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" &&
      url.hostname === "localhost" &&
      /^\d+$/.test(url.port);
  } catch (_) {
    return false;
  }
}

function setCors(req, res) {
  const origin = String(req.headers.origin || "");
  if (originIsAllowed(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Max-Age", "600");
  }
  res.set("X-Content-Type-Options", "nosniff");
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateWindows.get(ip);
  if (!entry || now - entry.startedAt >= WINDOW_MS) {
    rateWindows.set(ip, { startedAt: now, count: 1 });
    if (rateWindows.size > 1500) {
      for (const [key, value] of rateWindows.entries()) {
        if (now - value.startedAt >= WINDOW_MS) rateWindows.delete(key);
      }
    }
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function normaliseMessages(input) {
  if (!Array.isArray(input)) return [];
  const messages = input
    .slice(-MAX_MESSAGES)
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = message.role === "assistant" || message.role === "model" ? "model" :
        message.role === "user" ? "user" : null;
      const text = typeof message.content === "string" ? message.content.trim().slice(0, MAX_MESSAGE_CHARS) : "";
      return role && text ? { role, parts: [{ text }] } : null;
    })
    .filter(Boolean);
  // Gemini chat contents should start with a user turn; discard the local welcome message.
  const firstUser = messages.findIndex((message) => message.role === "user");
  return firstUser >= 0 ? messages.slice(firstUser) : [];
}

exports.websiteAssistantChat = onRequest(
  {
    region: "asia-southeast1",
    timeoutSeconds: 35,
    memory: "256MiB",
    secrets: [geminiApiKey],
  },
  async (req, res) => {
    setCors(req, res);
    const origin = String(req.headers.origin || "");

    if (req.method === "OPTIONS") {
      if (origin && !originIsAllowed(origin)) return res.status(403).json({ error: "Origin not allowed." });
      return res.status(204).send("");
    }
    if (origin && !originIsAllowed(origin)) {
      return res.status(403).json({ error: "Origin not allowed." });
    }
    if (req.method !== "POST") {
      res.set("Allow", "POST, OPTIONS");
      return res.status(405).json({ error: "Method not allowed." });
    }

    const rawBody = req.body && typeof req.body === "object" ? req.body : {};
    const messages = normaliseMessages(rawBody.messages);
    if (!messages.length || messages[messages.length - 1].role !== "user") {
      return res.status(400).json({ error: "Send a valid message to continue." });
    }
    if (messages[messages.length - 1].parts[0].text.length > MAX_MESSAGE_CHARS) {
      return res.status(413).json({ error: "That message is too long. Please shorten it." });
    }

    const forwardedFor = String(req.headers["x-forwarded-for"] || "");
    const clientIp = forwardedFor.split(",")[0].trim() || req.ip || "unknown";
    if (!checkRateLimit(clientIp)) {
      res.set("Retry-After", "60");
      return res.status(429).json({ error: "You're sending messages too quickly. Please wait a minute and try again." });
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      return res.status(503).json({
        code: "SETUP_REQUIRED",
        error: "The secure AI key has not been configured for this deployment yet.",
      });
    }

    const pagePath = typeof rawBody.pagePath === "string" && rawBody.pagePath.startsWith("/")
      ? rawBody.pagePath.slice(0, 120)
      : "/";
    const pageTitle = typeof rawBody.pageTitle === "string"
      ? rawBody.pageTitle.replace(/[<>]/g, "").slice(0, 120)
      : "Naa College";

    const systemInstruction = SYSTEM_PROMPT +
      "\n\nVisitor page context:\n- Current path: " + pagePath +
      "\n- Current document title: " + pageTitle;

    try {
      const providerResponse = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + MODEL + ":generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: messages,
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 700,
            },
          }),
          signal: AbortSignal.timeout(27000),
        }
      );

      if (!providerResponse.ok) {
        console.error("[NaaCollegeAssistant] Gemini request failed with status:", providerResponse.status);
        if (providerResponse.status === 429) {
          return res.status(503).json({ error: "The assistant is busy right now. Please try again shortly." });
        }
        return res.status(502).json({ error: "The assistant could not answer just now. Please try again." });
      }

      const data = await providerResponse.json();
      const answer = (data.candidates || [])
        .flatMap((candidate) => (candidate.content && candidate.content.parts) || [])
        .map((part) => typeof part.text === "string" ? part.text.trim() : "")
        .filter(Boolean)
        .join("\n")
        .slice(0, 6500);

      if (!answer) {
        return res.status(502).json({ error: "No answer was returned. Please try asking in a different way." });
      }

      return res.status(200).json({ answer });
    } catch (error) {
      console.error("[NaaCollegeAssistant] Request failed:", error && error.name ? error.name : "Unknown error");
      return res.status(504).json({ error: "The assistant is taking too long to respond. Please try again." });
    }
  }
);
