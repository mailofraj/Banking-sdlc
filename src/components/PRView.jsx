// src/components/PRView.jsx
import React, { useState } from "react";
import { PHASES } from "../data/phases";
import { LABEL_COLORS, PR_CHECKLIST_ITEMS } from "../data/pullRequests";
import { Card, Badge, CheckBadge } from "./shared/index.jsx";

const STATUS_META = {
  open:   { color: "#0369A1", bg: "#E0F2FE", border: "#7DD3FC", label: "Open" },
  review: { color: "#D97706", bg: "#FFFBEB", border: "#FCD34D", label: "In Review" },
  merged: { color: "#059669", bg: "#ECFDF5", border: "#6EE7B7", label: "Merged" },
  closed: { color: "#6B7280", bg: "#F9FAFB", border: "#D1D5DB", label: "Closed" },
};

function PRCard({ pr, onRequestReview, onApprove, onMerge, onClose, onRunChecks }) {
  const [expanded, setExpanded] = useState(false);
  const meta = STATUS_META[pr.status];
  const canMerge = pr.status === "review" && pr.approvals >= pr.requiredApprovals;

  return (
    <Card style={{ marginBottom: 10, overflow: "hidden" }}>
      <div style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ fontSize: 18, color: meta.color, flexShrink: 0, marginTop: 1 }}>⑂</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: "#1E293B" }}>{pr.title}</span>
              <Badge color={meta.color} bg={meta.bg} border={meta.border}>{meta.label}</Badge>
            </div>

            <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4, display: "flex", flexWrap: "wrap", gap: 12 }}>
              <span>#{pr.number}</span>
              <span>by <strong>{pr.author}</strong></span>
              <span>{pr.phaseLabel}</span>
              {pr.linkedTicket && <span>🎫 {pr.linkedTicket}</span>}
              {pr.brdDocument && <span style={{ color: "#7C3AED" }}>📎 BRD</span>}
              <span>📄 {pr.files} files</span>
              <span style={{ color: "#059669" }}>+{pr.additions}</span>
              <span style={{ color: "#DC2626" }}>-{pr.deletions}</span>
              {pr.mergedAt && <span>merged {pr.mergedAt}</span>}
            </div>

            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              {pr.labels.map(label => {
                const lc = LABEL_COLORS[label] || { bg: "#F3F4F6", color: "#374151" };
                return <Badge key={label} color={lc.color} bg={lc.bg} small>{label}</Badge>;
              })}
            </div>

            {/* CI checks */}
            <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#9CA3AF" }}>Checks:</span>
              {Object.entries(pr.checks).map(([k, v]) => (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
                  <span style={{ color: "#6B7280", textTransform: "uppercase" }}>{k}</span>
                  <CheckBadge status={v} />
                </div>
              ))}
              <div style={{ marginLeft: "auto", fontSize: 11, color: "#9CA3AF" }}>
                {pr.approvals}/{pr.requiredApprovals} approvals
                {pr.approvals >= pr.requiredApprovals ? " ✓" : ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #F3F4F6", padding: "16px 18px", background: "#FAFBFF" }}>
          {pr.description && (
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, marginBottom: 14 }}>{pr.description}</p>
          )}

          {pr.brdDocument && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "1px solid #C4B5FD", background: "#F5F3FF", marginBottom: 14 }}>
              <span style={{ fontSize: 20 }}>📎</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#5B21B6", letterSpacing: ".04em", textTransform: "uppercase", marginBottom: 1 }}>BRD Document</div>
                <div style={{ fontSize: 13, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pr.brdDocument.name}</div>
              </div>
              <a href={pr.brdDocument.dataUrl} download={pr.brdDocument.name}
                style={{ fontSize: 12, padding: "5px 14px", borderRadius: 7, border: "1px solid #7C3AED", background: "#7C3AED", color: "#fff", textDecoration: "none", fontFamily: "inherit", fontWeight: 600, flexShrink: 0 }}>
                Download
              </a>
            </div>
          )}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {pr.status === "open" && (
              <>
                <button onClick={() => onRequestReview(pr.id)}
                  style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>
                  👁 Request review
                </button>
                <button onClick={() => onRunChecks(pr.id)}
                  style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "1px solid #D1D5DB", background: "#fff", cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>
                  ▶ Run CI checks
                </button>
              </>
            )}
            {pr.status === "review" && (
              <>
                <button onClick={() => onApprove(pr.id)}
                  style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "1px solid #6EE7B7", background: "#ECFDF5", cursor: "pointer", color: "#059669", fontFamily: "inherit", fontWeight: 600 }}>
                  ✓ Approve
                </button>
                <button onClick={() => onMerge(pr.id)} disabled={!canMerge}
                  style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "none", background: canMerge ? "#059669" : "#9CA3AF", cursor: canMerge ? "pointer" : "not-allowed", color: "#fff", fontFamily: "inherit", fontWeight: 600 }}>
                  ⑂ {canMerge ? "Merge PR" : `Need ${pr.requiredApprovals - pr.approvals} more approval(s)`}
                </button>
              </>
            )}
            {(pr.status === "open" || pr.status === "review") && (
              <button onClick={() => onClose(pr.id)}
                style={{ fontSize: 12, padding: "6px 14px", borderRadius: 7, border: "1px solid #FCA5A5", background: "#FEF2F2", cursor: "pointer", color: "#DC2626", fontFamily: "inherit" }}>
                ✕ Close PR
              </button>
            )}
            {pr.status === "merged" && (
              <Badge color="#059669" bg="#ECFDF5" border="#6EE7B7">✓ Merged to {pr.base}</Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function BRDUpload({ value, onChange }) {
  const inputRef = React.useRef();
  const [dragOver, setDragOver] = React.useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      alert("Only PDF, DOC, or DOCX files are accepted.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onChange({ name: file.name, size: file.size, type: file.type, dataUrl: e.target.result });
    reader.readAsDataURL(file);
  };

  const formatSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>
        BRD Document <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(PDF, DOC, DOCX)</span>
      </label>
      {value ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, border: "1px solid #6EE7B7", background: "#ECFDF5" }}>
          <span style={{ fontSize: 20 }}>📎</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#065F46", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value.name}</div>
            <div style={{ fontSize: 11, color: "#6B7280" }}>{formatSize(value.size)}</div>
          </div>
          <button onClick={() => onChange(null)}
            style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current.click()}
          style={{
            padding: "20px", borderRadius: 8, border: `2px dashed ${dragOver ? "#7C3AED" : "#D1D5DB"}`,
            background: dragOver ? "#F5F3FF" : "#FAFAFA", cursor: "pointer",
            textAlign: "center", transition: "all .15s",
          }}>
          <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
          <div style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Drop BRD here or <span style={{ color: "#7C3AED", textDecoration: "underline" }}>browse</span></div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>PDF, DOC, DOCX up to 20 MB</div>
          <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }}
            onChange={e => handleFile(e.target.files[0])} />
        </div>
      )}
    </div>
  );
}

