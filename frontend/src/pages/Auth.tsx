import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = () => {
    // пока просто вход без проверки
    navigate("/home");
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <div
        style={{
          padding: 30,
          borderRadius: 12,
          background: "white",
          width: 300,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center" }}>
          {isLogin ? "Login" : "Register"}
        </h2>

        {/* Переключение */}
        <div
          style={{
            display: "flex",
            marginBottom: 20,
          }}
        >
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: 10,
              background: isLogin ? "#4CAF50" : "#eee",
              color: isLogin ? "white" : "black",
              border: "none",
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
              background: !isLogin ? "#4CAF50" : "#eee",
              color: !isLogin ? "white" : "black",
              border: "none",
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>

        {/* Форма */}
        {!isLogin && (
          <input
            type="text"
            placeholder="Name"
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 10,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          style={{
            width: "100%",
            padding: 10,
            marginBottom: 20,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "none",
            background: "#4CAF50",
            color: "white",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {isLogin ? "Войти" : "Создать аккаунт"}
        </button>
      </div>
    </div>
  );
}

export default Auth;