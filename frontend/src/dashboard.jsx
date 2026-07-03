import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "./api";

const NAV_ITEMS = [
  { label: "Overview", icon: "◉", active: true },
  { label: "Leads", icon: "◌" },
  { label: "Conversations", icon: "💬" },
  { label: "Analytics", icon: "▣" },
  { label: "Automations", icon: "⚡" },
  { label: "Settings", icon: "⚙" },
];

const THEME = {
  bg: "#07070d",
  panel: "rgba(255,255,255,0.04)",
  panel2: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  text: "#f5f7ff",
  muted: "rgba(255,255,255,0.58)",
  dim: "rgba(255,255,255,0.34)",
  hot: "#fb7185",
  warm: "#f59e0b",
  cold: "#60a5fa",
  accent: "#7c3aed",
  success: "#34d399",
};

const PRIORITY_META = {
  hot: {
    label: "Hot lead",
    tone: "hot",
    accent: "rgba(251,113,133,0.18)",
    accent2: "rgba(251,113,133,0.28)",
    text: "#fecdd3",
  },
  warm: {
    label: "Warm lead",
    tone: "warm",
    accent: "rgba(245,158,11,0.16)",
    accent2: "rgba(245,158,11,0.26)",
    text: "#fde68a",
  },
  cold: {
    label: "Cold lead",
    tone: "cold",
    accent: "rgba(96,165,250,0.16)",
    accent2: "rgba(96,165,250,0.26)",
    text: "#dbeafe",
  },
};

const AUTOMATIONS = [
  {
    label: "OpenAI qualification",
    description: "Agent classifies and summarizes every lead.",
    status: "Live",
    color: "#34d399",
  },
  {
    label: "Airtable lead sync",
    description: "Leads + conversations stored in CRM tables.",
    status: "Live",
    color: "#a78bfa",
  },
  {
    label: "Slack alert",
    description: "Hot leads are pushed to the sales channel.",
    status: "Live",
    color: "#f87171",
  },
  {
    label: "Calendly CTA",
    description: "High-intent leads see a booking call action.",
    status: "Live",
    color: "#60a5fa",
  },
];

function Dot({ color = THEME.accent }) {
  return (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: color,
        display: "inline-block",
        boxShadow: `0 0 0 4px ${color}22`,
        flexShrink: 0,
      }}
    />
  );
}

function StatusPill({ children, tone = "hot" }) {
  const meta = PRIORITY_META[tone] || PRIORITY_META.cold;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 12px",
        borderRadius: 999,
        border: `1px solid ${meta.accent2}`,
        background: meta.accent,
        color: THEME.text,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.01em",
        textTransform: "capitalize",
      }}
    >
      <Dot color={tone === "hot" ? THEME.hot : tone === "warm" ? THEME.warm : THEME.cold} />
      {children}
    </span>
  );
}

function SectionTitle({ eyebrow, title, action }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "end",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 14,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: THEME.dim,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ marginTop: 4, fontSize: 18, fontWeight: 800, color: THEME.text }}>{title}</div>
      </div>
      {action ? <div style={{ fontSize: 12, color: THEME.muted }}>{action}</div> : null}
    </div>
  );
}

function StatCard({ label, value, delta, tone = "hot" }) {
  const meta = PRIORITY_META[tone] || PRIORITY_META.cold;

  return (
    <div
      style={{
        borderRadius: 24,
        border: `1px solid ${THEME.border}`,
        background: `linear-gradient(135deg, ${meta.accent}, rgba(255,255,255,0.035))`,
        padding: 18,
        boxShadow: "0 18px 48px rgba(0,0,0,0.16)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: THEME.dim,
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 30, lineHeight: 1, fontWeight: 900, color: THEME.text }}>{value}</div>
      <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted }}>{delta}</div>
    </div>
  );
}

