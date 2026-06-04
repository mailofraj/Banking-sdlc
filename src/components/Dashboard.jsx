import { ACCOUNTS, formatCurrency } from "../data/mockData";

export default function Dashboard({ user, onSelectAccount }) {
  const accounts = ACCOUNTS[user.id] || [];
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      {/* Welcome banner */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%)",
        borderRadius: 20, padding: "28px 32px", marginBottom: 32,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: 16,
        boxShadow: "0 8px 32px rgba(30,58,95,0.25)",
      }}>
        <div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, margin: "0 0 4px" }}>Good day,</p>
          <h2 style={{ color: "white", fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.3px" }}>
            {user.name}
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, margin: 0 }}>
            Member since {user.memberSince}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: "0 0 4px" }}>Total Balance</p>
          <p style={{ color: "white", fontSize: 32, fontWeight: 700, margin: 0, letterSpacing: "-1px" }}>
            {formatCurrency(totalBalance)}
          </p>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>
            Across {accounts.length} accounts
          </p>
        </div>
      </div>

      {/* Section title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 }}>My Accounts</h3>
        <span style={{
          fontSize: 12, color: "#6b7280", background: "#f3f4f6",
          padding: "4px 10px", borderRadius: 20,
        }}>
          {accounts.length} accounts
        </span>
      </div>

      {/* Account cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} onClick={() => onSelectAccount(account)} />
        ))}
      </div>

      {/* Quick info tiles */}
      <div style={{
        marginTop: 32, display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16,
      }}>
        <InfoTile
          icon={<ShieldIcon />}
          title="Secure Banking"
          desc="256-bit SSL encryption protects all your transactions."
          color="#4F46E5"
        />
        <InfoTile
          icon={<ClockIcon />}
          title="24/7 Support"
          desc="Our team is always available to help you."
          color="#059669"
        />
        <InfoTile
          icon={<BellIcon />}
          title="Instant Alerts"
          desc="Get notified immediately for any account activity."
          color="#d97706"
        />
      </div>
    </div>
  );
}

function AccountCard({ account, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "white", border: "1.5px solid #e5e7eb",
        borderRadius: 18, padding: 0,
        cursor: "pointer", textAlign: "left", width: "100%",
        overflow: "hidden", transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
      }}
    >
      {/* Coloured header */}
      <div style={{
        background: account.color, padding: "20px 22px 18px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", right: -20, top: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "absolute", right: 20, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, margin: "0 0 2px", fontWeight: 500 }}>
              {account.type} Account
            </p>
            <p style={{ color: "white", fontSize: 14, margin: 0, letterSpacing: 1 }}>{account.number}</p>
          </div>
          <span style={{ background: "rgba(255,255,255,0.2)", color: "white", fontSize: 11, padding: "3px 8px", borderRadius: 20, fontWeight: 500 }}>
            {account.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "18px 22px 20px" }}>
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 4px" }}>Current Balance</p>
        <p style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
          {formatCurrency(account.balance)}
        </p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>Available</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>{formatCurrency(account.availableBalance)}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 2px" }}>Interest Rate</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#374151", margin: 0 }}>{account.interestRate} APY</p>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#6b7280" }}>View details</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </button>
  );
}

function InfoTile({ icon, title, desc, color }) {
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1.5px solid #f3f4f6", display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", color }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827", margin: "0 0 3px" }}>{title}</p>
        <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.5 }}>{desc}</p>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
