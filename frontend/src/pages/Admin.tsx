import { useEffect, useState } from "react";

function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://moneyquest-pcoq.onrender.com/admin/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error");
          return;
        }

        setUsers(data);
      })
      .catch(() => setError("Server error"));
  }, []);

  const handleReset = async () => {
    const confirmReset = confirm("Ты точно хочешь удалить ВСЮ базу?");

    if (!confirmReset) return;

    const res = await fetch("https://moneyquest-pcoq.onrender.com/admin/reset", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    alert(data.message);
    window.location.reload();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "white",
        padding: "30px",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ marginBottom: "20px" }}>Admin Dashboard</h1>

      {/* ERROR */}
      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* STATS */}
      <div style={{ marginBottom: "20px", opacity: 0.8 }}>
        Total users: {users.length}
      </div>

      {/* RESET BUTTON */}
      <button
        onClick={handleReset}
        style={{
          background: "linear-gradient(135deg, #ff4d4d, #ff0000)",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "10px",
          marginBottom: "30px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Reset Database
      </button>

      {/* TABLE */}
      <div
        style={{
          background: "#1a1a2e",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            padding: "15px",
            background: "#111",
            fontWeight: "bold",
          }}
        >
          <div>Email</div>
          <div>Role</div>
        </div>

        {/* USERS */}
        {users.map((u, index) => (
          <div
            key={u.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              padding: "15px",
              borderTop: "1px solid #333",
              background: index % 2 === 0 ? "#1a1a2e" : "#161625",
            }}
          >
            <div>{u.email}</div>
            <div style={{ color: u.role === "admin" ? "#4caf50" : "#aaa" }}>
              {u.role}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;