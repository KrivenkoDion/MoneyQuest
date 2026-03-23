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
        background: "radial-gradient(circle at top, #1a1a2e, #0f0f1a)",
        fontFamily: "Arial",
        color: "white",
      }}
    >
      <div
        style={{
          width: 320,
          padding: 30,
          borderRadius: 20,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 0 30px rgba(0,255,255,0.2)",
          border: "1px solid rgba(0,255,255,0.3)",
        }}
      >
        {/* Заголовок */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: 20,
            color: "#00f5ff",
            textShadow: "0 0 10px #00f5ff, 0 0 20px #00f5ff",
          }}
        >
          MoneyQuest 💰
        </h1>

        {/* Tabs */}
        <div style={{ display: "flex", marginBottom: 20 }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: 10,
              background: isLogin ? "#00f5ff" : "transparent",
              border: "none",
              color: isLogin ? "black" : "#00f5ff",
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
              background: !isLogin ? "#ff00ff" : "transparent",
              border: "none",
              color: !isLogin ? "black" : "#ff00ff",
              cursor: "pointer",
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
              marginBottom: 10,
              borderRadius: 10,
              border: "1px solid #00f5ff",
              background: "transparent",
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
            marginBottom: 10,
            borderRadius: 10,
            border: "1px solid #00f5ff",
            background: "transparent",
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
            border: "1px solid #ff00ff",
            background: "transparent",
            color: "white",
            outline: "none",
          }}
        />

        {/* Кнопка */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg, #00f5ff, #ff00ff)",
            color: "black",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 0 15px #00f5ff",
          }}
        >
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}

export default Auth;
