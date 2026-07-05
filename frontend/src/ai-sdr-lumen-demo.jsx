
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const INITIAL_MESSAGE =
  "Hey! 👋 I'm Ava from Lumen Growth. What's your biggest growth challenge right now — scaling spend, lead volume, or something else?";

const CALENDLY_URL = "https://calendly.com/migueltechai/free-growth-consultation";

const FIELD_LABELS = {
  company: "Company",
  contact_name: "Contact",
  industry: "Industry",
  request_type: "Service interest",
  budget_range: "Monthly budget",
  decision_maker: "Decision maker",
  timeline: "Timeline",
  priority: "Priority",
  show_calendly: "Calendly CTA",
  confidence: "Data quality",
  email: "Email",
  phone: "Phone",
  website: "Website",
  preferred_contact_method: "Preferred contact",
  next_step: "Next step",
  summary: "Summary",
};

const FIELD_GROUPS = {
  core: ["company", "industry", "request_type", "budget_range", "timeline"],
  contact: ["contact_name", "email", "phone", "preferred_contact_method", "website"],
  crm: ["decision_maker", "priority", "confidence", "show_calendly", "next_step"],
};

const PRIORITY_CFG = {
  hot: {
    label: "Hot lead",
    sub: "High intent · ready for a call",
    color: "rgba(244, 63, 94, 0.18)",
    border: "rgba(244, 63, 94, 0.26)",
    text: "#fecdd3",
    icon: "🔥",
  },
  warm: {
    label: "Warm lead",
    sub: "Medium intent · nurture sequence",
    color: "rgba(245, 158, 11, 0.16)",
    border: "rgba(245, 158, 11, 0.24)",
    text: "#fde68a",
    icon: "🌡️",
  },
  cold: {
    label: "Cold lead",
    sub: "Lower intent · stay in touch",
    color: "rgba(59, 130, 246, 0.16)",
    border: "rgba(59, 130, 246, 0.24)",
    text: "#bfdbfe",
    icon: "❄️",
  },
};

const REQUEST_LABELS = {
  paid_social: "Paid Social (Meta / TikTok)",
  search_ads: "Search Ads (Google)",
  cro: "CRO",
  full_funnel: "Full Funnel",
  other: "Other",
};

const ACTIONS = (priority) => [
  { text: "Lead saved to Airtable", always: true },
  { text: "Conversation archived", always: true },
  { text: "Sales team notified on Slack", show: priority === "hot" },
  { text: "Calendly invitation displayed", show: priority === "hot" },
  { text: "Added to nurture sequence", show: priority !== "hot" },
];

function formatValue(key, val) {
  if (val === null || val === undefined || val === "") return "—";
  if (key === "request_type") return REQUEST_LABELS[val] || String(val);
  if (key === "confidence") return `${Math.round(Number(val) * 100)}%`;
  if (key === "show_calendly") return val ? "Yes" : "No";
  if (key === "decision_maker") return String(val).replace(/^./, (c) => c.toUpperCase());
  return String(val);
}

function normalizeLeadData(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  if (typeof raw !== "string") return null;

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function conversationToText(messages) {
  return messages
    .map((m) => `${m.role === "assistant" ? "Assistant" : "User"}:\n${m.content}`)
    .join("\n\n");
}

function getSummaryCards(lead, history) {
  const priority = lead?.priority && PRIORITY_CFG[lead.priority] ? lead.priority : "hot";
  return [
    { label: "Priority", value: (lead?.priority || "—").toUpperCase(), tone: priority },
    { label: "Confidence", value: lead?.confidence != null ? `${Math.round(Number(lead.confidence) * 100)}%` : "—", tone: priority },
    { label: "Messages", value: String(Array.isArray(history) ? history.length : 0), tone: priority },
    { label: "Calendly", value: lead?.show_calendly ? "On" : "Off", tone: priority },
  ];
}

function DotLoader() {
  return (
    <div className="aisdr-dots" style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} className="aisdr-dot" style={{ animationDelay: `${i * 140}ms` }} />
      ))}
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtitle, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.42)",
            marginBottom: 6,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{title}</div>
        {subtitle ? (
          <div style={{ marginTop: 5, fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.54)" }}>{subtitle}</div>
        ) : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}

function StatCard({ label, value, accent = "hot", compact = false }) {
  const cfg = PRIORITY_CFG[accent] || PRIORITY_CFG.hot;
  return (
    <div
      style={{
        borderRadius: compact ? 18 : 22,
        border: `1px solid ${cfg.border}`,
        background: `linear-gradient(135deg, ${cfg.color}, rgba(255,255,255,0.04))`,
        padding: compact ? "12px 13px" : "14px 14px 13px",
        minHeight: compact ? 76 : 88,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.46)",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 8, fontSize: compact ? 17 : 18, fontWeight: 800, color: "#fff" }}>{value}</div>
    </div>
  );
}

function FieldCard({ label, value, show = true, tone = "hot", compact = false }) {
  const cfg = PRIORITY_CFG[tone] || PRIORITY_CFG.hot;
  const display = formatValue(label, value);
  return (
    <div
      style={{
        borderRadius: compact ? 18 : 22,
        border: `1px solid rgba(255,255,255,0.08)`,
        background: `linear-gradient(135deg, ${cfg.color}, rgba(255,255,255,0.04))`,
        padding: compact ? "12px 14px" : 14,
        minHeight: compact ? 74 : 84,
        opacity: show ? 1 : 0.5,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.44)",
        }}
      >
        {FIELD_LABELS[label]}
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: compact ? 14 : 15,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#fff",
          wordBreak: "break-word",
        }}
      >
        {display}
      </div>
    </div>
  );
}

