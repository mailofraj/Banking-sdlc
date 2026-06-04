// src/components/Header.jsx
import React from "react";

export function Header({ activeView, onViewChange, overallStats, openPRCount }) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "⊞" },
    { key: "phases",    label: "Phases",    icon: "◫" },
    { key: "prs",       label: "Pull Requests", icon: "⑂", badge: openPRCount },
    { key: "timeline",  label: "Timeline",  icon: "▤" },
  ];

  return (
    <header style={{
      background: "#0F1923",
      borderBottom: "1px solid #1E2D3D",
      padding: "0 28px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      height: 58,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: "linear-gradient(135deg, #1E3A5F 0%, #7C3AED 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, color: "#fff",
        }}>
          ⬡
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#F1F5F9", letterSpacing: "-0.02em" }}>
            Banking SDLC
          </div>
          <div style={{ fontSize: 10, color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Lifecycle Manager
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", gap: 2 }}>
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "6px 14px", borderRadius: 8,
              border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
              background: activeView === item.key ? "#1E2D3D" : "transparent",
              color: activeView === item.key ? "#F1F5F9" : "#64748B",
              transition: "all .15s",
              position: "relative",
            }}
          >
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
            {item.badge > 0 && (
              <span style={{
                background: "#DC2626", color: "#fff", borderRadius: 99,
                fontSize: 10, fontWeight: 700,
                width: 17, height: 17,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
              }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Progress indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 80, height: 4, background: "#1E2D3D", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${overallStats.pct}%`, background: "linear-gradient(90deg,#7C3AED,#059669)", borderRadius: 99, transition: "width .5s" }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>
            {overallStats.pct}%
          </span>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "#1E2D3D",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#94A3B8",
        }}>
          ⚙
        </div>
      </div>
    </header>
  );
}