function InfoCard({ label, value, tone = "hot" }) {
  const meta = PRIORITY_META[tone] || PRIORITY_META.cold;

  return (
    <div
      style={{
        borderRadius: 20,
        padding: 16,
        border: `1px solid ${THEME.border}`,
        background: "rgba(255,255,255,0.04)",
      }}
    >
      <div
        style={{
          fontSize: 11,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: THEME.dim,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Dot color={tone === "hot" ? THEME.hot : tone === "warm" ? THEME.warm : THEME.cold} />
        <span
          style={{
            fontWeight: 800,
            fontSize: 16,
            color: meta.text,
            overflowWrap: "anywhere",
          }}
        >
          {value || "—"}
        </span>
      </div>
    </div>
  );
}

function ProgressBar({ value, tone = "hot" }) {
  const color = tone === "hot" ? THEME.hot : tone === "warm" ? THEME.warm : THEME.cold;

  return (
    <div
      style={{
        width: "100%",
        height: 8,
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${Math.max(6, Math.min(100, value))}%`,
          height: "100%",
          borderRadius: 999,
          background: `linear-gradient(90deg, ${color}, ${THEME.accent})`,
        }}
      />
    </div>
  );
}

function SectionCard({ children, style }) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: `1px solid ${THEME.border}`,
        background: THEME.panel,
        padding: 18,
        boxShadow: "0 18px 50px rgba(0,0,0,0.16)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function toTitleCase(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizePriority(value) {
  const v = String(value || "").toLowerCase();
  if (v === "hot" || v === "warm" || v === "cold") return v;
  return "cold";
}

function normalizeLead(item) {
  const fields = item?.fields || {};

  const company = fields.Company || fields.company || "";
  const contact = fields.Contact_Name || fields.contact_name || "";
  const industry = fields.Industry || fields.industry || "";
  const requestType = fields.Request_Type || fields.request_type || "other";
  const budget = fields.Budget_Range || fields.budget_range || "";
  const decisionMaker = fields["Decision Maker"] || fields.decision_maker || "";
  const timeline = fields.Timeline || fields.timeline || "";
  const priority = normalizePriority(fields.Priority || fields.priority);
  const confidenceRaw = Number(fields.Confidence ?? fields.confidence ?? 0);
  const confidence = Number.isFinite(confidenceRaw) ? confidenceRaw : 0;
  const nextStep = fields.Next_Step || fields.next_step || "";
  const summary = fields.Summary || fields.summary || "";
  const email = fields.Email || fields.email || "";
  const phone = fields.Phone || fields.phone || "";
  const preferredContact = fields.Preferred_Contact_Method || fields.preferred_contact_method || "";
  const website = fields.Website || fields.website || "";
  const showCalendly = Boolean(fields.show_calendly || fields.Show_Calendly);
  const score = Math.round((confidence || (priority === "hot" ? 0.95 : priority === "warm" ? 0.74 : 0.42)) * 100);

  return {
    id: item?.id || `${company}-${contact}`,
    createdTime: item?.createdTime || fields["Created at"] || "",
    company,
    contact,
    industry,
    requestType,
    budget,
    decisionMaker,
    timeline,
    priority,
    confidence,
    nextStep,
    summary,
    email,
    phone,
    preferredContact,
    website,
    showCalendly,
    score,
    raw: item,
  };
}

function normalizeConversation(item) {
  const fields = item?.fields || {};
  const leads = Array.isArray(fields.Leads) ? fields.Leads : Array.isArray(fields.Lead) ? fields.Lead : [];
  const createdAt = fields["Created at"] || item?.createdTime || "";
  const conversation = fields.Conversation || fields.conversation || "";
  const messages = Number(fields.Messages || fields.messages || 0);
  const name = fields.Name || fields.name || "";

  return {
    id: item?.id || `${name}-${createdAt}`,
    createdTime: item?.createdTime || createdAt,
    conversation,
    messages,
    leads,
    name,
    raw: item,
  };
}

function dedupeById(items) {
  const map = new Map();
  for (const item of items || []) {
    const id = item?.id;
    if (!id) continue;
    map.set(id, item);
  }
  return Array.from(map.values());
}

function buildConversationTranscript(conversation) {
  if (!conversation?.conversation) return "";
  return conversation.conversation;
}

function formatDate(dateString) {
  if (!dateString) return "—";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function countByDay(items) {
  const days = [];
  const today = new Date();
  const map = new Map();

  for (const item of items) {
    const dt = new Date(item.createdTime || item.createdAt || item.createdTime);
    if (Number.isNaN(dt.getTime())) continue;
    const key = dt.toISOString().slice(0, 10);
    map.set(key, (map.get(key) || 0) + 1);
  }

  for (let i = 7; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({
      label: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(d).slice(0, 1),
      count: map.get(key) || 0,
    });
  }

  return days;
}

function composeLeadSummary(lead) {
  if (!lead) return "";
  const parts = [
    lead.company ? `${lead.company}` : null,
    lead.industry ? `in ${lead.industry}` : null,
    lead.budget ? `budget ${lead.budget}` : null,
    lead.priority ? `${lead.priority} intent` : null,
    lead.timeline ? `${lead.timeline} timeline` : null,
    lead.decisionMaker ? `decision maker: ${lead.decisionMaker}` : null,
    lead.preferredContact ? `prefers ${lead.preferredContact}` : null,
  ].filter(Boolean);
  return parts.join(" · ");
}

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getDashboard();
        if (!alive) return;
        setDashboard(data || null);
      } catch (err) {
        if (!alive) return;
        setError(err?.message || "Failed to load dashboard.");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    return () => {
      alive = false;
    };
  }, []);

  const leads = useMemo(() => {
    const normalized = (dashboard?.leads || []).map(normalizeLead);
    return dedupeById(normalized)
      .filter((lead) => lead.company || lead.contact || lead.summary || lead.phone || lead.email)
      .sort((a, b) => {
        const priorityRank = { hot: 0, warm: 1, cold: 2 };
        const rankDiff = (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
        if (rankDiff !== 0) return rankDiff;
        return new Date(b.createdTime || 0) - new Date(a.createdTime || 0);
      });
  }, [dashboard]);

  const conversations = useMemo(() => {
    const normalized = (dashboard?.conversations || []).map(normalizeConversation);
    return dedupeById(normalized).sort((a, b) => new Date(b.createdTime || 0) - new Date(a.createdTime || 0));
  }, [dashboard]);

  useEffect(() => {
    if (!selectedLeadId && leads.length) {
      setSelectedLeadId(leads[0].id);
      return;
    }

    if (selectedLeadId && !leads.some((lead) => lead.id === selectedLeadId) && leads.length) {
      setSelectedLeadId(leads[0].id);
    }
  }, [leads, selectedLeadId]);

  const selectedLead = leads.find((lead) => lead.id === selectedLeadId) || leads[0] || null;

  const leadConversations = useMemo(() => {
    if (!selectedLead) return [];
    const selectedLeadName = selectedLead.company.toLowerCase();
    return conversations.filter((conv) => {
      const linked = (conv.leads || []).includes(selectedLead.id);
      const byName = conv.name ? conv.name.toLowerCase().includes(selectedLeadName) : false;
      return linked || byName;
    });
  }, [conversations, selectedLead]);

  const overview = useMemo(() => {
    const totalLeads = dashboard?.overview?.totalLeads ?? leads.length;
    const hotLeads = dashboard?.overview?.hotLeads ?? leads.filter((lead) => lead.priority === "hot").length;
    const warmLeads = dashboard?.overview?.warmLeads ?? leads.filter((lead) => lead.priority === "warm").length;
    const coldLeads = dashboard?.overview?.coldLeads ?? leads.filter((lead) => lead.priority === "cold").length;
    const avgConfidence =
      leads.length > 0
        ? Math.round((leads.reduce((sum, lead) => sum + (lead.confidence || 0), 0) / leads.length) * 100)
        : 0;
    const hotRate = totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0;

    return { totalLeads, hotLeads, warmLeads, coldLeads, avgConfidence, hotRate };
  }, [dashboard, leads]);

  const chartBars = useMemo(() => {
    const counts = countByDay(leads);
    const max = Math.max(1, ...counts.map((item) => item.count));
    return counts.map((item) => ({
      ...item,
      height: Math.max(12, Math.round((item.count / max) * 100)),
    }));
  }, [leads]);

  const automationItems = useMemo(() => {
    return AUTOMATIONS.map((item) => ({
      ...item,
      description:
        item.label === "OpenAI qualification"
          ? `Qualifies ${overview.totalLeads} captured leads.`
          : item.label === "Airtable lead sync"
          ? `${leads.length} structured leads stored in CRM.`
          : item.label === "Slack alert"
          ? `${overview.hotLeads} hot leads flagged for sales.`
          : `${selectedLead?.priority === "hot" ? "Hot leads" : "High-intent leads"} see the booking CTA.`,
    }));
  }, [leads.length, overview.hotLeads, overview.totalLeads, selectedLead?.priority]);

  const selectedConversationText = useMemo(() => {
    if (leadConversations.length) return buildConversationTranscript(leadConversations[0]);
    return selectedLead?.summary || "";
  }, [leadConversations, selectedLead]);

  async function copyTranscript() {
    if (!selectedLead) return;
    const text = [
      `Company: ${selectedLead.company}`,
      `Contact: ${selectedLead.contact}`,
      `Priority: ${selectedLead.priority}`,
      `Budget: ${selectedLead.budget}`,
      `Timeline: ${selectedLead.timeline}`,
      "",
      selectedConversationText || selectedLead.summary || "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: THEME.bg,
        color: THEME.text,
      }}
    >
      <div
        style={{
          minHeight: "100dvh",
          backgroundImage:
            "radial-gradient(circle at top left, rgba(124,58,237,0.18), transparent 35%), radial-gradient(circle at top right, rgba(16,185,129,0.1), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent)",
        }}
      >
        <div style={{ display: "flex", minHeight: "100dvh", flexDirection: "column" }}>
          <header
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "16px 18px",
              borderBottom: `1px solid ${THEME.border}`,
              background: "rgba(8,8,15,0.6)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
            }}
          >
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 12, color: "inherit", textDecoration: "none" }}>
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
                  letterSpacing: "0.2em",
                  border: `1px solid ${THEME.border}`,
                  background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(236,72,153,0.95))",
                  boxShadow: "0 14px 40px rgba(124,58,237,0.26)",
                }}
              >
                LG
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Lumen Growth · AI SDR Dashboard</div>
                <div style={{ fontSize: 12, color: THEME.muted }}>CRM analytics, conversations, automations and lead qualification</div>
              </div>
            </a>

            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
              <StatusPill tone="hot">Mission control</StatusPill>
              <a href="/" style={{ fontSize: 12, color: THEME.muted, textDecoration: "none" }}>
                Back to demo
              </a>
            </div>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "260px minmax(0, 1fr)", minHeight: 0, flex: 1 }}>
            <aside
              style={{
                borderRight: `1px solid ${THEME.border}`,
                background: "rgba(255,255,255,0.03)",
                padding: 18,
                minHeight: 0,
              }}
            >
              <div
                style={{
                  borderRadius: 26,
                  border: `1px solid ${THEME.border}`,
                  background: THEME.panel,
                  padding: 16,
                  boxShadow: "0 16px 44px rgba(0,0,0,0.18)",
                }}
              >
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: THEME.dim }}>Workspace</div>
                <div style={{ marginTop: 8, fontSize: 18, fontWeight: 900 }}>AI SDR CRM</div>
                <div style={{ marginTop: 6, fontSize: 12, color: THEME.muted }}>Connected to n8n + Airtable</div>

                <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
                  {NAV_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        borderRadius: 16,
                        padding: "12px 12px",
                        border: item.active ? "1px solid rgba(124,58,237,0.24)" : "1px solid transparent",
                        background: item.active ? "linear-gradient(135deg, rgba(124,58,237,0.16), rgba(255,255,255,0.04))" : "transparent",
                        color: item.active ? THEME.text : THEME.muted,
                        fontSize: 13,
                        fontWeight: item.active ? 800 : 600,
                      }}
                    >
                      <span style={{ width: 22, textAlign: "center", opacity: 0.9 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18, padding: 14, borderRadius: 20, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: THEME.dim }}>Connected</div>
                  <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                    {automationItems.map((a) => (
                      <div key={a.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                        <span style={{ color: THEME.text }}>{a.label}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: a.color, fontWeight: 700 }}>
                          <Dot color={a.color} /> {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <main style={{ minWidth: 0, minHeight: 0, overflow: "auto" }} className="aisdr-scrollbar">
              <div style={{ padding: 18, display: "grid", gap: 18 }}>
                {loading ? (
                  <SectionCard style={{ minHeight: 320 }}>
                    <SectionTitle eyebrow="Loading" title="Fetching dashboard data..." action="Connecting to webhook" />
                    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                      {Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          style={{
                            borderRadius: 24,
                            border: `1px solid ${THEME.border}`,
                            background: "rgba(255,255,255,0.03)",
                            minHeight: 120,
                          }}
                        />
                      ))}
                    </div>
                  </SectionCard>
                ) : error ? (
                  <SectionCard>
                    <SectionTitle eyebrow="Error" title="Dashboard could not load" action="Check the webhook URL" />
                    <div
                      style={{
                        borderRadius: 20,
                        border: "1px solid rgba(251,113,133,0.2)",
                        background: "rgba(251,113,133,0.1)",
                        padding: 16,
                        color: "#fecdd3",
                        fontSize: 13,
                        lineHeight: 1.7,
                      }}
                    >
                      {error}
                    </div>
                  </SectionCard>
                ) : (
                  <>
                    <SectionCard
                      style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(255,255,255,0.04))",
                      }}
                    >
                      <SectionTitle eyebrow="Overview" title="Live AI SDR performance" action={`Updated from Airtable + n8n · ${overview.totalLeads} leads`} />

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                        <StatCard
                          label="Total Leads"
                          value={overview.totalLeads}
                          delta={`${conversations.length} conversations in CRM`}
                          tone="hot"
                        />
                        <StatCard
                          label="Hot Leads"
                          value={overview.hotLeads}
                          delta={`${overview.hotRate}% of pipeline`}
                          tone="hot"
                        />
                        <StatCard
                          label="Warm Leads"
                          value={overview.warmLeads}
                          delta="Mid-intent leads in nurture"
                          tone="warm"
                        />
                        <StatCard
                          label="Cold Leads"
                          value={overview.coldLeads}
                          delta="Needs more qualification"
                          tone="cold"
                        />
                      </div>
                    </SectionCard>

                    <section style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(320px, 0.8fr)", gap: 18, minHeight: 0 }} className="aisdr-main-grid">
                      <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
                        <SectionCard>
                          <SectionTitle eyebrow="Pipeline" title="Lead distribution" action="Hot / Warm / Cold" />
                          <div style={{ display: "grid", gap: 14 }}>
                            {[
                              { stage: "Hot", count: overview.hotLeads, tone: "hot" },
                              { stage: "Warm", count: overview.warmLeads, tone: "warm" },
                              { stage: "Cold", count: overview.coldLeads, tone: "cold" },
                            ].map((stage) => (
                              <div key={stage.stage} style={{ display: "grid", gridTemplateColumns: "110px 1fr 50px", gap: 14, alignItems: "center" }}>
                                <div style={{ fontSize: 13, fontWeight: 800, color: THEME.text }}>{stage.stage}</div>
                                <ProgressBar value={overview.totalLeads ? (stage.count / overview.totalLeads) * 100 : 0} tone={stage.tone} />
                                <div style={{ textAlign: "right", fontSize: 13, color: THEME.muted, fontWeight: 700 }}>{stage.count}</div>
                              </div>
                            ))}
                          </div>
                        </SectionCard>

                        <SectionCard>
                          <SectionTitle eyebrow="Leads" title="Recent qualified leads" action="Click a row to preview details" />
                          <div style={{ overflow: "hidden", borderRadius: 24, border: `1px solid ${THEME.border}` }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                              <thead>
                                <tr style={{ background: "rgba(255,255,255,0.03)" }}>
                                  {["Company", "Contact", "Industry", "Budget", "Priority", "Score"].map((h) => (
                                    <th key={h} style={{ textAlign: "left", padding: "14px 14px", fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: THEME.dim, fontWeight: 700 }}>
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {leads.slice(0, 8).map((row) => {
                                  const active = selectedLead?.id === row.id;
                                  const tone = row.priority.toLowerCase();
                                  return (
                                    <tr
                                      key={row.id}
                                      onClick={() => setSelectedLeadId(row.id)}
                                      style={{
                                        cursor: "pointer",
                                        background: active ? "rgba(124,58,237,0.08)" : "transparent",
                                        borderTop: `1px solid ${THEME.border}`,
                                      }}
                                    >
                                      <td style={{ padding: "14px", fontWeight: 800, color: THEME.text }}>{row.company || "—"}</td>
                                      <td style={{ padding: "14px", color: THEME.muted }}>{row.contact || "—"}</td>
                                      <td style={{ padding: "14px", color: THEME.muted }}>{row.industry || "—"}</td>
                                      <td style={{ padding: "14px", color: THEME.muted }}>{row.budget || "—"}</td>
                                      <td style={{ padding: "14px" }}>
                                        <StatusPill tone={tone}>{row.priority}</StatusPill>
                                      </td>
                                      <td style={{ padding: "14px", color: THEME.text, fontWeight: 800 }}>{row.score}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </SectionCard>
                      </div>

                      <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
                        <SectionCard>
                          <SectionTitle eyebrow="Selected Lead" title={selectedLead?.company || "No lead selected"} action={selectedLead ? `${selectedLead.priority} · ${selectedLead.timeline}` : "Waiting for live data"} />
                          {selectedLead ? (
                            <div style={{ display: "grid", gap: 12 }}>
                              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                                <InfoCard label="Priority" value={selectedLead.priority} tone={selectedLead.priority} />
                                <InfoCard label="Budget" value={selectedLead.budget} tone={selectedLead.priority} />
                                <InfoCard label="Contact" value={selectedLead.contact} tone={selectedLead.priority} />
                                <InfoCard label="Industry" value={selectedLead.industry} tone={selectedLead.priority} />
                              </div>

                              <div style={{ borderRadius: 24, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.04)", padding: 16 }}>
                                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: THEME.dim }}>CRM data</div>
                                <div style={{ marginTop: 12, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                                  <InfoCard label="Decision Maker" value={selectedLead.decisionMaker || "—"} tone={selectedLead.priority} />
                                  <InfoCard label="Timeline" value={selectedLead.timeline || "—"} tone={selectedLead.priority} />
                                  <InfoCard label="Request Type" value={toTitleCase(selectedLead.requestType)} tone={selectedLead.priority} />
                                  <InfoCard label="Confidence" value={`${Math.round((selectedLead.confidence || selectedLead.score / 100) * 100)}%`} tone={selectedLead.priority} />
                                  <InfoCard label="Email" value={selectedLead.email || "—"} tone={selectedLead.priority} />
                                  <InfoCard label="Phone" value={selectedLead.phone || "—"} tone={selectedLead.priority} />
                                  <InfoCard label="Preferred Contact" value={selectedLead.preferredContact || "—"} tone={selectedLead.priority} />
                                  <InfoCard label="Website" value={selectedLead.website || "—"} tone={selectedLead.priority} />
                                </div>
                              </div>

                              <div style={{ borderRadius: 24, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.04)", padding: 16 }}>
                                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: THEME.dim }}>AI summary</div>
                                <p style={{ marginTop: 8, color: THEME.text, fontSize: 13, lineHeight: 1.7 }}>
                                  {selectedLead.summary || composeLeadSummary(selectedLead) || "No summary available yet."}
                                </p>
                              </div>

                              <div style={{ borderRadius: 24, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.04)", padding: 16 }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: THEME.dim }}>Conversation history</div>
                                  <button
                                    onClick={copyTranscript}
                                    style={{
                                      border: `1px solid ${THEME.border}`,
                                      background: "rgba(255,255,255,0.04)",
                                      color: THEME.text,
                                      borderRadius: 999,
                                      padding: "8px 12px",
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Copy transcript
                                  </button>
                                </div>

                                <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                                  {(leadConversations.length ? leadConversations : conversations.slice(0, 1)).map((conv) => (
                                    <div key={conv.id} style={{ borderRadius: 18, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.03)", padding: 12 }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                        <div style={{ fontWeight: 800, color: THEME.text }}>
                                          {conv.name || selectedLead.company}
                                        </div>
                                        <StatusPill tone={selectedLead.priority}>{selectedLead.priority}</StatusPill>
                                      </div>
                                      <div style={{ marginTop: 8, whiteSpace: "pre-wrap", fontSize: 12, color: THEME.muted, lineHeight: 1.7 }}>
                                        {conv.conversation || selectedLead.summary || "Conversation transcript not available."}
                                      </div>
                                      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: THEME.dim }}>
                                        <span>{formatDate(conv.createdTime)}</span>
                                        <span>{conv.messages || 0} messages</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ color: THEME.muted, fontSize: 13, lineHeight: 1.7 }}>No lead data available yet.</div>
                          )}
                        </SectionCard>

                        <SectionCard>
                          <SectionTitle eyebrow="Analytics" title="Qualification snapshot" action="Read-only preview" />
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                            <StatCard
                              label="Leads today"
                              value={chartBars.reduce((sum, day) => sum + day.count, 0)}
                              delta="Based on the last 8 days"
                              tone="hot"
                            />
                            <StatCard
                              label="Hot rate"
                              value={`${overview.hotRate}%`}
                              delta="High-intent share"
                              tone="hot"
                            />
                            <StatCard
                              label="Avg confidence"
                              value={`${overview.avgConfidence}%`}
                              delta="Across the current pipeline"
                              tone="warm"
                            />
                            <StatCard
                              label="Conversations"
                              value={conversations.length}
                              delta="Conversation records loaded"
                              tone="cold"
                            />
                          </div>

                          <div style={{ marginTop: 16, display: "grid", gap: 10, gridTemplateColumns: "repeat(8, minmax(0, 1fr))", alignItems: "end" }}>
                            {chartBars.map((bar, i) => (
                              <div key={i} style={{ display: "grid", gap: 8, justifyItems: "center" }}>
                                <div style={{ width: "100%", minHeight: 120, display: "flex", alignItems: "end" }}>
                                  <div
                                    style={{
                                      width: "100%",
                                      height: `${bar.height}%`,
                                      borderRadius: 14,
                                      background: "linear-gradient(180deg, rgba(124,58,237,0.9), rgba(236,72,153,0.55))",
                                      boxShadow: "0 10px 28px rgba(124,58,237,0.2)",
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize: 11, color: THEME.dim }}>{bar.label}</span>
                              </div>
                            ))}
                          </div>
                        </SectionCard>
                      </div>
                    </section>

                    <SectionCard>
                      <SectionTitle eyebrow="Automations" title="Operational timeline" action="OpenAI → Airtable → Slack → Calendly" />
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                        {automationItems.map((item) => (
                          <div key={item.label} style={{ borderRadius: 24, border: `1px solid ${THEME.border}`, background: "rgba(255,255,255,0.04)", padding: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                              <div style={{ fontWeight: 800, color: THEME.text }}>{item.label}</div>
                              <Dot color={item.color} />
                            </div>
                            <div style={{ marginTop: 10, fontSize: 12, color: THEME.muted, lineHeight: 1.7 }}>{item.description}</div>
                            <div style={{ marginTop: 12, fontSize: 12, color: item.color, fontWeight: 800 }}>{item.status}</div>
                          </div>
                        ))}
                      </div>
                    </SectionCard>
                  </>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