function ProgressItem({ title, subtitle, done = false, value = "—" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        padding: 14,
      }}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          marginTop: 1,
          background: done ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)",
          color: done ? "#86efac" : "rgba(255,255,255,0.4)",
          border: done ? "1px solid rgba(16,185,129,0.18)" : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {done ? "✓" : "•"}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{title}</div>
        <div style={{ marginTop: 3, fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)" }}>{subtitle}</div>
        {done ? <div style={{ marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>{value}</div> : null}
      </div>
    </div>
  );
}

export default function AISdrDemo() {
  const [chat, setChat] = useState([{ id: 0, role: "assistant", content: INITIAL_MESSAGE }]);
  const [history, setHistory] = useState([{ role: "assistant", content: INITIAL_MESSAGE }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [lead, setLead] = useState(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);
  const [visible, setVisible] = useState(new Set());
  const [copied, setCopied] = useState(false);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const transcript = useMemo(() => conversationToText(history), [history]);
  const summaryCards = useMemo(() => getSummaryCards(lead, history), [lead, history]);
  const priority = lead?.priority && PRIORITY_CFG[lead.priority] ? lead.priority : "hot";
  const pCfg = lead?.priority ? PRIORITY_CFG[lead.priority] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, typing]);

  useEffect(() => {
    if (!done || !lead) return;

    setVisible(new Set());
    const keys = Object.keys(lead).filter((k) => lead[k] !== null && lead[k] !== "");

    const timers = keys.map((key, idx) =>
      window.setTimeout(() => {
        setVisible((prev) => new Set([...prev, key]));
      }, 160 + idx * 70),
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [done, lead]);

  async function send() {
    if (!input.trim() || typing || done) return;

    const msg = input.trim();
    const nextHistory = [...history, { role: "user", content: msg }];

    setInput("");
    setErr(null);
    setCopied(false);
    setChat((prev) => [...prev, { id: Date.now(), role: "user", content: msg }]);
    setTyping(true);

    try {
      const res = await fetch("n8n-production-37c3.up.railway.app/webhook/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: nextHistory }),
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = await res.json();
      const text = typeof data?.message === "string" ? data.message : "";
      const normalizedLead = normalizeLeadData(data?.lead_data);

      if (normalizedLead) {
        const closeMessage =
          normalizedLead.priority === "hot"
            ? "✅ Perfect — you're all set! Our team will be in touch within a few hours. I've also sent you a link to book a strategy call directly."
            : "✅ Thanks for sharing all that! We'll send over some relevant resources and follow up when the timing is right.";

        setLead(normalizedLead);
        setDone(true);
        setChat((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: closeMessage }]);
        setHistory([
          ...nextHistory,
          {
            role: "assistant",
            content: closeMessage,
          },
        ]);
      } else {
        const reply = text || "Got it — could you share one more detail?";
        setChat((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: reply }]);
        setHistory([
          ...nextHistory,
          {
            role: "assistant",
            content: reply,
          },
        ]);
      }
    } catch {
      setErr("Connection error — please try again.");
    } finally {
      setTyping(false);
    }
  }

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(transcript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setErr("Could not copy conversation.");
    }
  }

  function reset() {
    setChat([{ id: 0, role: "assistant", content: INITIAL_MESSAGE }]);
    setHistory([{ role: "assistant", content: INITIAL_MESSAGE }]);
    setInput("");
    setTyping(false);
    setLead(null);
    setDone(false);
    setErr(null);
    setVisible(new Set());
    setCopied(false);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  const crmSteps = [
    {
      title: "Business context",
      subtitle: "Company, industry and what they need help with.",
      done: done && Boolean(lead?.company || lead?.industry || lead?.request_type),
      value:
        done && lead
          ? `${formatValue("company", lead.company)} · ${formatValue("industry", lead.industry)}`
          : "Waiting for context",
    },
    {
      title: "Buying fit",
      subtitle: "Budget, timeline and decision-maker status.",
      done: done && Boolean(lead?.budget_range || lead?.timeline || lead?.decision_maker),
      value:
        done && lead
          ? `${formatValue("budget_range", lead.budget_range)} · ${formatValue("timeline", lead.timeline)}`
          : "Waiting for fit details",
    },
    {
      title: "Contact method",
      subtitle: "Email, phone and the preferred follow-up channel.",
      done: done && Boolean(lead?.email || lead?.phone || lead?.preferred_contact_method),
      value:
        done && lead
          ? `${formatValue("preferred_contact_method", lead.preferred_contact_method)}`
          : "Waiting for contact details",
    },
  ];

  const mergedFields = [...FIELD_GROUPS.core, ...FIELD_GROUPS.contact, ...FIELD_GROUPS.crm];

  return (
    <div
      style={{
        minHeight: "100dvh",
        color: "#f5f7ff",
        background:
          "radial-gradient(circle at top left, rgba(124,58,237,0.22), transparent 34%), radial-gradient(circle at top right, rgba(16,185,129,0.12), transparent 30%), linear-gradient(180deg, #07070d 0%, #090914 45%, #06060a 100%)",
      }}
    >
      <style>{`
        .aisdr-shell {
          min-height: 100dvh;
          background-image:
            linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.024) 1px, transparent 1px);
          background-size: 72px 72px;
          background-position: center center;
        }

        .aisdr-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: rgba(255,255,255,0.55);
          display: inline-block;
          animation: aisdr-bounce 1.15s infinite ease-in-out;
        }

        .aisdr-pulse {
          animation: aisdr-pulse 1.7s infinite;
        }

        .aisdr-scroll::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .aisdr-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .aisdr-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        @keyframes aisdr-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.55; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        @keyframes aisdr-pulse {
          0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.45); }
          70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); }
          100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }

        @media (max-width: 1180px) {
          .aisdr-grid {
            grid-template-columns: 1fr !important;
          }
          .aisdr-left {
            border-right: none !important;
            border-bottom: 1px solid rgba(255,255,255,0.08) !important;
          }
        }

        @media (max-width: 820px) {
          .aisdr-topbar {
            flex-wrap: wrap;
          }
          .aisdr-chip-row {
            display: none;
          }
          .aisdr-message-shell {
            padding: 14px 14px 8px !important;
          }
          .aisdr-panel-pad {
            padding: 14px !important;
          }
        }
      `}</style>

      <div className="aisdr-shell">
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            backdropFilter: "blur(16px)",
          }}
        >
          <header
            className="aisdr-topbar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(8,8,15,0.55)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: 12,
                letterSpacing: "0.22em",
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(236,72,153,0.95))",
                boxShadow: "0 14px 40px rgba(124,58,237,0.25)",
              }}
            >
              LG
            </div>

            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Lumen Growth · AI SDR Agent</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.52)" }}>
                OpenAI Responses API + n8n + Airtable + Slack + Calendly · Portfolio demo
              </div>
            </div>

            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 999,
                padding: "8px 12px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="aisdr-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: done ? "#86efac" : "rgba(255,255,255,0.62)" }}>
                {done ? "Lead qualified" : "Live session"}
              </span>
            </div>
          </header>

          <main
            style={{
              flex: 1,
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.55fr) minmax(360px, 1fr)",
            }}
            className="aisdr-grid"
          >
            <section
              className="aisdr-left"
              style={{
                display: "flex",
                minHeight: 0,
                flexDirection: "column",
                borderRight: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "16px 18px",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 999,
                      display: "grid",
                      placeItems: "center",
                      color: "#fff",
                      fontWeight: 800,
                      border: "1px solid rgba(255,255,255,0.1)",
                      background: "linear-gradient(135deg, rgba(124,58,237,1), rgba(236,72,153,1))",
                      boxShadow: "0 16px 40px rgba(124,58,237,0.25)",
                    }}
                  >
                    <span style={{ fontSize: 18 }}>🤖</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Ava</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Online · Lumen Growth assistant</div>
                  </div>
                </div>

                <div
                  className="aisdr-chip-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: 12,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: "#34d399" }} />
                  Visitor conversation
                </div>
              </div>

              <div
                className="aisdr-scroll"
                style={{
                  minHeight: 0,
                  flex: 1,
                  overflowY: "auto",
                  padding: 18,
                }}
              >
                <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", flexDirection: "column", gap: 14 }}>
                  <div
                    className="aisdr-message-shell"
                    style={{
                      borderRadius: 28,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background:
                        "linear-gradient(135deg, rgba(124,58,237,0.16), rgba(255,255,255,0.04))",
                      padding: 18,
                      boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
                    }}
                  >
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {["AI qualification", "Airtable CRM", "Slack alerts", "Calendly CTA"].map((chip) => (
                        <span
                          key={chip}
                          style={{
                            padding: "7px 11px",
                            borderRadius: 999,
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(255,255,255,0.62)",
                            fontSize: 12,
                          }}
                        >
                          {chip}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 14,
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {summaryCards.map((item) => (
                        <StatCard key={item.label} label={item.label} value={item.value} accent={item.tone} compact />
                      ))}
                    </div>
                  </div>

                  {chat.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        display: "flex",
                        justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                        alignItems: "flex-end",
                        gap: 10,
                      }}
                    >
                      {m.role === "assistant" && (
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 999,
                            display: "grid",
                            placeItems: "center",
                            border: "1px solid rgba(255,255,255,0.08)",
                            background: "rgba(255,255,255,0.05)",
                            color: "rgba(255,255,255,0.9)",
                            flexShrink: 0,
                          }}
                        >
                          🤖
                        </div>
                      )}

                      <div
                        style={{
                          maxWidth: "82%",
                          padding: "13px 15px",
                          borderRadius: m.role === "user" ? "24px 24px 6px 24px" : "24px 24px 24px 6px",
                          background:
                            m.role === "user"
                              ? "linear-gradient(135deg, rgba(124,58,237,1), rgba(236,72,153,1))"
                              : "rgba(255,255,255,0.05)",
                          color: "#fff",
                          border:
                            m.role === "assistant"
                              ? "1px solid rgba(255,255,255,0.08)"
                              : "1px solid rgba(255,255,255,0.06)",
                          boxShadow:
                            m.role === "user"
                              ? "0 16px 40px rgba(124,58,237,0.25)"
                              : "0 14px 34px rgba(0,0,0,0.14)",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.55,
                          fontSize: 14,
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}

                  {typing && (
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          display: "grid",
                          placeItems: "center",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.05)",
                          color: "rgba(255,255,255,0.9)",
                          flexShrink: 0,
                        }}
                      >
                        🤖
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          borderRadius: "24px 24px 24px 6px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "rgba(255,255,255,0.05)",
                          padding: "14px 16px",
                        }}
                      >
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>Ava is typing</span>
                        <DotLoader />
                      </div>
                    </div>
                  )}

                  {done && lead?.show_calendly && (
                    <div
                      style={{
                        marginTop: 4,
                        borderRadius: 28,
                        border: "1px solid rgba(16,185,129,0.24)",
                        background:
                          "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(124,58,237,0.08), rgba(255,255,255,0.04))",
                        padding: 20,
                        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>✨</span>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>You're qualified!</div>
                      </div>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.66)", fontSize: 14, lineHeight: 1.6 }}>
                        Based on your answers, we'd love to learn more about your business. Book a free 30-minute strategy session with one of our specialists.
                      </p>
                      <button
                        onClick={() => window.open(CALENDLY_URL, "_blank")}
                        style={{
                          marginTop: 16,
                          width: "100%",
                          border: "none",
                          borderRadius: 18,
                          padding: "13px 16px",
                          background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: 14,
                          cursor: "pointer",
                          boxShadow: "0 16px 40px rgba(124,58,237,0.24)",
                        }}
                      >
                        📅 Schedule free strategy call
                      </button>
                    </div>
                  )}

                  {done && lead?.priority === "warm" && (
                    <div
                      style={{
                        marginTop: 4,
                        borderRadius: 28,
                        border: "1px solid rgba(245,158,11,0.24)",
                        background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(255,255,255,0.04))",
                        padding: 20,
                        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>🌡️</span>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Thanks for reaching out!</div>
                      </div>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.66)", fontSize: 14, lineHeight: 1.6 }}>
                        Our team will review your information and contact you if we believe we're a good fit. In the meantime we'll send you some helpful marketing resources.
                      </p>
                    </div>
                  )}

                  {done && lead?.priority === "cold" && (
                    <div
                      style={{
                        marginTop: 4,
                        borderRadius: 28,
                        border: "1px solid rgba(59,130,246,0.24)",
                        background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(255,255,255,0.04))",
                        padding: 20,
                        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>❄️</span>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Thanks for your interest!</div>
                      </div>
                      <p style={{ margin: 0, color: "rgba(255,255,255,0.66)", fontSize: 14, lineHeight: 1.6 }}>
                        We'll send you useful content and stay in touch. If your needs change, we'd love to help you in the future.
                      </p>
                    </div>
                  )}

                  {err && (
                    <div
                      style={{
                        borderRadius: 18,
                        border: "1px solid rgba(248,113,113,0.22)",
                        background: "rgba(239,68,68,0.1)",
                        color: "#fecaca",
                        padding: "12px 14px",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {err}
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(8,8,15,0.55)",
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", gap: 10, maxWidth: 980, margin: "0 auto" }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      disabled={typing || done}
                      placeholder={done ? "Conversation complete" : "Type a message…"}
                      style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 18,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        padding: "0 48px 0 16px",
                        outline: "none",
                        fontSize: 14,
                        boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: "50%",
                        right: 15,
                        transform: "translateY(-50%)",
                        color: "rgba(255,255,255,0.28)",
                        fontSize: 18,
                      }}
                    >
                      💬
                    </span>
                  </div>
                  <button
                    onClick={send}
                    disabled={typing || done || !input.trim()}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 18,
                      border: "none",
                      cursor: "pointer",
                      background:
                        typing || done || !input.trim()
                          ? "rgba(124,58,237,0.35)"
                          : "linear-gradient(135deg, #7c3aed, #ec4899)",
                      color: "#fff",
                      boxShadow: "0 16px 40px rgba(124,58,237,0.22)",
                    }}
                  >
                    ➤
                  </button>
                </div>

                {done && (
                  <button
                    onClick={reset}
                    style={{
                      width: "100%",
                      marginTop: 10,
                      border: "none",
                      background: "transparent",
                      color: "rgba(255,255,255,0.48)",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ↺ Reset demo
                  </button>
                )}
              </div>
            </section>

            <aside
              style={{
                display: "flex",
                minHeight: 0,
                flexDirection: "column",
                background: "rgba(6,6,12,0.62)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  padding: "16px 18px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    📡
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.42)",
                      }}
                    >
                      Conversation summary
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                      Human-first qualification · CRM-ready payload
                    </div>
                  </div>
                </div>

                {done && (
                  <button
                    onClick={copyTranscript}
                    style={{
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.7)",
                      padding: "8px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                    title="Copy transcript"
                  >
                    {copied ? "Copied" : "Copy transcript"}
                  </button>
                )}
              </div>

              <div
                className="aisdr-scroll aisdr-panel-pad"
                style={{
                  minHeight: 0,
                  flex: 1,
                  overflowY: "auto",
                  padding: 18,
                }}
              >
                {!done ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div
                      style={{
                        borderRadius: 28,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        padding: 18,
                        boxShadow: "0 16px 44px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                        <span style={{ color: "#c4b5fd" }}>✨</span>
                        What Ava is collecting
                      </div>
                      <p style={{ marginTop: 10, color: "rgba(255,255,255,0.54)", fontSize: 13, lineHeight: 1.6 }}>
                        The chat stays focused on the visitor. The structured CRM packet below is kept for handoff and later dashboard use.
                      </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                      {summaryCards.map((item) => (
                        <StatCard key={item.label} label={item.label} value={item.value} accent={item.tone} compact />
                      ))}
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      {crmSteps.map((step) => (
                        <ProgressItem
                          key={step.title}
                          title={step.title}
                          subtitle={step.subtitle}
                          done={step.done}
                          value={step.value}
                        />
                      ))}
                    </div>

                    <div
                      style={{
                        borderRadius: 28,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background: "rgba(255,255,255,0.04)",
                        padding: 18,
                        boxShadow: "0 16px 44px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, color: "#fff" }}>
                        🛡️ CRM handoff packet
                      </div>
                      <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                        {ACTIONS(lead?.priority)
                          .filter((a) => a.always || a.show)
                          .map((a, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                borderRadius: 22,
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: "rgba(255,255,255,0.04)",
                                padding: 14,
                              }}
                            >
                              <span
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 999,
                                  display: "grid",
                                  placeItems: "center",
                                  background: "rgba(16,185,129,0.12)",
                                  color: "#86efac",
                                  flexShrink: 0,
                                  marginTop: 1,
                                }}
                              >
                                ✓
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>{a.text}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                      {summaryCards.map((item) => (
                        <StatCard key={item.label} label={item.label} value={item.value} accent={item.tone} compact />
                      ))}
                    </div>

                    {pCfg && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          borderRadius: 24,
                          border: `1px solid ${pCfg.border}`,
                          background: `linear-gradient(135deg, ${pCfg.color}, rgba(255,255,255,0.05))`,
                          padding: 18,
                          boxShadow: "0 16px 40px rgba(0,0,0,0.18)",
                        }}
                      >
                        <div
                          style={{
                            width: 52,
                            height: 52,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 18,
                            border: `1px solid ${pCfg.border}`,
                            background: pCfg.color,
                            fontSize: 22,
                          }}
                        >
                          {pCfg.icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 800,
                              letterSpacing: "0.18em",
                              textTransform: "uppercase",
                              color: pCfg.text,
                            }}
                          >
                            {pCfg.label}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 13, color: "rgba(255,255,255,0.62)" }}>{pCfg.sub}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                        Captured CRM fields
                      </div>

                      <div style={{ display: "grid", gap: 10 }}>
                        {mergedFields.map((key) => {
                          const value = lead?.[key];
                          const show = visible.has(key) || done;
                          return (
                            <div
                              key={key}
                              style={{
                                borderRadius: 22,
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: "rgba(255,255,255,0.04)",
                                padding: 14,
                                transition: "all 220ms ease",
                                opacity: show ? 1 : 0.9,
                              }}
                            >
                              <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                                {FIELD_LABELS[key]}
                              </div>
                              <div style={{ marginTop: 7, fontSize: 13, color: "#fff", lineHeight: 1.6, wordBreak: "break-word" }}>
                                {formatValue(key, value)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                        Handoff timeline
                      </div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {ACTIONS(priority)
                          .filter((a) => a.always || a.show)
                          .map((a, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 12,
                                borderRadius: 22,
                                border: "1px solid rgba(255,255,255,0.08)",
                                background: "rgba(255,255,255,0.04)",
                                padding: 14,
                              }}
                            >
                              <span
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 999,
                                  display: "grid",
                                  placeItems: "center",
                                  background: "rgba(16,185,129,0.12)",
                                  color: "#86efac",
                                  flexShrink: 0,
                                  marginTop: 1,
                                }}
                              >
                                ✓
                              </span>
                              <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, lineHeight: 1.5 }}>{a.text}</span>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div
                      style={{
                        borderRadius: 28,
                        border: "1px solid rgba(255,255,255,0.08)",
                        background:
                          "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08), rgba(255,255,255,0.04))",
                        padding: 18,
                        boxShadow: "0 16px 44px rgba(0,0,0,0.15)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700 }}>
                        ⏱️ Transcript for the dashboard
                      </div>
                      <p style={{ marginTop: 8, color: "rgba(255,255,255,0.54)", fontSize: 12, lineHeight: 1.6 }}>
                        This copy-ready transcript can be shown in a future dashboard, used in notes, or attached to the CRM record.
                      </p>
                      <pre
                        style={{
                          margin: "12px 0 0",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          color: "rgba(255,255,255,0.68)",
                          fontSize: 12,
                          lineHeight: 1.7,
                          fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
                        }}
                      >
                        {transcript}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
}
