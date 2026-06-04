import React, { useState, useRef } from "react";
import { PHASES, STATUS_CONFIG } from "../data/phases";
import { ProgressBar, Card } from "./shared/index.jsx";

function BRDSection({ documents, onUpload, onDelete }) {
  const inputRef = useRef();
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    setError("");
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError("Only PDF, DOC, or DOCX files are accepted.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("File must be under 20 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onUpload({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const fileIcon = (type) => {
    if (type?.includes("pdf")) return "📕";
    if (type?.includes("word") || type?.includes("doc")) return "📘";
    return "📄";
  };

  return (
    <Card style={{ marginBottom: 28 }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>📎 BRD Documents</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 10 }}>Business Requirements Documents</span>
        </div>
        <button onClick={() => inputRef.current.click()}
          style={{ fontSize: 12, padding: "6px 16px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6 }}>
          + Upload BRD
        </button>
        <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
          onChange={e => { handleFile(e.target.files[0]); e.target.value = ""; }} />
      </div>

      <div style={{ padding: "16px 20px" }}>
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
          style={{
            padding: "18px", borderRadius: 10, border: `2px dashed ${dragOver ? "#7C3AED" : "#E5E7EB"}`,
            background: dragOver ? "#F5F3FF" : "#FAFAFA", cursor: "pointer",
            textAlign: "center", transition: "all .15s", marginBottom: documents.length ? 16 : 0,
          }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>📄</div>
          <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
            Drop BRD here or <span style={{ color: "#7C3AED", textDecoration: "underline" }}>browse files</span>
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>PDF, DOC, DOCX — up to 20 MB</div>
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#DC2626", marginTop: 8, padding: "6px 12px", background: "#FEF2F2", borderRadius: 6, border: "1px solid #FCA5A5" }}>
            {error}
          </div>
        )}

        {/* Document list */}
        {documents.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {documents.map(doc => (
              <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff" }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{fileIcon(doc.type)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{formatSize(doc.size)} · Uploaded {doc.uploadedAt}</div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <a href={doc.dataUrl} download={doc.name}
                    style={{ fontSize: 12, padding: "5px 12px", borderRadius: 7, border: "1px solid #7C3AED", background: "#F5F3FF", color: "#7C3AED", textDecoration: "none", fontFamily: "inherit", fontWeight: 600 }}>
                    Download
                  </a>
                  <button onClick={() => onDelete(doc.id)}
                    style={{ fontSize: 12, padding: "5px 10px", borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {documents.length === 0 && (
          <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 10 }}>No BRD documents uploaded yet.</p>
        )}
      </div>
    </Card>
  );
}

function PhaseGateBadge({ gate }) {
  if (!gate) return <span style={{ fontSize: 11, color: "#9CA3AF" }}>—</span>;
  const { approvalStatus, brdDocument } = gate;

  if (approvalStatus === "approved")
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: "#ECFDF5", color: "#059669", border: "1px solid #6EE7B7" }}>✅ Approved</span>;
  if (approvalStatus === "pending")
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: "#FFFBEB", color: "#D97706", border: "1px solid #FCD34D" }}>⏳ Pending</span>;
  if (approvalStatus === "rejected")
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" }}>✕ Rejected</span>;
  if (brdDocument)
    return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: "#E0F2FE", color: "#0369A1", border: "1px solid #7DD3FC" }}>📎 BRD Uploaded</span>;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99, background: "#F9FAFB", color: "#6B7280", border: "1px solid #D1D5DB" }}>— No BRD</span>;
}

