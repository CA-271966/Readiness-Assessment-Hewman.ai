import { useState, useEffect, useRef } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";

const TOTAL_QUESTIONS = 37;

const TUMBLERS = [
  { id: 1, name: "Executive Sponsorship", short: "Exec Sponsorship" },
  { id: 2, name: "Leadership Alignment", short: "Leadership" },
  { id: 3, name: "Manager Readiness", short: "Managers" },
  { id: 4, name: "Culture & Psychological Safety", short: "Culture" },
  { id: 5, name: "Operational Mapping", short: "Operations" },
  { id: 6, name: "Governance & Key Partnerships", short: "Governance" },
];

const SECTION_INTROS = [
  "AI integration requires visible belief from the top. Not just budget approval or a delegated initiative, but a named executive who has publicly committed the organization's direction and is personally identified with it.",
  "Executive sponsorship sets direction. But the executive leadership team must be genuinely aligned, not just informed. A single skeptical or disengaged leader quietly slows everything downstream.",
  "Managers are the layer employees actually listen to. Before AI reaches the workforce, every manager needs to confidently answer three questions: What is this? Why are we doing it? What does it mean for my team?",
  "Culture determines whether everything above holds once it reaches the broader workforce. Employees who do not feel safe to ask questions, experiment, or push back will comply on the surface and disengage underneath.",
  "Before AI goes anywhere, the organization needs to know where it should go first. That means mapping workflows for readiness and resistance rather than acting on executive assumptions.",
  "Governance is not a final step. It runs alongside everything else. The question is whether the right partnerships, policies, and structures are in place to enable responsible AI use rather than just restrict it.",
];

