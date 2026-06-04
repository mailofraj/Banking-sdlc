import { useState } from "react";
import Login from "./components/Login";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import AccountDetail from "./components/AccountDetail";

export default function App() {
  const [user, setUser] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  function handleLogin(loggedInUser) {
    setUser(loggedInUser);
    setSelectedAccount(null);
  }

  function handleLogout() {
    setUser(null);
    setSelectedAccount(null);
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <Header user={user} onLogout={handleLogout} />
      <main>
        {selectedAccount ? (
          <AccountDetail
            account={selectedAccount}
            user={user}
            onBack={() => setSelectedAccount(null)}
          />
        ) : (
          <Dashboard user={user} onSelectAccount={setSelectedAccount} />
        )}
      </main>
    </div>
  );
}