export function Dashboard({ getPhaseStats, getOverallStats, onNavigate, prStats, brdDocuments, onUploadBRD, onDeleteBRD, phaseGates, isPhaseUnlocked }) {
  const overall = getOverallStats();

  return (
    <div style={{ padding: "28px 28px", maxWidth: 1200, margin: "0 auto" }}>

      {/* Hero stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Overall progress", value: `${overall.pct}%`, sub: `${overall.done}/${overall.total} tasks`, color: "#7C3AED", bg: "#F5F3FF" },
          { label: "In progress",      value: overall.inprogress, sub: "tasks active",       color: "#D97706", bg: "#FFFBEB" },
          { label: "In review",        value: overall.review,     sub: "awaiting review",    color: "#7C3AED", bg: "#F5F3FF" },
          { label: "Blocked",          value: overall.blocked,    sub: "need attention",     color: "#DC2626", bg: "#FEF2F2" },
          { label: "PRs open",         value: (prStats.open || 0) + (prStats.review || 0), sub: "pull requests", color: "#0369A1", bg: "#E0F2FE" },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: "18px 20px", background: stat.bg, border: `1px solid ${stat.color}22` }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: stat.color, marginTop: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: stat.color + "99", marginTop: 2 }}>{stat.sub}</div>
          </Card>
        ))}
      </div>

      {/* Overall progress bar */}
      <Card style={{ padding: "20px 24px", marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#1E293B" }}>SDLC overall progress</span>
          <div style={{ display: "flex", gap: 14 }}>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6B7280" }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: v.color }} />
                {v.label}: <strong style={{ color: "#374151" }}>{overall[k] || 0}</strong>
              </div>
            ))}
          </div>
        </div>
        <ProgressBar pct={overall.pct} color="#7C3AED" height={10} />
      </Card>

      {/* BRD Documents */}
      <BRDSection documents={brdDocuments} onUpload={onUploadBRD} onDelete={onDeleteBRD} />

      {/* Phase grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, marginBottom: 28 }}>
        {PHASES.map((phase, i) => {
          const stats = getPhaseStats(phase);
          return (
            <Card key={phase.id} hover onClick={() => onNavigate("phases", i)} style={{ padding: "16px 14px", cursor: "pointer", borderTop: `3px solid ${phase.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: phase.color, textTransform: "uppercase", letterSpacing: ".05em" }}>
                  P{phase.id}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: stats.isComplete ? "#059669" : "#6B7280" }}>
                  {stats.pct}%
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", lineHeight: 1.3, marginBottom: 8 }}>
                {phase.shortLabel}
              </div>
              <ProgressBar pct={stats.pct} color={phase.color} height={4} />
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 6 }}>{stats.done}/{stats.total} tasks</div>
            </Card>
          );
        })}
      </div>

      {/* Phase detail table */}
      <Card>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>Phase status overview</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Phase", "Status", "Gate", "Progress", "Done", "In progress", "Blocked", "Duration", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#6B7280", fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "1px solid #F3F4F6" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PHASES.map((phase, i) => {
                const stats = getPhaseStats(phase);
                return (
                  <tr key={phase.id} style={{ borderBottom: "1px solid #F9FAFB" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#FAFBFF"}
                    onMouseLeave={e => e.currentTarget.style.background = ""}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 99, background: phase.color, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontWeight: 600, color: "#1E293B" }}>{phase.label}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF" }}>{phase.tasks.length} tasks</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 99,
                        background: stats.isComplete ? "#ECFDF5" : stats.inprogress > 0 ? "#FFFBEB" : "#F9FAFB",
                        color: stats.isComplete ? "#059669" : stats.inprogress > 0 ? "#D97706" : "#6B7280",
                      }}>
                        {stats.isComplete ? "Complete" : stats.inprogress > 0 ? "In progress" : "Not started"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <PhaseGateBadge gate={phaseGates?.[phase.key]} />
                    </td>
                    <td style={{ padding: "12px 16px", minWidth: 120 }}>
                      <ProgressBar pct={stats.pct} color={phase.color} height={5} />
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#059669" }}>{stats.done}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#D97706" }}>{stats.inprogress}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#DC2626" }}>{stats.blocked}</td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF" }}>{phase.estimatedDuration}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => onNavigate("phases", i)}
                        style={{ fontSize: 12, padding: "4px 12px", borderRadius: 6, border: `1px solid ${phase.color}44`, background: phase.lightColor, color: phase.color, cursor: "pointer", fontWeight: 500, fontFamily: "inherit" }}>
                        Open →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