const QUESTIONS = [
  // Section 1: Executive Sponsorship
  { id: "1.1", section: 0, text: "Our CEO or most senior executive has made a clear public statement about AI's role in our organization's future.", dim: "O" },
  { id: "1.2", section: 0, text: "Our executive sponsor can explain why AI integration matters for this specific organization, beyond general industry trends.", dim: "C" },
  { id: "1.3", section: 0, text: "Our executive sponsor has dedicated personal time and visibility to AI integration, beyond approving a budget or project plan.", dim: "O" },
  { id: "1.4", section: 0, text: "Employees across the organization would be able to name the executive who is sponsoring our AI direction.", dim: "O" },
  { id: "1.5", section: 0, text: "Our executive sponsor treats AI integration as a strategic priority rather than a technology project managed by IT.", dim: "M" },
  { id: "1.6", section: 0, text: "Our executive sponsor has shown willingness to adjust AI timelines based on organizational readiness rather than external pressure alone.", dim: "M" },
  // Section 2: Leadership Alignment
  { id: "2.1", section: 1, text: "Every member of our executive leadership team has expressed active support for our AI direction.", dim: "M" },
  { id: "2.2", section: 1, text: "Our leadership team has had substantive conversations about what AI integration means for their specific functional areas.", dim: "C" },
  { id: "2.3", section: 1, text: "Every member of our leadership team is actively reinforcing the AI direction, with no one passively sitting it out.", dim: "M" },
  { id: "2.4", section: 1, text: "Our leadership team has reached agreement on the pace and scope of AI integration, not just the general direction.", dim: "C" },
  { id: "2.5", section: 1, text: "Leaders across the organization are delivering a consistent message about AI to their teams.", dim: "O" },
  { id: "2.6", section: 1, text: "Our leadership team has discussed what AI integration means for talent and how people work, beyond efficiency gains and cost savings.", dim: "C" },
  // Section 3: Manager Readiness
  { id: "3.1", section: 2, text: "Our managers have received preparation specific enough that they can explain what AI integration means for our organization.", dim: "C" },
  { id: "3.2", section: 2, text: "Our managers can credibly explain to their teams why the organization is pursuing AI integration.", dim: "C" },
  { id: "3.3", section: 2, text: "Our managers feel confident in their ability to answer their team's questions and concerns about how AI will affect day-to-day work.", dim: "M" },
  { id: "3.4", section: 2, text: "Our managers have had dedicated time and space to process their own uncertainty about AI before being asked to lead their teams through it.", dim: "O" },
  { id: "3.5", section: 2, text: "Our managers see themselves as leaders of this change rather than people being asked to pass information along.", dim: "M" },
  { id: "3.6", section: 2, text: "Managers have access to peer support, resources, or a designated point of contact for questions they cannot answer on their own.", dim: "O" },
  // Section 4: Culture & Psychological Safety
  { id: "4.1", section: 3, text: "Employees in our organization ask questions about AI openly, without concern about appearing resistant or uninformed.", dim: "O" },
  { id: "4.2", section: 3, text: "We have gathered direct, data-informed input from employees about how they feel about AI, rather than relying on leadership assumptions.", dim: "C" },
  { id: "4.3", section: 3, text: "When employees have started using AI tools on their own, our organization has responded by finding ways to support and guide that interest.", dim: "M" },
  { id: "4.4", section: 3, text: "Leadership has directly engaged with employee fears about AI, including concerns about job relevance and role change, rather than relying on reassurance alone.", dim: "M" },
  { id: "4.5", section: 3, text: "Employees have visible evidence that the organization's stated commitment to responsible AI integration is genuine, not just messaging.", dim: "M" },
  { id: "4.6", section: 3, text: "Employees have been given real permission to experiment with AI tools and make mistakes without career risk, and specific examples of this exist.", dim: "O" },
  { id: "4.7", section: 3, text: "Our workforce has the bandwidth to absorb AI integration alongside other current initiatives, rather than being already saturated with change.", dim: "S" },
  // Section 5: Operational Mapping
  { id: "5.1", section: 4, text: "We have identified specific workflows or processes where AI could add the most value, based on actual work patterns rather than executive assumptions or vendor suggestions.", dim: "C" },
  { id: "5.2", section: 4, text: "We know where our early adopters and most AI-ready employees are located across the organization.", dim: "C" },
  { id: "5.3", section: 4, text: "Our approach to selecting where AI goes first considers both the nature of the work and the readiness of the people doing it.", dim: "C" },
  { id: "5.4", section: 4, text: "We have mapped where repetitive, low-judgment tasks create the most drag on employee time and energy.", dim: "C" },
  { id: "5.5", section: 4, text: "Employees in potential pilot areas have been included in conversations about where and how AI could help them.", dim: "O" },
  { id: "5.6", section: 4, text: "Our organization is committed to starting AI integration where readiness is highest, even if those areas are not the most strategically visible.", dim: "M" },
  // Section 6: Governance & Key Partnerships
  { id: "6.1", section: 5, text: "We have clear, documented policies for acceptable AI use that employees can find and understand.", dim: "O" },
  { id: "6.2", section: 5, text: "Our AI governance involves active partnership across HR, IT, Legal, and Compliance, rather than one department owning it alone.", dim: "O" },
  { id: "6.3", section: 5, text: "Our governance framework addresses ethical considerations specific to our industry and workforce, not just generic AI principles.", dim: "C" },
  { id: "6.4", section: 5, text: "We have a defined process for evaluating new AI tools or use cases before they are introduced to the workforce.", dim: "O" },
  { id: "6.5", section: 5, text: "Our governance approach is designed to enable responsible AI use rather than primarily to restrict or slow it down.", dim: "M" },
  { id: "6.6", section: 5, text: "We have identified the external regulatory requirements that affect how we integrate AI and have a plan to meet them.", dim: "C" },
];

const CASCADE_FLAGS = [
  { threshold: 0, message: "Your executive sponsorship is not yet in place. This is the foundation everything else depends on. Scores in leadership alignment, manager readiness, and culture may appear adequate, but without visible executive commitment, gains in those areas tend to be fragile and difficult to sustain. Start here." },
  { threshold: 1, message: "Your executive sponsor is in place, but the leadership team has not yet fully aligned. Until all members of the leadership team are actively reinforcing the same direction, the message will fragment as it reaches managers and the broader workforce. Alignment is not agreement in a meeting. It is consistent reinforcement afterward." },
  { threshold: 2, message: "Your executives and leadership are aligned, but managers are not yet ready to carry this change to their teams. This is the most common and most consequential gap in AI integration. Employees take their cues from their direct leader, not from executive messaging. Investing in manager readiness before broader rollout will determine whether adoption sticks." },
];

