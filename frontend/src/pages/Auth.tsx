import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = () => {
    navigate("/home");
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
        {/* Заголовок */}
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
              transition: "0.2s",
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
              transition: "0.2s",
            }}
          >
            Register
          </button>
        </div>

        {/* Name */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            style={{
              width: "100%",
              padding: 12,
              marginBottom: 12,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "#1f1f2e",
              color: "white",
              outline: "none",
            }}
          />
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 12,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#1f1f2e",
            color: "white",
            outline: "none",
          }}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 20,
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#1f1f2e",
            color: "white",
            outline: "none",
          }}
        />

        {/* Кнопка */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 10,
            border: "none",
            background: "#4CAF50",
            color: "white",
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            transition: "0.2s",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.background = "#43a047")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.background = "#4CAF50")
          }
        >
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}

export default Auth;