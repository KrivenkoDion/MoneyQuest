import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        // LOGIN через backend
        const res = await fetch("http://localhost:3000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        localStorage.setItem("token", data.token);
        navigate("/home");

      } else {
        // REGISTER через backend
        if (!name || !email || !password) {
          alert("Заполни все поля");
          return;
        }

        const res = await fetch("http://localhost:3000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        alert("Аккаунт создан! Теперь войди");
        setIsLogin(true);
      }

    } catch (err) {
      console.error(err);
      alert("Ошибка сервера");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #0f0f1a, #1a1a2e)",
        fontFamily: "Inter, Arial",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 30,
          borderRadius: 16,
          background: "#161625",
          boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: 30,
            fontSize: 28,
            fontWeight: 600,
            color: "#ffffff",
            letterSpacing: 1,
          }}
        >
          MoneyQuest
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            marginBottom: 25,
            background: "#1f1f2e",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: 10,
              background: isLogin ? "#2a2a3d" : "transparent",
              border: "none",
              color: isLogin ? "#fff" : "#888",
              cursor: "pointer",
            }}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: 10,
              background: !isLogin ? "#2a2a3d" : "transparent",
              border: "none",
              color: !isLogin ? "#fff" : "#888",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>

        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSubmit} style={buttonStyle}>
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  marginBottom: 12,
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "#1f1f2e",
  color: "white",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  padding: 14,
  borderRadius: 10,
  border: "none",
  background: "#4CAF50",
  color: "white",
  fontSize: 16,
  fontWeight: 500,
  cursor: "pointer",
};

export default Auth;