const DIM_LABELS = { C: "Capability", O: "Opportunity", M: "Motivation", S: "Change Saturation" };

const DIAGNOSTIC_NARRATIVES = {
  0: {
    C: "Your executive sponsor is engaged but may not yet have the depth of understanding needed to sponsor AI integration credibly. The risk is that sponsorship stays at the level of general enthusiasm rather than informed commitment. Consider targeted executive education that connects AI to your specific business challenges.",
    O: "Your executive sponsor may have the right intent, but the organization has not seen it yet. Sponsorship needs to be visible and felt, not just approved. Town halls, direct statements, and personal involvement in key moments signal commitment in ways that budget memos cannot.",
    M: "Your executive engagement with AI may be more delegated than personal. When the top leader treats AI as someone else's project to manage rather than a strategic shift they are personally driving, the rest of the organization calibrates its own urgency accordingly.",
  },
  1: {
    C: "Your leadership team may be supportive in principle but has not yet worked through what AI integration means for their specific areas. General enthusiasm without area-specific understanding produces inconsistent messaging to the teams below.",
    O: "Your leaders may individually understand the direction, but the organization has not created the forums or processes for genuine alignment. Alignment is not a one-time meeting. It requires ongoing conversation, shared language, and visible consistency.",
    M: "There may be members of your leadership team who are not fully committed to the direction, even if they have not openly opposed it. Passive resistance at this level is difficult to see from above and devastating to momentum below. Identifying and directly addressing leadership skepticism is essential before cascading further.",
  },
  2: {
    C: "Your managers may not yet have the information they need to answer their teams' questions. This is the most straightforward gap to close: targeted preparation that equips managers with clear answers to the three questions their teams will ask first. What is this? Why are we doing it? What does it mean for us?",
    O: "Your managers may have the knowledge but lack the support systems to feel equipped. Without peer networks, escalation paths for hard questions, or dedicated time to prepare, even well-informed managers will default to caution and ambiguity when their teams push back.",
    M: "Your managers may have been briefed, but they do not yet feel confident leading their teams through this change. Knowledge without confidence produces hesitation, and employees read hesitation immediately. Managers need opportunities to practice, ask their own hard questions in a safe setting, and build belief that they can do this.",
  },
  3: {
    C: "Your organization may not have a clear, data-informed picture of how the workforce actually feels about AI. Leadership assumptions about employee sentiment are frequently wrong, in both directions. Anonymous, third-party surveying is the fastest way to replace assumption with reality.",
    O: "The conditions for psychological safety around AI may not be in place. Employees may not feel they have real permission to ask questions, push back, experiment, or surface concerns without risk. Creating these conditions requires more than saying the door is open. It requires visible evidence that honesty is rewarded, not punished.",
    M: "There is likely unaddressed fear or anxiety about AI in your workforce that is suppressing willingness to engage. This is not a training problem. When people are afraid, particularly about their relevance or their livelihood, even excellent resources and clear communication will not gain traction until the fear is acknowledged and directly addressed. Organizations that treat unofficial AI use as a demand signal rather than a violation are better positioned to channel existing energy productively.",
    S: "Your workforce may be near or at change saturation. When teams are already absorbing multiple major initiatives, such as system migrations, reorganizations, or new processes, adding AI integration without first addressing bandwidth produces surface compliance rather than genuine adoption. This is not a resistance problem. It is a capacity problem. Assessing current change load before accelerating AI integration protects both the quality of adoption and the wellbeing of the people asked to deliver it.",
  },
  4: {
    C: "Your organization has not yet done the detailed work of mapping where AI fits into actual workflows. Without this, pilot selection becomes an executive guessing game rather than a data-informed decision. The goal is to identify where process readiness and people readiness overlap.",
    O: "The people who do the work have not yet been included in conversations about where AI could help. Selecting pilot areas without input from the employees in those areas produces solutions that look logical from above but encounter resistance on the ground.",
    M: "Your organization may struggle to commit to starting where readiness is highest rather than where strategy or visibility pulls. When pilot selection is driven by executive preference or vendor pressure rather than readiness data, early wins become harder to produce and the credibility of the integration effort suffers.",
  },
  5: {
    C: "Governance may exist but may not be specific enough to your industry, your regulatory environment, or your workforce. Generic AI principles do not prepare an organization for the specific ethical and compliance questions it will face.",
    O: "The governance infrastructure, including clear policies, cross-functional partnerships, and evaluation processes, is not yet in place. Without it, AI adoption will outrun the organization's ability to manage it responsibly.",
    M: "Your governance approach may be perceived as primarily restrictive. When governance only says no, employees route around it. The most effective governance frameworks are designed to enable responsible use, creating clear pathways for experimentation within boundaries.",
  },
};

