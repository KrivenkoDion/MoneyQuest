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
    const confirmReset = confirm("Delete ALL users?");

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
        maxWidth: "420px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Admin Panel</h2>

      {/* ERROR */}
      {error && (
        <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>
      )}

      {/* STATS */}
      <div
        style={{
          background: "#fff",
          padding: "15px",
          borderRadius: "15px",
          marginBottom: "20px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
        }}
      >
        Total users: {users.length}
      </div>

      {/* RESET */}
      <button
        onClick={handleReset}
        style={{
          width: "100%",
          padding: "12px",
          background: "#ff4d4d",
          color: "white",
          border: "none",
          borderRadius: "12px",
          marginBottom: "20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Reset Database
      </button>

      {/* USERS */}
      {users.map((u) => (
        <div
          key={u.id}
          style={{
            background: "#fff",
            padding: "15px",
            borderRadius: "15px",
            marginBottom: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          <div style={{ fontWeight: "bold" }}>{u.email}</div>

          <div
            style={{
              marginTop: "5px",
              fontSize: "14px",
              color: u.role === "admin" ? "#4caf50" : "#999",
            }}
          >
            {u.role}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Admin;