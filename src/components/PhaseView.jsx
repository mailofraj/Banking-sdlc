import React, { useState, useRef, useEffect } from "react";
import { PHASES, PRIORITY_CONFIG, EFFORT_CONFIG, STATUS_CONFIG } from "../data/phases";
import { Card, ProgressBar, Badge, StatusBadge } from "./shared/index.jsx";

function TaskRow({ task, status, onCycle, onStatusSet }) {
  const [expanded, setExpanded] = useState(false);
  const pCfg = PRIORITY_CONFIG[task.priority];
  const eCfg = EFFORT_CONFIG[task.effort];
  const statusCycle = ["todo", "inprogress", "review", "done", "blocked"];

  return (
    <div style={{ borderBottom: "1px solid #F3F4F6" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", cursor: "pointer", transition: "background .12s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
        onMouseLeave={e => e.currentTarget.style.background = ""}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); onCycle(task.id); }}
          title="Click to cycle status"
          style={{
            width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${STATUS_CONFIG[status].color}55`,
            background: STATUS_CONFIG[status].bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, color: STATUS_CONFIG[status].color, flexShrink: 0, transition: "all .15s",
          }}
        >
          {status === "todo" ? "○" : status === "inprogress" ? "◑" : status === "review" ? "◈" : status === "done" ? "●" : "✕"}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 13, fontWeight: 500, color: status === "done" ? "#9CA3AF" : "#111827",
              textDecoration: status === "done" ? "line-through" : "none",
            }}>
              {task.title}
            </span>
            {task.required && (
              <Badge color="#DC2626" bg="#FEF2F2" border="#FCA5A5" small>REQUIRED</Badge>
            )}
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{task.description}</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <Badge color={pCfg.color} bg={pCfg.bg} border={pCfg.border} small>{pCfg.label}</Badge>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{eCfg.hours}</span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{task.owner}</span>
          <StatusBadge status={status} />
          <span style={{ fontSize: 14, color: "#CBD5E1", marginLeft: 4 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 20px 16px 62px", background: "#FAFBFF", borderTop: "1px solid #F3F4F6" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Tags</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {task.tags.map(tag => (
                  <Badge key={tag} color="#374151" bg="#F3F4F6" border="#E5E7EB" small>{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Artifacts</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {task.artifacts.map(a => (
                  <span key={a} style={{ fontSize: 12, color: "#374151" }}>📄 {a}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>Set status</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {statusCycle.map(s => {
                  const cfg = STATUS_CONFIG[s];
                  return (
                    <button key={s} onClick={() => onStatusSet(task.id, s)}
                      style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 6,
                        border: `1px solid ${s === status ? cfg.color : "#E5E7EB"}`,
                        background: s === status ? cfg.bg : "#fff",
                        color: s === status ? cfg.color : "#6B7280",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: s === status ? 600 : 400,
                      }}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const TASK_STATUS_DISPLAY = {
  todo:       { icon: "○", color: "#9CA3AF", bg: "#F9FAFB", label: "To do" },
  inprogress: { icon: "◑", color: "#D97706", bg: "#FFFBEB", label: "In progress" },
  review:     { icon: "◈", color: "#7C3AED", bg: "#F5F3FF", label: "In review" },
  done:       { icon: "●", color: "#059669", bg: "#ECFDF5", label: "Done" },
  blocked:    { icon: "✕", color: "#DC2626", bg: "#FEF2F2", label: "Blocked" },
};

function TaskChecklist({ phase, taskStatuses, onSetStatus, locked }) {
  const [showAll, setShowAll] = useState(false);
  const requiredTasks = phase.tasks.filter(t => t.required);
  const reqDoneCount = requiredTasks.filter(t => taskStatuses[t.id] === "done").length;
  const totalDone = phase.tasks.filter(t => taskStatuses[t.id] === "done").length;
  const pct = Math.round((totalDone / phase.tasks.length) * 100);
  const allReqDone = reqDoneCount === requiredTasks.length;
  const displayTasks = showAll ? phase.tasks : requiredTasks;

  const statusCycle = { todo: "inprogress", inprogress: "review", review: "done", done: "blocked", blocked: "todo" };

  return (
    <div>
      {/* Progress summary */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: "#374151" }}>
          <strong style={{ color: allReqDone ? "#059669" : "#D97706" }}>{reqDoneCount}/{requiredTasks.length}</strong> required tasks done
          <span style={{ color: "#9CA3AF", marginLeft: 8 }}>({totalDone}/{phase.tasks.length} total)</span>
        </div>
        <button
          onClick={() => setShowAll(v => !v)}
          style={{ fontSize: 11, padding: "2px 10px", borderRadius: 6, border: "1px solid #E5E7EB", background: "#fff", color: "#6B7280", cursor: "pointer", fontFamily: "inherit" }}>
          {showAll ? "Required only" : "Show all"}
        </button>
      </div>

      {/* Mini progress bar */}
      <div style={{ height: 5, background: "#F3F4F6", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: allReqDone ? "#059669" : phase.color, borderRadius: 99, transition: "width .4s ease" }} />
      </div>

      {/* Task rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {displayTasks.map(task => {
          const st = taskStatuses[task.id] || "todo";
          const disp = TASK_STATUS_DISPLAY[st];
          const isDone = st === "done";
          return (
            <div key={task.id} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
              background: isDone ? "#F0FDF4" : "#FAFAFA",
              border: `1px solid ${isDone ? "#BBF7D0" : "#F3F4F6"}`,
              opacity: locked ? 0.6 : 1,
            }}>
              {/* Status cycle button */}
              <button
                disabled={locked}
                onClick={() => onSetStatus(task.id, statusCycle[st])}
                title={`Current: ${disp.label} — click to advance`}
                style={{
                  width: 26, height: 26, borderRadius: 7, border: `1.5px solid ${disp.color}55`,
                  background: disp.bg, color: disp.color, fontSize: 13, cursor: locked ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit",
                }}>
                {disp.icon}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize: 12, fontWeight: 500,
                  color: isDone ? "#6B7280" : "#111827",
                  textDecoration: isDone ? "line-through" : "none",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block",
                }}>
                  {task.title}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {task.required && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#DC2626", letterSpacing: ".04em" }}>REQ</span>
                )}
                {/* Quick status select */}
                <select
                  disabled={locked}
                  value={st}
                  onChange={e => onSetStatus(task.id, e.target.value)}
                  style={{
                    fontSize: 11, padding: "2px 6px", borderRadius: 6, border: `1px solid ${disp.color}55`,
                    background: disp.bg, color: disp.color, fontFamily: "inherit", cursor: locked ? "default" : "pointer",
                    outline: "none", fontWeight: 600,
                  }}>
                  {Object.entries(TASK_STATUS_DISPLAY).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {allReqDone && (
        <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #6EE7B7", fontSize: 12, color: "#065F46", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          ✅ All required tasks complete — ready to request approval
        </div>
      )}
    </div>
  );
}

function PhaseGatePanel({ phase, gate, taskStatuses, onSetStatus, onUpload, onDeleteBRD, onRequestApproval, onApprove, onReject }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejNote, setRejNote] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) return;
    const reader = new FileReader();
    reader.onload = (e) => onUpload(phase.key, { name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
    reader.readAsDataURL(file);
  };

  const formatSize = (b) => b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;
  const { approvalStatus, brdDocument } = gate;

  const requiredTasks = phase.tasks.filter(t => t.required);
  const allRequiredDone = requiredTasks.every(t => taskStatuses[t.id] === "done");
  const canRequestApproval = !!brdDocument && allRequiredDone;

  const steps = [
    { label: "Upload BRD",       done: !!brdDocument },
    { label: "Complete Tasks",   done: allRequiredDone },
    { label: "Request Approval", done: ["pending", "approved", "rejected"].includes(approvalStatus) },
    { label: "Approved",         done: approvalStatus === "approved" },
  ];

  const borderColor = approvalStatus === "approved" ? "#6EE7B7"
    : approvalStatus === "pending" ? "#FCD34D"
    : approvalStatus === "rejected" ? "#FCA5A5"
    : allRequiredDone && brdDocument ? "#7C3AED"
    : "#D1D5DB";

  const stepNum = (i) => (
    <span style={{
      width: 18, height: 18, borderRadius: 99, flexShrink: 0,
      background: steps[i].done ? "#059669" : "#E5E7EB",
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontSize: 10, color: steps[i].done ? "#fff" : "#6B7280", fontWeight: 700,
    }}>{steps[i].done ? "✓" : i + 1}</span>
  );

  return (
    <Card style={{ marginBottom: 16, border: `1.5px solid ${borderColor}` }}>
      {/* Header with 4-step progress */}
      <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>🔑 Phase Gate — BRD, Tasks &amp; Approval</div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: 99,
                  border: `2px solid ${s.done ? "#059669" : "#D1D5DB"}`,
                  background: s.done ? "#059669" : "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 700, color: s.done ? "#fff" : "#9CA3AF", flexShrink: 0,
                }}>
                  {s.done ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 10, color: s.done ? "#059669" : "#6B7280", fontWeight: s.done ? 600 : 400, whiteSpace: "nowrap" }}>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div style={{ width: 12, height: 1, background: "#E5E7EB", flexShrink: 0 }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── STEP 1: BRD Upload ── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
            {stepNum(0)} BRD Document
          </div>
          {brdDocument ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "1px solid #6EE7B7", background: "#ECFDF5" }}>
              <span style={{ fontSize: 20 }}>📎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#065F46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{brdDocument.name}</div>
                <div style={{ fontSize: 11, color: "#6B7280" }}>{formatSize(brdDocument.size)} · Uploaded {brdDocument.uploadedAt}</div>
              </div>
              <a href={brdDocument.dataUrl} download={brdDocument.name}
                style={{ fontSize: 12, padding: "4px 12px", borderRadius: 7, border: "1px solid #7C3AED", background: "#F5F3FF", color: "#7C3AED", textDecoration: "none", fontFamily: "inherit", fontWeight: 600, flexShrink: 0 }}>
                Download
              </a>
              {approvalStatus === "idle" && (
                <button onClick={() => onDeleteBRD(phase.key)}
                  style={{ fontSize: 11, padding: "4px 10px", borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                  Remove
                </button>
              )}
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => inputRef.current.click()}
              style={{
                padding: "18px", borderRadius: 8, border: `2px dashed ${dragOver ? phase.color : "#D1D5DB"}`,
                background: dragOver ? phase.lightColor : "#FAFAFA", cursor: "pointer",
                textAlign: "center", transition: "all .15s",
              }}>
              <div style={{ fontSize: 24, marginBottom: 5 }}>📄</div>
              <div style={{ fontSize: 13, color: "#374151" }}>
                Drop BRD here or <span style={{ color: phase.color, textDecoration: "underline" }}>browse files</span>
              </div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>PDF, DOC, DOCX — up to 20 MB</div>
              <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
                onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} />
            </div>
          )}
        </div>

        {/* ── STEP 2: Complete Tasks ── (shown once BRD uploaded, locked once approval sent) */}
        {brdDocument && (approvalStatus === "idle" || approvalStatus === "pending" || approvalStatus === "rejected") && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {stepNum(1)} Complete Phase Tasks
              {!allRequiredDone && (
                <span style={{ fontSize: 11, color: "#D97706", fontWeight: 400, marginLeft: 4 }}>
                  — complete all required tasks to unlock approval
                </span>
              )}
            </div>
            <div style={{ padding: "14px", borderRadius: 8, border: `1px solid ${allRequiredDone ? "#BBF7D0" : "#E5E7EB"}`, background: allRequiredDone ? "#F0FDF4" : "#FAFAFA" }}>
              <TaskChecklist
                phase={phase}
                taskStatuses={taskStatuses}
                onSetStatus={onSetStatus}
                locked={approvalStatus === "pending"}
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Request Approval ── */}
        {brdDocument && approvalStatus === "idle" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {stepNum(2)} Request Approval
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 8,
              background: canRequestApproval ? "#F5F3FF" : "#F9FAFB",
              border: `1px solid ${canRequestApproval ? "#C4B5FD" : "#E5E7EB"}` }}>
              <div style={{ flex: 1 }}>
                {canRequestApproval ? (
                  <>
                    <div style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>BRD uploaded &amp; all required tasks complete.</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                      Approvers: <strong style={{ color: "#374151" }}>{phase.gate.approvers.join(", ")}</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>
                      {!brdDocument ? "Upload BRD first." : "Mark all required tasks as Done to enable approval request."}
                    </div>
                    <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>
                      Approvers: {phase.gate.approvers.join(", ")}
                    </div>
                  </>
                )}
              </div>
              <button
                disabled={!canRequestApproval}
                onClick={() => canRequestApproval && onRequestApproval(phase.key)}
                style={{
                  padding: "9px 22px", borderRadius: 8, border: "none",
                  background: canRequestApproval ? phase.color : "#D1D5DB",
                  color: "#fff", fontSize: 13, fontWeight: 600,
                  cursor: canRequestApproval ? "pointer" : "not-allowed",
                  fontFamily: "inherit", flexShrink: 0, transition: "background .2s",
                }}>
                {canRequestApproval ? "Request Approval →" : "🔒 Locked"}
              </button>
            </div>
          </div>
        )}

        {/* ── Approval pending ── */}
        {approvalStatus === "pending" && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {stepNum(2)} Approval Pending
            </div>
            <div style={{ padding: "14px 16px", borderRadius: 8, background: "#FFFBEB", border: "1px solid #FCD34D" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 8 }}>
                ⏳ Awaiting approval — requested on {gate.requestedAt}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {phase.gate.approvers.map(a => (
                  <Badge key={a} color="#92400E" bg="#FEF3C7" border="#FCD34D" small>👤 {a}</Badge>
                ))}
              </div>
              <div style={{ borderTop: "1px solid #FDE68A", paddingTop: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 11, color: "#78350F", fontWeight: 600 }}>Simulate approver action:</span>
              </div>
              {showReject ? (
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1 }}>
                    <input value={rejNote} onChange={e => setRejNote(e.target.value)}
                      placeholder="Rejection reason (optional)…"
                      style={{ width: "100%", padding: "7px 10px", borderRadius: 7, border: "1px solid #FCA5A5", fontSize: 12, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
                  </div>
                  <button onClick={() => { onReject(phase.key, rejNote); setShowReject(false); setRejNote(""); }}
                    style={{ padding: "7px 16px", borderRadius: 7, border: "none", background: "#DC2626", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                    Confirm Reject
                  </button>
                  <button onClick={() => setShowReject(false)}
                    style={{ padding: "7px 12px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => onApprove(phase.key)}
                    style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: "#059669", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setShowReject(true)}
                    style={{ padding: "7px 14px", borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Approved ── */}
        {approvalStatus === "approved" && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #6EE7B7" }}>
            <span style={{ fontSize: 26 }}>✅</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#065F46" }}>Phase Approved — Next phase is unlocked!</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>Approved on {gate.approvedAt}</div>
            </div>
          </div>
        )}

        {/* ── Rejected ── */}
        {approvalStatus === "rejected" && (
          <div style={{ padding: "14px 16px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FCA5A5" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", marginBottom: gate.rejectionNote ? 6 : 12 }}>
              ✕ Approval Rejected — {gate.rejectedAt}
            </div>
            {gate.rejectionNote && (
              <div style={{ fontSize: 12, color: "#DC2626", marginBottom: 12, padding: "6px 10px", background: "#fff", borderRadius: 6, border: "1px solid #FCA5A5" }}>
                Reason: {gate.rejectionNote}
              </div>
            )}
            <button onClick={() => onDeleteBRD(phase.key)}
              style={{ padding: "7px 18px", borderRadius: 7, border: "none", background: phase.color, color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Re-upload BRD &amp; try again →
            </button>
          </div>
        )}

      </div>
    </Card>
  );
}

function PhaseSidebar({ phases, activeIndex, onSelect, getPhaseStats, phaseGates, isPhaseUnlocked }) {
  const designGate = phaseGates?.["design"];

  return (
    <div style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 6 }}>
      {phases.map((phase, i) => {
        const stats = getPhaseStats(phase);
        const isActive = i === activeIndex;
        const unlocked = isPhaseUnlocked(i);
        const isDesign = phase.key === "design";
        const isDevelopment = i === 2;

        // BRD gate indicators only apply to the design phase entry
        const isApproved = isDesign && designGate?.approvalStatus === "approved";
        const isPending  = isDesign && designGate?.approvalStatus === "pending";
        const hasBRD     = isDesign && !!designGate?.brdDocument;

        return (
          <div key={phase.id} onClick={() => onSelect(i)}
            style={{
              padding: "11px 14px", borderRadius: 10, cursor: "pointer",
              border: `1px solid ${isActive ? phase.color : isDevelopment && !unlocked ? "#FCD34D" : "#E5E7EB"}`,
              background: isDevelopment && !unlocked ? "#FFFBEB" : isActive ? phase.lightColor : "#fff",
              transition: "all .15s", opacity: isDevelopment && !unlocked ? 0.7 : 1,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                background: isDevelopment && !unlocked ? "#FDE68A" : isActive ? phase.color : "#F3F4F6",
                display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isDevelopment && !unlocked
                  ? <span style={{ fontSize: 12 }}>🔒</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? "#fff" : "#9CA3AF" }}>P{phase.id}</span>
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600,
                  color: isDevelopment && !unlocked ? "#92400E" : isActive ? phase.darkColor : "#374151",
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {phase.shortLabel}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                {isApproved
                  ? <span style={{ fontSize: 12 }}>✅</span>
                  : isPending
                  ? <span style={{ fontSize: 12 }}>⏳</span>
                  : hasBRD
                  ? <span style={{ fontSize: 12 }}>📎</span>
                  : <span style={{ fontSize: 11, fontWeight: 700, color: stats.pct === 100 ? "#059669" : isActive ? phase.color : "#9CA3AF" }}>{stats.pct}%</span>
                }
              </div>
            </div>
            <ProgressBar pct={stats.pct} color={isDevelopment && !unlocked ? "#FCD34D" : phase.color} height={3} />
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>{stats.done}/{stats.total} tasks</div>
          </div>
        );
      })}
    </div>
  );
}

export function PhaseView({
  activePhaseIndex, onPhaseChange, taskStatuses,
  onCycleTask, onSetStatus, onResetPhase, onCompletePhase,
  getPhaseStats, onRaisePR, notify,
  phaseGates, onUploadPhaseBRD, onDeletePhaseBRD,
  onRequestApproval, onApprovePhase, onRejectPhase, isPhaseUnlocked,
}) {
  const DESIGN_PHASE_KEY = "design";

  const phase = PHASES[activePhaseIndex];
  const stats = getPhaseStats(phase);
  const [filter, setFilter] = useState("all");
  const isDesignPhase = phase.key === DESIGN_PHASE_KEY;
  const gate = phaseGates?.[DESIGN_PHASE_KEY] || { brdDocument: null, approvalStatus: "idle" };
  const unlocked = isPhaseUnlocked(activePhaseIndex);
  const isLastPhase = activePhaseIndex === PHASES.length - 1;
  const nextUnlocked = isLastPhase || (isDesignPhase && gate.approvalStatus === "approved") || (!isDesignPhase && activePhaseIndex !== 1);

  // Notify only when on the design phase: BRD uploaded + all required tasks done
  const designPhase = PHASES.find(p => p.key === DESIGN_PHASE_KEY);
  const designRequiredDone = designPhase?.tasks.filter(t => t.required).every(t => taskStatuses[t.id] === "done") ?? false;
  useEffect(() => {
    if (
      isDesignPhase &&
      gate.brdDocument &&
      designRequiredDone &&
      gate.approvalStatus === "idle"
    ) {
      notify(`All required tasks in "${phase.shortLabel}" complete — ready to request approval!`, "success");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [designRequiredDone, gate.brdDocument, isDesignPhase]);

  const filteredTasks = phase.tasks.filter(task => {
    if (filter === "all") return true;
    if (filter === "required") return task.required;
    return (taskStatuses[task.id] || "todo") === filter;
  });

  return (
    <div style={{ display: "flex", gap: 20, padding: "24px 28px", maxWidth: 1400, margin: "0 auto" }}>
      <PhaseSidebar
        phases={PHASES}
        activeIndex={activePhaseIndex}
        onSelect={onPhaseChange}
        getPhaseStats={getPhaseStats}
        phaseGates={phaseGates}
        isPhaseUnlocked={isPhaseUnlocked}
      />

      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Phase header — always visible */}
        <Card style={{ marginBottom: 16, overflow: "hidden", borderTop: `4px solid ${phase.color}` }}>
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <Badge color={phase.color} bg={phase.lightColor} border={phase.borderColor}>Phase {phase.id}</Badge>
                  <span style={{ fontWeight: 800, fontSize: 18, color: "#1E293B" }}>{phase.label}</span>
                  {stats.isComplete && <Badge color="#059669" bg="#ECFDF5" border="#6EE7B7">✓ Complete</Badge>}
                  {!unlocked && <Badge color="#6B7280" bg="#F3F4F6" border="#D1D5DB">🔒 Locked</Badge>}
                </div>
                <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.7, maxWidth: 680 }}>{phase.description}</p>
              </div>
              {unlocked && (
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { onResetPhase(phase.key); notify("Phase reset to 'To do'", "warn"); }}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>
                    Reset
                  </button>
                  <button onClick={() => { onCompletePhase(phase.key); notify(`Phase ${phase.id} marked complete!`, "success"); }}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "none", background: "#059669", cursor: "pointer", color: "#fff", fontFamily: "inherit", fontWeight: 600 }}>
                    ✓ Mark done
                  </button>
                  <button onClick={() => onRaisePR(phase)}
                    style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "none", background: phase.color, cursor: "pointer", color: "#fff", fontFamily: "inherit", fontWeight: 600 }}>
                    ⑂ Raise PR
                  </button>
                </div>
              )}
            </div>

            {unlocked && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginTop: 16, marginBottom: 14 }}>
                  {[
                    { label: "Total", value: stats.total, color: "#374151" },
                    { label: "To do", value: stats.todo, color: STATUS_CONFIG.todo.color },
                    { label: "In progress", value: stats.inprogress, color: STATUS_CONFIG.inprogress.color },
                    { label: "In review", value: stats.review, color: STATUS_CONFIG.review.color },
                    { label: "Done", value: stats.done, color: STATUS_CONFIG.done.color },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center", padding: "10px", borderRadius: 8, background: "#F8FAFC" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <ProgressBar pct={stats.pct} color={phase.color} height={8} showLabel />
              </>
            )}
          </div>

          {/* Existing gate info */}
          <div style={{ padding: "14px 24px", background: "#FFFBEB", borderTop: "1px solid #FCD34D" }}>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔐</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "#92400E", textTransform: "uppercase", letterSpacing: ".05em" }}>{phase.gate.title}</div>
                <div style={{ fontSize: 12, color: "#78350F", marginTop: 2 }}>{phase.gate.condition}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  {phase.gate.approvers.map(a => (
                    <Badge key={a} color="#92400E" bg="#FEF3C7" border="#FCD34D" small>{a}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* LOCKED phase screen */}
        {!unlocked && (
          <Card style={{ padding: "48px 32px", textAlign: "center", border: "2px dashed #D1D5DB" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Phase Locked</div>
            <div style={{ fontSize: 14, color: "#6B7280", maxWidth: 420, margin: "0 auto", lineHeight: 1.7, marginBottom: 24 }}>
              The <strong>System Design</strong> phase BRD must be uploaded and approved before Development can begin.
            </div>
            <button onClick={() => onPhaseChange(1)}
              style={{ padding: "10px 24px", borderRadius: 9, border: "none", background: PHASES[1].color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              ← Go to System Design — upload &amp; get BRD approved
            </button>
          </Card>
        )}

        {/* UNLOCKED content */}
        {unlocked && (
          <>
            {/* BRD & Approval gate panel — Design phase only */}
            {isDesignPhase && (
              <PhaseGatePanel
                phase={phase}
                gate={gate}
                taskStatuses={taskStatuses}
                onSetStatus={onSetStatus}
                onUpload={onUploadPhaseBRD}
                onDeleteBRD={onDeletePhaseBRD}
                onRequestApproval={onRequestApproval}
                onApprove={onApprovePhase}
                onReject={onRejectPhase}
              />
            )}

            {/* Deliverables & tools */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <Card style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Deliverables</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {phase.deliverables.map(d => (
                    <Badge key={d} color="#059669" bg="#ECFDF5" border="#6EE7B7" small>{d}</Badge>
                  ))}
                </div>
              </Card>
              <Card style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>Tools &amp; technologies</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {phase.tools.map(t => (
                    <Badge key={t} color="#0369A1" bg="#E0F2FE" border="#7DD3FC" small>{t}</Badge>
                  ))}
                </div>
              </Card>
            </div>

            {/* Task list */}
            <Card>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>
                  Tasks <span style={{ fontWeight: 400, color: "#9CA3AF" }}>({filteredTasks.length} shown)</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {["all", "required", "todo", "inprogress", "review", "done", "blocked"].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                      style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 99,
                        border: `1px solid ${filter === f ? phase.color : "#E5E7EB"}`,
                        background: filter === f ? phase.lightColor : "#fff",
                        color: filter === f ? phase.color : "#6B7280",
                        cursor: "pointer", fontFamily: "inherit", fontWeight: filter === f ? 600 : 400,
                      }}>
                      {f === "all" ? "All" : f === "required" ? "Required" : STATUS_CONFIG[f]?.label || f}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>Click row to expand · Click icon to cycle status</div>
              </div>

              {filteredTasks.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>No tasks match this filter.</div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    status={taskStatuses[task.id] || "todo"}
                    onCycle={onCycleTask}
                    onStatusSet={onSetStatus}
                  />
                ))
              )}
            </Card>

            {/* Phase navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => onPhaseChange(Math.max(0, activePhaseIndex - 1))} disabled={activePhaseIndex === 0}
                style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: activePhaseIndex === 0 ? "not-allowed" : "pointer", opacity: activePhaseIndex === 0 ? .4 : 1, fontFamily: "inherit" }}>
                ← Previous phase
              </button>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                {isDesignPhase && !isLastPhase && !nextUnlocked && (
                  <div style={{ fontSize: 11, color: "#D97706", display: "flex", alignItems: "center", gap: 4 }}>
                    🔒 Upload BRD &amp; get approval to unlock Development phase
                  </div>
                )}
                <button
                  onClick={() => !isLastPhase && nextUnlocked && onPhaseChange(activePhaseIndex + 1)}
                  disabled={isLastPhase || !nextUnlocked}
                  style={{
                    padding: "9px 20px", borderRadius: 8, border: "none",
                    background: isLastPhase ? "#9CA3AF" : nextUnlocked ? phase.color : "#D97706",
                    color: "#fff", fontSize: 13, fontWeight: 600,
                    cursor: isLastPhase || !nextUnlocked ? "not-allowed" : "pointer",
                    opacity: isLastPhase ? .4 : 1, fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                  {isDesignPhase && !isLastPhase && !nextUnlocked ? "🔒 " : ""}Next phase →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
