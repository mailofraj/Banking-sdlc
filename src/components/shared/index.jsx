import React from "react";
import { STATUS_CONFIG } from "../../data/phases";

export function Badge({ children, color = "#6B7280", bg = "#F9FAFB", border, small }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      fontSize: small ? 10 : 11, fontWeight: 600,
      padding: small ? "1px 6px" : "2px 8px",
      borderRadius: 99,
      background: bg,
      color,
      border: `1px solid ${border || color + "44"}`,
      whiteSpace: "nowrap",
      letterSpacing: "0.02em",
    }}>
      {children}
    </span>
  );
}

// src/components/shared/Button.jsx
export function Button({ children, onClick, variant = "default", size = "md", disabled, icon, style: extraStyle }) {
  const variants = {
    default: { background: "#fff", color: "#374151", border: "1px solid #D1D5DB" },
    primary: { background: "#1E3A5F", color: "#fff", border: "none" },
    success: { background: "#059669", color: "#fff", border: "none" },
    danger:  { background: "#DC2626", color: "#fff", border: "none" },
    ghost:   { background: "transparent", color: "#6B7280", border: "1px solid transparent" },
    purple:  { background: "#7C3AED", color: "#fff", border: "none" },
  };
  const sizes = {
    sm: { padding: "4px 12px", fontSize: 12 },
    md: { padding: "7px 16px", fontSize: 13 },
    lg: { padding: "10px 22px", fontSize: 14 },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      borderRadius: 8, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.4 : 1, transition: "all .15s", fontFamily: "inherit",
      ...variants[variant], ...sizes[size], ...extraStyle,
    }}>
      {icon && <span style={{ fontSize: sizes[size].fontSize + 2 }}>{icon}</span>}
      {children}
    </button>
  );
}

// src/components/shared/ProgressBar.jsx
export function ProgressBar({ pct, color, height = 6, showLabel }) {
  return (
    <div>
      {showLabel && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
          <span>{pct}% complete</span>
        </div>
      )}
      <div style={{ height, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${Math.min(100, pct)}%`,
          background: color || "#1E3A5F",
          borderRadius: 99, transition: "width .5s ease",
        }} />
      </div>
    </div>
  );
}

// src/components/shared/Card.jsx
export function Card({ children, style, onClick, hover }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 12,
        transition: "box-shadow .2s, transform .2s",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,.1)" : "0 1px 4px rgba(0,0,0,.04)",
        transform: hovered ? "translateY(-2px)" : "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// src/components/shared/StatusBadge.jsx
export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.todo;
  const icons = { todo: "○", inprogress: "◑", review: "◈", done: "●", blocked: "✕" };
  return (
    <Badge color={cfg.color} bg={cfg.bg} border={cfg.border}>
      <span style={{ marginRight: 4 }}>{icons[status]}</span>
      {cfg.label}
    </Badge>
  );
}

// src/components/shared/CheckBadge.jsx
export function CheckBadge({ status }) {
  const cfg = {
    pass:    { color: "#059669", bg: "#ECFDF5", label: "Pass" },
    fail:    { color: "#DC2626", bg: "#FEF2F2", label: "Fail" },
    running: { color: "#D97706", bg: "#FFFBEB", label: "Running…" },
    pending: { color: "#6B7280", bg: "#F9FAFB", label: "Pending" },
  }[status] || { color: "#6B7280", bg: "#F9FAFB", label: status };
  return <Badge color={cfg.color} bg={cfg.bg} small>{cfg.label}</Badge>;
}

// src/components/shared/Notification.jsx
export function NotificationStack({ notifications, onDismiss }) {
  if (!notifications.length) return null;
  const typeConfig = {
    success: { bg: "#ECFDF5", border: "#6EE7B7", color: "#065F46", icon: "✓" },
    error:   { bg: "#FEF2F2", border: "#FCA5A5", color: "#991B1B", icon: "✕" },
    warn:    { bg: "#FFFBEB", border: "#FCD34D", color: "#92400E", icon: "⚠" },
    info:    { bg: "#E0F2FE", border: "#7DD3FC", color: "#0C4A6E", icon: "ℹ" },
  };
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {notifications.map((n) => {
        const cfg = typeConfig[n.type] || typeConfig.info;
        return (
          <div key={n.id} onClick={() => onDismiss(n.id)} style={{
            padding: "10px 16px", borderRadius: 10,
            background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
            fontSize: 13, fontWeight: 500,
            boxShadow: "0 4px 20px rgba(0,0,0,.12)",
            display: "flex", alignItems: "center", gap: 8,
            cursor: "pointer", maxWidth: 360,
            animation: "slideInRight .2s ease",
          }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>{cfg.icon}</span>
            {n.message}
          </div>
        );
      })}
    </div>
  );
}
