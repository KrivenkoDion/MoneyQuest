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
        background: "radial-gradient(circle at 30% 20%, #2a2a5a, #0f0f1a)",
        fontFamily: "Inter, Arial",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow circles */}
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          background: "#4CAF50",
          filter: "blur(120px)",
          opacity: 0.2,
          top: 50,
          left: 100,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 250,
          height: 250,
          background: "#6c63ff",
          filter: "blur(120px)",
          opacity: 0.2,
          bottom: 50,
          right: 100,
        }}
      />

      <div
        style={{
          width: 360,
          padding: 30,
          borderRadius: 20,
          background: "rgba(22,22,37,0.8)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.08)",
          zIndex: 2,
        }}
      >
        {/* Заголовок */}
        <h1
          style={{
            textAlign: "center",
            marginBottom: 25,
            fontSize: 30,
            fontWeight: 600,
            background: "linear-gradient(90deg, #4CAF50, #6c63ff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          MoneyQuest
        </h1>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            marginBottom: 25,
            background: "rgba(255,255,255,0.05)",
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

        {/* Name */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          style={{ ...inputStyle, marginBottom: 20 }}
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(90deg, #4CAF50, #6c63ff)",
            color: "white",
            fontSize: 16,
            fontWeight: 500,
            cursor: "pointer",
            transition: "0.3s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
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
  background: "rgba(255,255,255,0.05)",
  color: "white",
  outline: "none",
};

export default Auth;