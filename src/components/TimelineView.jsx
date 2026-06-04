// src/components/TimelineView.jsx
import React from "react";
import { PHASES } from "../data/phases";
import { Card, ProgressBar } from "./shared/index.jsx";

const TIMELINE_WEEKS = [
  { phase: 1, start: 1,  end: 6,  label: "4–6 wks" },
  { phase: 2, start: 5,  end: 13, label: "6–8 wks" },
  { phase: 3, start: 12, end: 36, label: "16–24 wks" },
  { phase: 4, start: 30, end: 42, label: "8–12 wks" },
  { phase: 5, start: 41, end: 45, label: "2–4 wks" },
  { phase: 6, start: 44, end: 60, label: "Ongoing" },
  { phase: 7, start: 44, end: 60, label: "Annual" },
];

const TOTAL_WEEKS = 60;

export function TimelineView({ getPhaseStats, onNavigate }) {
  return (
    <div style={{ padding: "28px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, color: "#1E293B", margin: 0, marginBottom: 4 }}>Project timeline</h2>
        <p style={{ fontSize: 13, color: "#6B7280" }}>Estimated duration and phase overlap for a full banking SDLC implementation. Phases often run in parallel.</p>
      </div>

      {/* Gantt-style chart */}
      <Card style={{ padding: "24px", marginBottom: 24, overflow: "hidden" }}>
        {/* Week labels */}
        <div style={{ display: "flex", marginBottom: 20, paddingLeft: 160 }}>
          {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(w => (
            <div key={w} style={{ flex: 1, fontSize: 10, color: "#9CA3AF", textAlign: "left" }}>W{w}</div>
          ))}
        </div>

        {PHASES.map((phase) => {
          const stats = getPhaseStats(phase);
          const tw = TIMELINE_WEEKS.find(t => t.phase === phase.id);
          const startPct = ((tw.start - 1) / TOTAL_WEEKS) * 100;
          const widthPct = ((tw.end - tw.start) / TOTAL_WEEKS) * 100;

          return (
            <div key={phase.id} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
              <div style={{ width: 156, flexShrink: 0, paddingRight: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{phase.shortLabel}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF" }}>{tw.label}</div>
              </div>

              <div style={{ flex: 1, position: "relative", height: 32, background: "#F8FAFC", borderRadius: 6, overflow: "hidden" }}>
                {/* Grid lines */}
                {[1, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map(w => (
                  <div key={w} style={{ position: "absolute", left: `${((w - 1) / TOTAL_WEEKS) * 100}%`, top: 0, bottom: 0, width: 1, background: "#E5E7EB" }} />
                ))}

                {/* Phase bar */}
                <div
                  onClick={() => onNavigate("phases", phase.id - 1)}
                  title={`${phase.label} — ${stats.pct}% complete`}
                  style={{
                    position: "absolute",
                    left: `${startPct}%`,
                    width: `${widthPct}%`,
                    top: 4, bottom: 4,
                    background: `linear-gradient(90deg, ${phase.color}dd, ${phase.color}99)`,
                    borderRadius: 6,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transition: "opacity .15s",
                    overflow: "hidden",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = ".8"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  {/* Progress fill */}
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${stats.pct}%`, background: "rgba(255,255,255,.2)", transition: "width .5s" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", position: "relative", zIndex: 1, whiteSpace: "nowrap" }}>
                    {phase.shortLabel} {stats.pct}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Key milestones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <Card style={{ padding: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 14 }}>Key milestones</div>
          {[
            { week: 6,  label: "Planning complete",               phase: "Planning",   color: "#7C3AED" },
            { week: 13, label: "Architecture approved",            phase: "Design",     color: "#0369A1" },
            { week: 20, label: "Core banking MVP",                 phase: "Dev",        color: "#059669" },
            { week: 36, label: "Dev complete, handoff to QA",      phase: "Dev",        color: "#059669" },
            { week: 38, label: "Pen test completed",               phase: "Testing",    color: "#B45309" },
            { week: 42, label: "UAT sign-off",                     phase: "Testing",    color: "#B45309" },
            { week: 45, label: "Production go-live",               phase: "Deployment", color: "#7C3AED" },
          ].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: m.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: m.color }}>W{m.week}</span>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#1E293B" }}>{m.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.phase} phase</div>
              </div>
            </div>
          ))}
        </Card>

        <Card style={{ padding: "20px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B", marginBottom: 14 }}>Phase completion status</div>
          {PHASES.map((phase) => {
            const stats = getPhaseStats(phase);
            return (
              <div key={phase.id} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#374151" }}>{phase.shortLabel}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: stats.isComplete ? "#059669" : phase.color }}>{stats.pct}%</span>
                </div>
                <ProgressBar pct={stats.pct} color={phase.color} height={6} />
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 3 }}>{stats.done}/{stats.total} tasks · {phase.estimatedDuration}</div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Phase overlap note */}
      <Card style={{ padding: "16px 20px", background: "#F0F9FF", border: "1px solid #BAE6FD" }}>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ fontSize: 18 }}>ℹ</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#0C4A6E", marginBottom: 4 }}>About phase overlap</div>
            <p style={{ fontSize: 12, color: "#0369A1", lineHeight: 1.7, margin: 0 }}>
              In an Agile banking SDLC, phases overlap significantly. Development and testing run in parallel sprints. Compliance activities begin in planning and continue through production. 
              Monitoring and maintenance start as soon as the first module goes live. The timeline above shows earliest start and latest end for each phase.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
