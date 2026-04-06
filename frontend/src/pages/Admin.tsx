import { useEffect, useState } from "react";

function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("https://moneyquest-pcoq.onrender.com/migrate", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      {users.map((u) => (
        <div key={u.id}>
          {u.email} — {u.role}
        </div>
      ))}
    </div>
  );
}

export default Admin;