function NewPRForm({ onSubmit, onCancel, defaultPhase }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    branch: `feature/`,
    phase: defaultPhase?.key || "development",
    phaseLabel: defaultPhase?.label || "Development",
    author: "you",
    linkedTicket: "",
    labels: [],
    brdDocument: null,
  });
  const [labelInput, setLabelInput] = useState("");

  const handlePhaseChange = (key) => {
    const ph = PHASES.find(p => p.key === key);
    setForm(f => ({ ...f, phase: key, phaseLabel: ph?.label || key }));
  };

  const addLabel = (l) => {
    if (l && !form.labels.includes(l)) setForm(f => ({ ...f, labels: [...f.labels, l] }));
    setLabelInput("");
  };

  return (
    <Card style={{ marginBottom: 16, border: "1px solid #C4B5FD", padding: "20px 22px" }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: "#1E293B" }}>⑂ Open a pull request</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Title *</label>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="feat: describe your change…"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Description</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Describe the changes, motivation, and any relevant context…"
            rows={3}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Branch</label>
          <input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "monospace", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Phase</label>
          <select value={form.phase} onChange={e => handlePhaseChange(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "inherit", background: "#fff", boxSizing: "border-box" }}>
            {PHASES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Author</label>
          <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Linked ticket</label>
          <input value={form.linkedTicket} onChange={e => setForm(f => ({ ...f, linkedTicket: e.target.value }))}
            placeholder="BANK-123"
            style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #D1D5DB", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <BRDUpload value={form.brdDocument} onChange={doc => setForm(f => ({ ...f, brdDocument: doc }))} />
        </div>

        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 4 }}>Labels</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
            {form.labels.map(l => {
              const lc = LABEL_COLORS[l] || { bg: "#F3F4F6", color: "#374151" };
              return (
                <Badge key={l} color={lc.color} bg={lc.bg} small>
                  {l}
                  <span style={{ marginLeft: 4, cursor: "pointer" }} onClick={() => setForm(f => ({ ...f, labels: f.labels.filter(x => x !== l) }))}>×</span>
                </Badge>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input value={labelInput} onChange={e => setLabelInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addLabel(labelInput.trim()); }}
              placeholder="Type label and press Enter"
              style={{ flex: 1, padding: "6px 10px", borderRadius: 7, border: "1px solid #D1D5DB", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {["security", "backend", "frontend", "testing", "bug", "core-banking"].map(l => (
                <button key={l} onClick={() => addLabel(l)}
                  style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, border: "1px solid #E5E7EB", background: "#F8FAFC", cursor: "pointer", fontFamily: "inherit", color: "#374151" }}>
                  + {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => form.title.trim() && onSubmit(form)} disabled={!form.title.trim()}
          style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: form.title.trim() ? "#7C3AED" : "#9CA3AF", color: "#fff", fontSize: 13, fontWeight: 600, cursor: form.title.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
          Create pull request
        </button>
        <button onClick={onCancel}
          style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #E5E7EB", background: "#fff", fontSize: 13, cursor: "pointer", color: "#374151", fontFamily: "inherit" }}>
          Cancel
        </button>
      </div>
    </Card>
  );
}

export function PRView({ prs, onCreatePR, onRequestReview, onApprove, onMerge, onClose, onRunChecks, getPRStats, initialFormPhase, onClearInitialPhase, notify }) {
  const [showForm, setShowForm] = useState(!!initialFormPhase);
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const stats = getPRStats();

  const handleCreate = (data) => {
    onCreatePR(data);
    setShowForm(false);
    onClearInitialPhase && onClearInitialPhase();
    notify("Pull request created successfully!", "success");
  };

  const handleMerge = (id) => { onMerge(id); notify("PR merged to main ✓", "success"); };
  const handleClose = (id) => { onClose(id); notify("PR closed", "warn"); };
  const handleReview = (id) => { onRequestReview(id); notify("Review requested", "info"); };
  const handleApprove = (id) => { onApprove(id); notify("PR approved ✓", "success"); };
  const handleRunChecks = (id) => { onRunChecks(id); notify("CI checks running…", "info"); };

  const filtered = prs.filter(pr => {
    if (statusFilter !== "all" && pr.status !== statusFilter) return false;
    if (phaseFilter !== "all" && pr.phase !== phaseFilter) return false;
    return true;
  });

  const grouped = {};
  ["open", "review", "merged", "closed"].forEach(s => {
    grouped[s] = filtered.filter(pr => pr.status === s);
  });

  return (
    <div style={{ padding: "24px 28px", maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
      <div>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["all", "open", "review", "merged", "closed"].map(s => {
              const meta = s === "all" ? { label: `All (${prs.length})`, color: "#374151" } : { label: `${STATUS_META[s].label} (${stats[s] || 0})`, color: STATUS_META[s].color };
              return (
                <button key={s} onClick={() => setStatusFilter(s)}
                  style={{ fontSize: 12, padding: "5px 13px", borderRadius: 99, border: `1px solid ${statusFilter === s ? meta.color : "#E5E7EB"}`, background: statusFilter === s ? meta.color + "18" : "#fff", color: statusFilter === s ? meta.color : "#6B7280", cursor: "pointer", fontFamily: "inherit", fontWeight: statusFilter === s ? 600 : 400 }}>
                  {meta.label}
                </button>
              );
            })}
          </div>
          <button onClick={() => setShowForm(true)}
            style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
            + New PR
          </button>
        </div>

        {showForm && (
          <NewPRForm
            onSubmit={handleCreate}
            onCancel={() => { setShowForm(false); onClearInitialPhase && onClearInitialPhase(); }}
            defaultPhase={initialFormPhase}
          />
        )}

        {["open", "review", "merged", "closed"].map(status => {
          const group = grouped[status];
          if (!group.length) return null;
          const meta = STATUS_META[status];
          return (
            <div key={status} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: meta.color }} />
                {meta.label} ({group.length})
              </div>
              {group.map(pr => (
                <PRCard key={pr.id} pr={pr}
                  onRequestReview={handleReview} onApprove={handleApprove}
                  onMerge={handleMerge} onClose={handleClose} onRunChecks={handleRunChecks} />
              ))}
            </div>
          );
        })}

        {filtered.length === 0 && !showForm && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF", fontSize: 14 }}>
            No pull requests match this filter.<br />
            <button onClick={() => setShowForm(true)}
              style={{ marginTop: 12, fontSize: 13, padding: "8px 18px", borderRadius: 8, border: "none", background: "#7C3AED", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
              Create the first PR
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div>
        {/* Stats */}
        <Card style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "#1E293B" }}>PR summary</div>
          {Object.entries(STATUS_META).map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #F9FAFB", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 99, background: v.color }} />
                <span style={{ fontSize: 13, color: "#374151" }}>{v.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: v.color }}>{stats[k] || 0}</span>
            </div>
          ))}
        </Card>

        {/* Checklist */}
        <Card style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "#1E293B" }}>PR merge checklist</div>
          {PR_CHECKLIST_ITEMS.map(item => (
            <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", fontSize: 12 }}>
              <span style={{ color: "#059669", flexShrink: 0, marginTop: 1 }}>✓</span>
              <span style={{ color: "#374151", lineHeight: 1.4 }}>
                {item.label}
                {item.required && <span style={{ color: "#DC2626", marginLeft: 4, fontSize: 10, fontWeight: 700 }}>*</span>}
              </span>
            </div>
          ))}
          <p style={{ fontSize: 10, color: "#9CA3AF", marginTop: 8 }}>* Required for all PRs in banking systems</p>
        </Card>

        {/* Filter by phase */}
        <Card style={{ padding: "16px 18px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#1E293B" }}>Filter by phase</div>
          <button onClick={() => setPhaseFilter("all")}
            style={{ display: "block", width: "100%", textAlign: "left", fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "none", background: phaseFilter === "all" ? "#F5F3FF" : "transparent", color: phaseFilter === "all" ? "#7C3AED" : "#374151", cursor: "pointer", fontFamily: "inherit", marginBottom: 2 }}>
            All phases
          </button>
          {PHASES.map(ph => (
            <button key={ph.key} onClick={() => setPhaseFilter(ph.key)}
              style={{ display: "block", width: "100%", textAlign: "left", fontSize: 12, padding: "5px 8px", borderRadius: 6, border: "none", background: phaseFilter === ph.key ? ph.lightColor : "transparent", color: phaseFilter === ph.key ? ph.color : "#374151", cursor: "pointer", fontFamily: "inherit", marginBottom: 2 }}>
              {ph.shortLabel} ({prs.filter(p => p.phase === ph.key).length})
            </button>
          ))}
        </Card>
      </div>
    </div>
  );
}
