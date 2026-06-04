// src/hooks/useTaskManager.js
import { useState, useCallback } from "react";
import { PHASES, STATUS_CONFIG } from "../data/phases";

function buildInitialTaskState() {
  const state = {};
  PHASES.forEach((phase) => {
    phase.tasks.forEach((task) => {
      state[task.id] = "todo";
    });
  });
  return state;
}

export function useTaskManager() {
  const [taskStatuses, setTaskStatuses] = useState(buildInitialTaskState);

  const cycleStatus = useCallback((taskId) => {
    const cycle = { todo: "inprogress", inprogress: "review", review: "done", done: "blocked", blocked: "todo" };
    setTaskStatuses((prev) => ({ ...prev, [taskId]: cycle[prev[taskId] || "todo"] }));
  }, []);

  const setStatus = useCallback((taskId, status) => {
    setTaskStatuses((prev) => ({ ...prev, [taskId]: status }));
  }, []);

  const resetPhase = useCallback((phaseKey) => {
    const phase = PHASES.find((p) => p.key === phaseKey);
    if (!phase) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      phase.tasks.forEach((t) => { next[t.id] = "todo"; });
      return next;
    });
  }, []);

  const completePhase = useCallback((phaseKey) => {
    const phase = PHASES.find((p) => p.key === phaseKey);
    if (!phase) return;
    setTaskStatuses((prev) => {
      const next = { ...prev };
      phase.tasks.forEach((t) => { next[t.id] = "done"; });
      return next;
    });
  }, []);

  const getPhaseStats = useCallback((phase) => {
    const total = phase.tasks.length;
    const counts = { todo: 0, inprogress: 0, review: 0, done: 0, blocked: 0 };
    phase.tasks.forEach((t) => { counts[taskStatuses[t.id] || "todo"]++; });
    const done = counts.done;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, ...counts, pct, isComplete: pct === 100 };
  }, [taskStatuses]);

  const getOverallStats = useCallback(() => {
    const allStatuses = Object.values(taskStatuses);
    const total = allStatuses.length;
    const counts = { todo: 0, inprogress: 0, review: 0, done: 0, blocked: 0 };
    allStatuses.forEach((s) => { counts[s]++; });
    const pct = total > 0 ? Math.round((counts.done / total) * 100) : 0;
    return { total, ...counts, pct };
  }, [taskStatuses]);

  return { taskStatuses, cycleStatus, setStatus, resetPhase, completePhase, getPhaseStats, getOverallStats };
}

// src/hooks/usePullRequests.js
import { useState, useCallback } from "react";
import { INITIAL_PRS } from "../data/pullRequests";

let prIdCounter = 100;

export function usePullRequests() {
  const [prs, setPrs] = useState(INITIAL_PRS);

  const createPR = useCallback((data) => {
    prIdCounter++;
    const newPR = {
      id: prIdCounter,
      number: 44 + prIdCounter,
      title: data.title,
      description: data.description || "",
      author: data.author || "you",
      avatar: (data.author || "YO").slice(0, 2).toUpperCase(),
      phase: data.phase,
      phaseLabel: data.phaseLabel,
      branch: data.branch || `feature/new-branch-${prIdCounter}`,
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
    return newPR;
  }, []);

  const requestReview = useCallback((id, reviewer) => {
    setPrs((prev) =>
      prev.map((pr) =>
        pr.id === id
          ? { ...pr, status: "review", reviewers: [...new Set([...pr.reviewers, reviewer || "team.lead"])] }
          : pr
      )
    );
  }, []);

  const approve = useCallback((id) => {
    setPrs((prev) =>
      prev.map((pr) => {
        if (pr.id !== id) return pr;
        const newApprovals = pr.approvals + 1;
        return { ...pr, approvals: newApprovals };
      })
    );
  }, []);

  const mergePR = useCallback((id) => {
    setPrs((prev) =>
      prev.map((pr) =>
        pr.id === id
          ? { ...pr, status: "merged", mergedAt: new Date().toISOString().split("T")[0], approvals: Math.max(pr.approvals, pr.requiredApprovals) }
          : pr
      )
    );
  }, []);

  const closePR = useCallback((id) => {
    setPrs((prev) => prev.map((pr) => (pr.id === id ? { ...pr, status: "closed" } : pr)));
  }, []);

  const runChecks = useCallback((id) => {
    setPrs((prev) =>
      prev.map((pr) => {
        if (pr.id !== id) return pr;
        return { ...pr, checks: { sast: "running", tests: "running", coverage: "—", lint: "running" } };
      })
    );
    setTimeout(() => {
      setPrs((prev) =>
        prev.map((pr) => {
          if (pr.id !== id) return pr;
          const cov = `${Math.ceil(Math.random() * 20) + 80}%`;
          return { ...pr, checks: { sast: "pass", tests: "pass", coverage: cov, lint: "pass" } };
        })
      );
    }, 2000);
  }, []);

  const getPRStats = useCallback(() => {
    const stats = { open: 0, review: 0, merged: 0, closed: 0 };
    prs.forEach((pr) => { stats[pr.status] = (stats[pr.status] || 0) + 1; });
    return stats;
  }, [prs]);

  return { prs, createPR, requestReview, approve, mergePR, closePR, runChecks, getPRStats };
}

// src/hooks/useNotification.js
import { useState, useCallback } from "react";

export function useNotification() {
  const [notifications, setNotifications] = useState([]);
  let notifId = 0;

  const push = useCallback((message, type = "success", duration = 3000) => {
    const id = ++notifId;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, push, dismiss };
}
