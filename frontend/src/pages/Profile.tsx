import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    fetch("https://moneyquest-pcoq.onrender.com/profile", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          navigate("/");
        } else {
          setUser(data.user);
        }
      })
      .catch(() => navigate("/"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  if (!user) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f0", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#999" }}>Загрузка...</p>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : user.email[0].toUpperCase();

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f5f5f0",
      maxWidth: 390,
      margin: "0 auto",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* HEADER */}
      <div style={{
        padding: "20px 24px 0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: 16 }}>MoneyQuest</span>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "#e8e8e0", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>🔔</div>
      </div>

      {/* PROFILE CARD */}
      <div style={{ padding: "24px 24px 0" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 8,
        }}>
          {/* AVATAR */}
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "#1a1a2e", color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700,
          }}>
            {initials}
          </div>

          <div>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a2e" }}>
              {user.name || "Пользователь"}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "#999" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* MILESTONE */}
        <div style={{
          background: "white",
          borderRadius: 16,
          padding: "16px 20px",
          marginTop: 20,
        }}>
          <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>
            Current Milestone
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: "#1a1a2e" }}>Beginner</span>
            <span style={{ fontSize: 13, color: "#999" }}>Level 1</span>
          </div>
          <div style={{
            marginTop: 10, height: 6, borderRadius: 3,
            background: "#f0f0ea",
          }}>
            <div style={{
              width: "10%", height: "100%",
              borderRadius: 3, background: "#1a1a2e",
            }} />
          </div>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#999" }}>0 XP until next level</p>
        </div>

        {/* STATS */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, marginTop: 12,
        }}>
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Total Saved</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>$0</p>
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Achievements</p>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>0 🏅</p>
          </div>
        </div>

        {/* PERSONAL INFO */}
        <div style={{ background: "white", borderRadius: 16, padding: "8px 0", marginTop: 12 }}>
          <p style={{ margin: "8px 20px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Personal Info</p>

          {[
            { label: "Account Details", icon: "👤" },
            { label: "Linked Banks", icon: "🏦" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid #f5f5f0",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "#1a1a2e" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc" }}>›</span>
            </div>
          ))}
        </div>

        {/* SETTINGS */}
        <div style={{ background: "white", borderRadius: 16, padding: "8px 0", marginTop: 12 }}>
          <p style={{ margin: "8px 20px", fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1 }}>Settings</p>

          {[
            { label: "Security & Privacy", icon: "🔒" },
            { label: "Notifications", icon: "🔔" },
            { label: "Appearance", icon: "🌙" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 20px",
              borderTop: "1px solid #f5f5f0",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 15, color: "#1a1a2e" }}>{item.label}</span>
              </div>
              <span style={{ color: "#ccc" }}>›</span>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          style={{
            marginTop: 16,
            marginBottom: 32,
            width: "100%",
            padding: 16,
            borderRadius: 14,
            border: "none",
            background: "#fff0f0",
            color: "#e53935",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

export default Profile;