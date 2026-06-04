import React, { useState } from "react";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { PhaseView } from "./components/PhaseView";
import { PRView } from "./components/PRView";
import { TimelineView } from "./components/TimelineView";
import { NotificationStack } from "./components/shared/index.jsx";
import { PHASES } from "./data/phases";
import { INITIAL_PRS } from "./data/pullRequests";

export default function App() {
  const [view, setView] = useState("dashboard");
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [prInitialPhase, setPrInitialPhase] = useState(null);

  const [taskStatuses, setTaskStatuses] = useState(() => {
    const state = {};
    PHASES.forEach((phase) => phase.tasks.forEach((task) => { state[task.id] = "todo"; }));
    return state;
  });

  const cycleTask = (taskId) => {
    const cycle = { todo: "inprogress", inprogress: "review", review: "done", done: "blocked", blocked: "todo" };
    setTaskStatuses((prev) => ({ ...prev, [taskId]: cycle[prev[taskId] || "todo"] }));
  };

  const setTaskStatus = (taskId, status) => {
    setTaskStatuses((prev) => ({ ...prev, [taskId]: status }));
  };

  const resetPhase = (phaseKey) => {
    const phase = PHASES.find((p) => p.key === phaseKey);
    if (!phase) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      phase.tasks.forEach((t) => { next[t.id] = "todo"; });
      return next;
    });
  };

  const completePhase = (phaseKey) => {
    const phase = PHASES.find((p) => p.key === phaseKey);
    if (!phase) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      phase.tasks.forEach((t) => { next[t.id] = "done"; });
      return next;
    });
  };

  const getPhaseStats = (phase) => {
    const total = phase.tasks.length;
    const counts = { todo: 0, inprogress: 0, review: 0, done: 0, blocked: 0 };
    phase.tasks.forEach((t) => { counts[taskStatuses[t.id] || "todo"]++; });
    const pct = total > 0 ? Math.round((counts.done / total) * 100) : 0;
    return { total, ...counts, pct, isComplete: pct === 100 };
  };

  const getOverallStats = () => {
    const allStatuses = Object.values(taskStatuses);
    const total = allStatuses.length;
    const counts = { todo: 0, inprogress: 0, review: 0, done: 0, blocked: 0 };
    allStatuses.forEach((s) => { counts[s]++; });
    const pct = total > 0 ? Math.round((counts.done / total) * 100) : 0;
    return { total, ...counts, pct };
  };

  // BRD documents state (dashboard-level)
  const [brdDocuments, setBrdDocuments] = useState([]);
  const uploadBRD = (doc) => setBrdDocuments(prev => [
    { ...doc, id: Date.now(), uploadedAt: new Date().toISOString().split("T")[0] },
    ...prev,
  ]);
  const deleteBRD = (id) => setBrdDocuments(prev => prev.filter(d => d.id !== id));

  // Per-phase gate state: BRD upload + approval workflow
  const [phaseGates, setPhaseGates] = useState(() => {
    const g = {};
    PHASES.forEach(p => {
      g[p.key] = { brdDocument: null, approvalStatus: "idle", requestedAt: null, approvedAt: null, rejectedAt: null, rejectionNote: "" };
    });
    return g;
  });

  const uploadPhaseBRD = (phaseKey, doc) =>
    setPhaseGates(prev => ({ ...prev, [phaseKey]: { ...prev[phaseKey], brdDocument: { ...doc, uploadedAt: new Date().toISOString().split("T")[0] }, approvalStatus: "idle" } }));

  const deletePhaseBRD = (phaseKey) =>
    setPhaseGates(prev => ({ ...prev, [phaseKey]: { ...prev[phaseKey], brdDocument: null, approvalStatus: "idle", rejectionNote: "" } }));

  const requestPhaseApproval = (phaseKey) => {
    setPhaseGates(prev => ({ ...prev, [phaseKey]: { ...prev[phaseKey], approvalStatus: "pending", requestedAt: new Date().toISOString().split("T")[0] } }));
    notify("Approval request submitted!", "info");
  };

  const approvePhase = (phaseKey) => {
    setPhaseGates(prev => ({ ...prev, [phaseKey]: { ...prev[phaseKey], approvalStatus: "approved", approvedAt: new Date().toISOString().split("T")[0] } }));
    notify("Phase approved — next phase is now unlocked!", "success");
  };

  const rejectPhase = (phaseKey, note) => {
    setPhaseGates(prev => ({ ...prev, [phaseKey]: { ...prev[phaseKey], approvalStatus: "rejected", rejectedAt: new Date().toISOString().split("T")[0], rejectionNote: note } }));
    notify("Phase approval rejected.", "error");
  };

  const isPhaseUnlocked = (index) => {
    // Only Development (index 2) requires Design phase BRD approval; all others are always unlocked
    if (index === 2) return phaseGates["design"]?.approvalStatus === "approved";
    return true;
  };

  const [prs, setPrs] = useState(INITIAL_PRS);
  let prCounter = 200;

  const createPR = (data) => {
    prCounter++;
    const newPR = {
      id: prCounter + Date.now(),
      number: 50 + prCounter,
      title: data.title,
      description: data.description || "",
      author: data.author || "you",
      avatar: (data.author || "YO").slice(0, 2).toUpperCase(),
      phase: data.phase,
      phaseLabel: data.phaseLabel || data.phase,
      branch: data.branch || `feature/new-${prCounter}`,
      base: "main",
      status: "open",
      checks: { sast: "pending", tests: "pending", coverage: "—", lint: "pending" },
      reviewers: [],
      approvals: 0,
      requiredApprovals: 2,
      files: Math.ceil(Math.random() * 20) + 1,
      additions: Math.ceil(Math.random() * 800) + 50,
      deletions: Math.ceil(Math.random() * 100),
      comments: 0,
      linkedTicket: data.linkedTicket || "",
      createdAt: new Date().toISOString().split("T")[0],
      labels: data.labels || [],
    };
    setPrs((prev) => [newPR, ...prev]);
  };

  const getPRStats = () => {
    const stats = { open: 0, review: 0, merged: 0, closed: 0 };
    prs.forEach((pr) => { stats[pr.status] = (stats[pr.status] || 0) + 1; });
    return stats;
  };

  const openPRCount = prs.filter(p => p.status === "open" || p.status === "review").length;

  const [notifications, setNotifications] = useState([]);
  const notify = (message, type = "success") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3200);
  };

  const handleNavigate = (newView, phaseIndex) => {
    setView(newView);
    if (phaseIndex !== undefined) setActivePhaseIndex(phaseIndex);
  };

  const handleRaisePR = (phase) => {
    setPrInitialPhase(phase);
    setView("prs");
  };

  const overallStats = getOverallStats();

  return (
    <div style={{ fontFamily: "'Sora', 'DM Sans', system-ui, sans-serif", minHeight: "100vh", background: "#F1F5F9", color: "#1E293B" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes slideInRight { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:translateX(0) } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F1F5F9; }
        ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 99px; }
        button { font-family: inherit; }
        input, textarea, select { font-family: inherit; }
      `}</style>

      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css" />

      <Header
        activeView={view}
        onViewChange={setView}
        overallStats={overallStats}
        openPRCount={openPRCount}
      />

      <main>
        {view === "dashboard" && (
          <Dashboard
            getPhaseStats={getPhaseStats}
            getOverallStats={getOverallStats}
            onNavigate={handleNavigate}
            prStats={getPRStats()}
            brdDocuments={brdDocuments}
            onUploadBRD={uploadBRD}
            onDeleteBRD={deleteBRD}
            phaseGates={phaseGates}
            isPhaseUnlocked={isPhaseUnlocked}
          />
        )}

        {view === "phases" && (
          <PhaseView
            activePhaseIndex={activePhaseIndex}
            onPhaseChange={setActivePhaseIndex}
            taskStatuses={taskStatuses}
            onCycleTask={cycleTask}
            onSetStatus={setTaskStatus}
            onResetPhase={resetPhase}
            onCompletePhase={completePhase}
            getPhaseStats={getPhaseStats}
            onRaisePR={handleRaisePR}
            notify={notify}
            phaseGates={phaseGates}
            onUploadPhaseBRD={uploadPhaseBRD}
            onDeletePhaseBRD={deletePhaseBRD}
            onRequestApproval={requestPhaseApproval}
            onApprovePhase={approvePhase}
            onRejectPhase={rejectPhase}
            isPhaseUnlocked={isPhaseUnlocked}
          />
        )}

        {view === "prs" && (
          <PRView
            prs={prs}
            onCreatePR={createPR}
            onRequestReview={(id) => setPrs(prev => prev.map(p => p.id === id ? { ...p, status: "review" } : p))}
            onApprove={(id) => setPrs(prev => prev.map(p => p.id === id ? { ...p, approvals: p.approvals + 1 } : p))}
            onMerge={(id) => setPrs(prev => prev.map(p => p.id === id ? { ...p, status: "merged", mergedAt: new Date().toISOString().split("T")[0] } : p))}
            onClose={(id) => setPrs(prev => prev.map(p => p.id === id ? { ...p, status: "closed" } : p))}
            onRunChecks={(id) => {
              setPrs(prev => prev.map(p => p.id === id ? { ...p, checks: { sast: "running", tests: "running", coverage: "—", lint: "running" } } : p));
              setTimeout(() => {
                const cov = `${Math.ceil(Math.random() * 20) + 80}%`;
                setPrs(prev => prev.map(p => p.id === id ? { ...p, checks: { sast: "pass", tests: "pass", coverage: cov, lint: "pass" } } : p));
              }, 2000);
            }}
            getPRStats={getPRStats}
            initialFormPhase={prInitialPhase}
            onClearInitialPhase={() => setPrInitialPhase(null)}
            notify={notify}
          />
        )}

        {view === "timeline" && (
          <TimelineView
            getPhaseStats={getPhaseStats}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <NotificationStack
        notifications={notifications}
        onDismiss={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
      />
    </div>
  );
}