const LIKERT_OPTIONS = [
  { value: 1, label: "Strongly Disagree", short: "Strongly\nDisagree" },
  { value: 2, label: "Disagree", short: "Disagree" },
  { value: 3, label: "Neutral/Unsure", short: "Neutral /\nUnsure" },
  { value: 4, label: "Agree", short: "Agree" },
  { value: 5, label: "Strongly Agree", short: "Strongly\nAgree" },
];

const COLORS = {
  bg: "#FAFAF8",
  card: "#FFFFFF",
  primary: "#1B4D3E",
  primaryLight: "#2A7A5F",
  accent: "#D4A574",
  accentLight: "#E8CDB0",
  text: "#1A1A1A",
  textMuted: "#6B6B6B",
  border: "#E5E2DC",
  radarFill: "rgba(27, 77, 62, 0.25)",
  radarStroke: "#1B4D3E",
  warning: "#C4652A",
  warningBg: "#FDF3ED",
  warningDeep: "#8B2E21",
  success: "#1B4D3E",
  successBg: "#F0F7F4",
};

// 5-tier scoring aligned with framework thresholds
function getTierLabel(score) {
  if (score >= 4.0) return "Strong";
  if (score >= 3.5) return "Functional with specific gaps";
  if (score >= 3.0) return "Meaningful gaps";
  if (score >= 2.0) return "Significantly blocked";
  return "Not yet addressed";
}

function getTierColor(score) {
  if (score >= 4.0) return COLORS.primary;
  if (score >= 3.5) return COLORS.primaryLight;
  if (score >= 3.0) return COLORS.accent;
  if (score >= 2.0) return COLORS.warning;
  return COLORS.warningDeep;
}

