import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        // 🔐 LOGIN
        const res = await fetch("https://moneyquest-pcoq.onrender.com/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Ошибка входа");
          return;
        }

        // ✅ сохраняем токен
        localStorage.setItem("token", data.token);

        navigate("/home");
      } else {
        // 📝 REGISTER
        if (!email || !password) {
          alert("Заполни все поля");
          return;
        }

        const res = await fetch("https://moneyquest-pcoq.onrender.com/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error || "Ошибка регистрации");
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
    <div className="auth-container">
      <div className="auth-card">
        
        <h1 className="auth-title">MoneyQuest</h1>

        <div className="auth-tabs">
          <button
            onClick={() => setIsLogin(true)}
            className={`auth-tab ${isLogin ? "active" : ""}`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`auth-tab ${!isLogin ? "active" : ""}`}
          >
            Register
          </button>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="auth-input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="auth-input"
        />

        <button onClick={handleSubmit} className="auth-button">
          {isLogin ? "Log in" : "Create account"}
        </button>

      </div>
    </div>
  );
}

export default Auth;