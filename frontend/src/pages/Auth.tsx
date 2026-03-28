import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";

function Auth() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const res = await fetch("https://moneyquest-pcoq.onrender.com/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        if (password !== confirm) {
          alert("Passwords do not match");
          return;
        }

        const res = await fetch("https://moneyquest-pcoq.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        alert("Account created!");
        setIsLogin(true);
      }
    } catch {
      alert("Server error");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="logo">MoneyQuest</div>

        <div className="auth-title">
          Begin your <span className="highlight">ascent.</span>
        </div>

        <div className="auth-sub">
          Take control of your money and track everything.
        </div>

        {!isLogin && (
          <div className="input-group">
            <div className="input-label">FULL NAME</div>
            <input
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alexander Hamilton"
            />
          </div>
        )}

        <div className="input-group">
          <div className="input-label">EMAIL</div>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </div>

        <div className="input-group">
          <div className="input-label">PASSWORD</div>

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <span className="eye" onClick={() => setShowPassword(!showPassword)}>
              👁
            </span>
          </div>
        </div>

        {!isLogin && (
          <div className="input-group">
            <div className="input-label">CONFIRM</div>
            <input
              type="password"
              className="auth-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}

        {!isLogin && (
          <div className="checkbox">
            <input type="checkbox" />
            <span>I agree to Terms & Privacy</span>
          </div>
        )}

        <button className="auth-button" onClick={handleSubmit}>
          {isLogin ? "Log in →" : "Create Account →"}
        </button>

        <div className="auth-footer">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <span onClick={() => setIsLogin(false)}>Create account</span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span onClick={() => setIsLogin(true)}>Log in</span>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Auth;