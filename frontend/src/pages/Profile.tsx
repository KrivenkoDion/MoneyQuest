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
    return <h2 style={{ color: "white" }}>Загрузка...</h2>;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f1a",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          padding: 30,
          borderRadius: 16,
          background: "#161625",
          width: 350,
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
        }}
      >
        <h2 style={{ marginBottom: 20 }}>Профиль</h2>

        <p><b>Email:</b> {user.email}</p>

        <button
          onClick={handleLogout}
          style={{
            marginTop: 20,
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#e53935",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

export default Profile;