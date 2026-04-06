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

        console.log("USERS:", data);

        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }

        setUsers(data);
      })
      .catch((err) => {
        console.error("ERROR:", err);
        setError("Failed to fetch users");
      });
  }, []);

  return (
    <div style={{ padding: 20, color: "white" }}>
      <h1>Admin Panel</h1>

      {/* Ошибка */}
      {error && (
        <p style={{ color: "red", marginBottom: 20 }}>
          {error}
        </p>
      )}

      {/* Нет пользователей */}
      {!error && users.length === 0 && (
        <p>No users found</p>
      )}

      {/* Список пользователей */}
      {users.map((u) => (
        <div
          key={u.id}
          style={{
            background: "#1f1f2e",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "10px",
          }}
        >
          <p>Email: {u.email}</p>
          <p>Role: {u.role}</p>
        </div>
      ))}
    </div>
  );
}

export default Admin;