export default function AIReadinessAssessment() {
  const [phase, setPhase] = useState("intro"); // intro, assessment, results, email
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scores, setScores] = useState(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);
  const topRef = useRef(null);

  const sectionQuestions = QUESTIONS.filter((q) => q.section === currentSection);
  const totalAnswered = Object.keys(answers).length;
  const sectionAnswered = sectionQuestions.filter((q) => answers[q.id] !== undefined).length;
  const sectionComplete = sectionAnswered === sectionQuestions.length;

  useEffect(() => {
    setFadeIn(false);
    const t = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(t);
  }, [phase, currentSection]);

  useEffect(() => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, currentSection]);

  function calculateScores() {
    const tumblerScores = TUMBLERS.map((t, idx) => {
      const qs = QUESTIONS.filter((q) => q.section === idx);
      const vals = qs.map((q) => answers[q.id] || 0);
      const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
      const dims = {};
      qs.forEach((q) => {
        if (!dims[q.dim]) dims[q.dim] = [];
        dims[q.dim].push(answers[q.id] || 0);
      });
      const dimAvgs = {};
      Object.keys(dims).forEach((d) => {
        dimAvgs[d] = dims[d].reduce((a, b) => a + b, 0) / dims[d].length;
      });
      const weakestDim = Object.entries(dimAvgs).sort((a, b) => a[1] - b[1])[0];
      return { ...t, score: Math.round(avg * 10) / 10, dimAvgs, weakestDim: weakestDim[0], weakestDimScore: weakestDim[1] };
    });
    const cascadeFlags = [];
    for (let i = 0; i < 3; i++) {
      if (tumblerScores[i].score < 3.0) {
        cascadeFlags.push(CASCADE_FLAGS[i]);
        break;
      }
    }
    const above35 = tumblerScores.filter((t) => t.score >= 3.5).length;
    let overallTier;
    if (above35 >= 6) overallTier = 0;
    else if (above35 >= 4) overallTier = 1;
    else if (above35 >= 2) overallTier = 2;
    else overallTier = 3;
    const overallMessages = [
      "Your organization has meaningful readiness conditions in place across all six areas. This does not mean integration will be effortless, but it means the human infrastructure exists to support it. Your next step is integration strategy: prioritizing use cases, building communication plans, and moving into workforce partnership.",
      "Your organization has strong readiness in most areas but has specific gaps that will create friction if not addressed before scaling AI integration. The areas flagged above are your priority. Addressing them now is significantly less costly than managing the downstream consequences of proceeding without them.",
      "Your organization has meaningful readiness work ahead. This is not a negative finding. It means you are asking the right question at the right time. Most organizations that struggle with AI integration do so because they skipped the human readiness work entirely. You are identifying your gaps before they become failures.",
      "Your organization is in the early stages of AI integration readiness on the human side. This is a common finding, and it is far better to know this now than to discover it after a failed rollout. The cascade structure matters here: start with executive sponsorship and work down.",
    ];
    return { tumblerScores, cascadeFlags, overallTier, overallMessage: overallMessages[overallTier] };
  }

  function handleFinish() {
    const s = calculateScores();
    setScores(s);
    setPhase("results");
  }

  function handleAnswer(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function handleEmailSubmit() {
    const scoresSummary = scores.tumblerScores.map(t => `${t.name}: ${t.score}/5.0`).join("\n");
    const overallLabel = ["Strong Readiness", "Moderate Readiness with Gaps", "Significant Readiness Work Needed", "Early Stage Readiness"][scores.overallTier];
    fetch("https://formspree.io/f/mwvwpqeo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        organization: org,
        email,
        overall_assessment: overallLabel,
        scores: scoresSummary,
        cascade_flags: scores.cascadeFlags.length > 0 ? scores.cascadeFlags[0].message : "None",
        weakest_areas: scores.tumblerScores.filter(t => t.score < 3.5).map(t => `${t.name} (${t.score})`).join(", ") || "None",
      }),
    }).then(() => setEmailSent(true)).catch(() => setEmailSent(true));
  }

  // === STYLES ===
  const styles = {
    wrapper: { fontFamily: "'Libre Franklin', 'Georgia', serif", background: COLORS.bg, minHeight: "100vh", color: COLORS.text, lineHeight: 1.65 },
    container: { maxWidth: 720, margin: "0 auto", padding: "40px 24px" },
    fadeIn: { opacity: fadeIn ? 1 : 0, transition: "opacity 0.35s ease" },
    logo: { fontSize: 13, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: COLORS.primary, marginBottom: 4 },
    h1: { fontSize: 28, fontWeight: 300, color: COLORS.primary, margin: "0 0 8px", lineHeight: 1.3 },
    h2: { fontSize: 22, fontWeight: 400, color: COLORS.primary, margin: "0 0 6px", lineHeight: 1.3 },
    h3: { fontSize: 17, fontWeight: 600, color: COLORS.primary, margin: "0 0 8px" },
    subtitle: { fontSize: 15, color: COLORS.textMuted, margin: "0 0 32px", fontStyle: "italic" },
    bodyText: { fontSize: 15, color: COLORS.text, margin: "0 0 20px" },
    mutedText: { fontSize: 14, color: COLORS.textMuted, margin: "0 0 16px" },
    card: { background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "28px 28px", marginBottom: 20 },
    btn: { background: COLORS.primary, color: "#fff", border: "none", borderRadius: 6, padding: "13px 32px", fontSize: 15, fontWeight: 500, cursor: "pointer", letterSpacing: "0.02em", transition: "background 0.2s" },
    btnDisabled: { background: "#B8C5BF", cursor: "not-allowed" },
    btnSecondary: { background: "transparent", color: COLORS.primary, border: `1.5px solid ${COLORS.primary}`, borderRadius: 6, padding: "11px 28px", fontSize: 14, fontWeight: 500, cursor: "pointer" },
    progress: { display: "flex", gap: 6, marginBottom: 28 },
    progressDot: (active, done) => ({ flex: 1, height: 4, borderRadius: 2, background: done ? COLORS.primary : active ? COLORS.accentLight : COLORS.border, transition: "background 0.3s" }),
    likertRow: { display: "flex", gap: 6, flexWrap: "nowrap", marginTop: 12, marginBottom: 4 },
    likertBtn: (selected) => ({ flex: "1 1 0", minWidth: 0, padding: "10px 6px", border: `1.5px solid ${selected ? COLORS.primary : COLORS.border}`, borderRadius: 6, background: selected ? COLORS.successBg : COLORS.card, color: selected ? COLORS.primary : COLORS.textMuted, cursor: "pointer", textAlign: "center", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }),
    likertNum: (selected) => ({ fontSize: 13, fontWeight: 700, color: selected ? COLORS.primary : COLORS.textMuted, opacity: selected ? 1 : 0.55 }),
    likertLabel: (selected) => ({ fontSize: 11, fontWeight: selected ? 600 : 400, lineHeight: 1.2, whiteSpace: "pre-line" }),
    neutralHint: { fontSize: 12, color: COLORS.textMuted, fontStyle: "italic", marginTop: 8, paddingLeft: 2 },
    questionBlock: { marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${COLORS.border}` },
    questionNum: { fontSize: 12, fontWeight: 600, color: COLORS.accent, letterSpacing: "0.08em", marginBottom: 6 },
    sectionIntro: { fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6, margin: "0 0 28px", fontStyle: "italic", borderLeft: `3px solid ${COLORS.accent}`, paddingLeft: 16 },
    flagBox: { background: COLORS.warningBg, border: `1px solid ${COLORS.warning}`, borderRadius: 8, padding: "20px 24px", marginBottom: 16 },
    flagLabel: { fontSize: 12, fontWeight: 700, color: COLORS.warning, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 },
    diagBox: { background: "#F7F6F3", border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "20px 24px", marginBottom: 12 },
    input: { width: "100%", padding: "11px 14px", border: `1.5px solid ${COLORS.border}`, borderRadius: 6, fontSize: 15, fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12, outline: "none" },
    scoreCircle: (score) => ({ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "50%", fontSize: 16, fontWeight: 700, color: "#fff", background: getTierColor(score) }),
    footer: { textAlign: "center", padding: "40px 0 20px", fontSize: 12, color: COLORS.textMuted },
  };

  // === INTRO ===
  if (phase === "intro") {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.fadeIn }} ref={topRef}>
          <div style={styles.logo}>Hewman.ai</div>
          <h1 style={styles.h1}>AI Integration Readiness Assessment</h1>
          <p style={styles.subtitle}>Measuring the human side of AI adoption</p>

          <div style={styles.card}>
            <p style={styles.bodyText}>
              This assessment measures your organization's readiness to integrate AI on the human side: leadership, culture, management, and governance. It does not measure technical readiness (data infrastructure, model selection, IT architecture). Both sides matter. This focuses on the one most organizations underinvest in.
            </p>
            <p style={styles.bodyText}>
              There are {TOTAL_QUESTIONS} questions across six areas. Answer based on what is actually true in your organization today, not what is planned or aspirational. Honest answers produce useful results. Aspirational answers produce comfortable ones.
            </p>
            <p style={{ ...styles.bodyText, fontSize: 14, background: "#F7F6F3", borderLeft: `3px solid ${COLORS.accent}`, padding: "14px 18px", margin: "0 0 20px", borderRadius: "0 6px 6px 0" }}>
              <strong>A note on the scale.</strong> Each question uses a 1 to 5 scale from Strongly Disagree to Strongly Agree. Choose <em>Neutral/Unsure</em> if you do not know the answer or if the situation is genuinely mixed across the organization. That response is a useful signal in itself.
            </p>
            <p style={styles.mutedText}>This should take 12 to 15 minutes.</p>
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              style={styles.btn}
              onClick={() => setPhase("assessment")}
              onMouseOver={(e) => (e.target.style.background = COLORS.primaryLight)}
              onMouseOut={(e) => (e.target.style.background = COLORS.primary)}
            >
              Begin Assessment
            </button>
          </div>

          <div style={styles.footer}>Built on the AI Integration Readiness Framework by Hewman.ai</div>
        </div>
      </div>
    );
  }

  // === ASSESSMENT ===
  if (phase === "assessment") {
    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.fadeIn }} ref={topRef}>
          <div style={styles.logo}>Section {currentSection + 1} of 6</div>
          <h2 style={styles.h2}>{TUMBLERS[currentSection].name}</h2>

          <div style={styles.progress}>
            {TUMBLERS.map((_, i) => (
              <div key={i} style={styles.progressDot(i === currentSection, i < currentSection)} />
            ))}
          </div>

          <p style={styles.sectionIntro}>{SECTION_INTROS[currentSection]}</p>

          <div style={styles.card}>
            {sectionQuestions.map((q) => {
              const selected = answers[q.id];
              return (
                <div key={q.id} style={styles.questionBlock}>
                  <div style={styles.questionNum}>QUESTION {q.id}</div>
                  <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.5, marginBottom: 4 }}>{q.text}</div>
                  <div style={styles.likertRow}>
                    {LIKERT_OPTIONS.map((opt) => {
                      const isSelected = selected === opt.value;
                      return (
                        <button
                          key={opt.value}
                          style={styles.likertBtn(isSelected)}
                          onClick={() => handleAnswer(q.id, opt.value)}
                        >
                          <span style={styles.likertNum(isSelected)}>{opt.value}</span>
                          <span style={styles.likertLabel(isSelected)}>{opt.short}</span>
                        </button>
                      );
                    })}
                  </div>
                  {selected === 3 && (
                    <div style={styles.neutralHint}>
                      Choose this if you don't know the answer or if it is genuinely mixed across the organization.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
            {currentSection > 0 && (
              <button
                style={styles.btnSecondary}
                onClick={() => setCurrentSection((s) => s - 1)}
              >
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {currentSection < 5 ? (
              <button
                style={{ ...styles.btn, ...(sectionComplete ? {} : styles.btnDisabled) }}
                disabled={!sectionComplete}
                onClick={() => setCurrentSection((s) => s + 1)}
                onMouseOver={(e) => sectionComplete && (e.target.style.background = COLORS.primaryLight)}
                onMouseOut={(e) => sectionComplete && (e.target.style.background = COLORS.primary)}
              >
                Next Section
              </button>
            ) : (
              <button
                style={{ ...styles.btn, ...(totalAnswered === TOTAL_QUESTIONS ? {} : styles.btnDisabled) }}
                disabled={totalAnswered !== TOTAL_QUESTIONS}
                onClick={handleFinish}
                onMouseOver={(e) => totalAnswered === TOTAL_QUESTIONS && (e.target.style.background = COLORS.primaryLight)}
                onMouseOut={(e) => totalAnswered === TOTAL_QUESTIONS && (e.target.style.background = COLORS.primary)}
              >
                View Results
              </button>
            )}
          </div>
          <div style={styles.footer}>Built on the AI Integration Readiness Framework by Hewman.ai</div>
        </div>
      </div>
    );
  }

  // === RESULTS ===
  if (phase === "results" && scores) {
    const radarData = scores.tumblerScores.map((t) => ({ subject: t.short, score: t.score, fullMark: 5 }));
    const weakTumblers = scores.tumblerScores.filter((t) => t.score < 3.5);

    return (
      <div style={styles.wrapper}>
        <div style={{ ...styles.container, ...styles.fadeIn }} ref={topRef}>
          <div style={styles.logo}>Hewman.ai</div>
          <h1 style={styles.h1}>Your AI Integration Readiness Results</h1>
          <p style={styles.subtitle}>AI Integration Readiness Assessment</p>

          {/* Radar Chart */}
          <div style={{ ...styles.card, padding: "20px 12px" }}>
            <ResponsiveContainer width="100%" height={340}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
                <PolarGrid stroke={COLORS.border} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: COLORS.text }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} tickCount={6} tick={{ fontSize: 10, fill: COLORS.textMuted }} />
                <Radar dataKey="score" stroke={COLORS.radarStroke} fill={COLORS.radarFill} strokeWidth={2} dot={{ r: 4, fill: COLORS.primary }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Summary */}
          <div style={styles.card}>
            <h3 style={styles.h3}>Tumbler Scores</h3>
            {scores.tumblerScores.map((t, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 5 ? `1px solid ${COLORS.border}` : "none" }}>
                <div style={styles.scoreCircle(t.score)}>{t.score}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                    {getTierLabel(t.score)}
                    {i >= 3 ? " (parallel track)" : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cascade Flags */}
          {scores.cascadeFlags.length > 0 && (
            <div style={styles.flagBox}>
              <div style={styles.flagLabel}>Cascade Alert</div>
              <p style={{ fontSize: 14, margin: 0, color: COLORS.text, lineHeight: 1.6 }}>{scores.cascadeFlags[0].message}</p>
            </div>
          )}

          {/* Diagnostic Narratives */}
          {weakTumblers.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.h3}>Where to Focus</h3>
              <p style={styles.mutedText}>Based on specific patterns within your responses, here is targeted guidance for areas scoring below 3.5.</p>
              {weakTumblers.slice(0, 3).map((t, i) => (
                <div key={i} style={styles.diagBox}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>{t.name} (Score: {t.score})</div>
                  <p style={{ fontSize: 14, margin: 0, lineHeight: 1.6, color: COLORS.text }}>
                    {DIAGNOSTIC_NARRATIVES[t.id - 1]?.[t.weakestDim] || "Review this area for improvement opportunities."}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Overall Assessment */}
          <div style={{ ...styles.card, background: scores.overallTier === 0 ? COLORS.successBg : "#F7F6F3" }}>
            <h3 style={styles.h3}>Overall Assessment</h3>
            <p style={{ fontSize: 15, margin: 0, lineHeight: 1.65 }}>{scores.overallMessage}</p>
          </div>

          {/* Conversation Capture */}
          {!emailSent ? (
            <div style={{ ...styles.card, border: `1.5px solid ${COLORS.accent}` }}>
              <h3 style={styles.h3}>Continue the Conversation</h3>
              <p style={styles.mutedText}>If you would like to discuss what these results mean for your organization, share your details below. No pitch. Just a focused conversation about where to go from here.</p>
              <input style={styles.input} type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <input style={styles.input} type="text" placeholder="Organization" value={org} onChange={(e) => setOrg(e.target.value)} />
              <input style={styles.input} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button
                style={{ ...styles.btn, width: "100%", ...(email && name ? {} : styles.btnDisabled) }}
                disabled={!email || !name}
                onClick={handleEmailSubmit}
                onMouseOver={(e) => email && name && (e.target.style.background = COLORS.primaryLight)}
                onMouseOut={(e) => email && name && (e.target.style.background = COLORS.primary)}
              >
                Request a Conversation
              </button>
            </div>
          ) : (
            <div style={{ ...styles.card, background: COLORS.successBg, textAlign: "center" }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: COLORS.primary, margin: 0 }}>
                Thanks, {name}. I will be in touch shortly.
              </p>
            </div>
          )}

          <div style={styles.footer}>Built on the AI Integration Readiness Framework by Hewman.ai</div>
        </div>
      </div>
    );
  }

  return null;
}
