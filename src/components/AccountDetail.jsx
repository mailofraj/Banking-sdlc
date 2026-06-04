import { formatCurrency } from "../data/mockData";

export default function AccountDetail({ account, user, onBack }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: "#6b7280", fontSize: 14, padding: "0 0 20px", fontFamily: "inherit",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to accounts
      </button>

      {/* Account card hero */}
      <div style={{
        background: account.color,
        borderRadius: 20, padding: "32px",
        marginBottom: 24, position: "relative", overflow: "hidden",
        boxShadow: `0 12px 40px ${account.color}55`,
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", right: 60, bottom: -60, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
            <div>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "0 0 4px", fontWeight: 500 }}>
                {account.type} Account
              </p>
              <p style={{ color: "white", fontSize: 18, margin: 0, letterSpacing: 3, fontFamily: "monospace" }}>
                {account.fullNumber}
              </p>
            </div>
            <span style={{
              background: "rgba(255,255,255,0.2)", color: "white",
              fontSize: 12, padding: "5px 12px", borderRadius: 20, fontWeight: 600,
            }}>
              {account.status}
            </span>
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "0 0 6px" }}>Current Balance</p>
            <p style={{ color: "white", fontSize: 40, fontWeight: 700, margin: 0, letterSpacing: "-1.5px" }}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Detail grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <DetailCard label="Available Balance" value={formatCurrency(account.availableBalance)} icon="💳" />
        <DetailCard label="Interest Rate (APY)" value={account.interestRate} icon="📈" />
        <DetailCard label="Account Opened" value={account.openedDate} icon="📅" />
        <DetailCard label="Account Number" value={account.number} icon="🔢" />
      </div>

      {/* Account holder */}
      <div style={{
        background: "white", borderRadius: 16, padding: "20px 24px",
        border: "1.5px solid #e5e7eb", marginBottom: 24,
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#374151", margin: "0 0 16px" }}>Account Holder</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <HolderRow label="Name" value={user.name} />
          <HolderRow label="Email" value={user.email} />
          <HolderRow label="Phone" value={user.phone} />
          <HolderRow label="Member Since" value={user.memberSince} />
        </div>
      </div>

      {/* Notice */}
      <div style={{
        background: "#f0f9ff", borderRadius: 12, padding: "14px 18px",
        border: "1px solid #bae6fd", display: "flex", gap: 12, alignItems: "flex-start",
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ fontSize: 13, color: "#0369a1", margin: 0, lineHeight: 1.5 }}>
          This is a demo account. No real transactions or funds are involved. For support, contact Nova Bank at 1-800-NOVA-BANK.
        </p>
      </div>
    </div>
  );
}

function DetailCard({ label, value, icon }) {
  return (
    <div style={{
      background: "white", borderRadius: 14, padding: "18px 20px",
      border: "1.5px solid #e5e7eb",
    }}>
      <div style={{ fontSize: 20, marginBottom: 8 }}>{icon}</div>
      <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 }}>{value}</p>
    </div>
  );
}

function HolderRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #f9fafb" }}>
      <span style={{ fontSize: 13, color: "#9ca3af" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{value}</span>
    </div>
  );
}
