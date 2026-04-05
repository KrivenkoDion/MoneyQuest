import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!email.includes("@")) newErrors.email = "Enter valid email";
    if (password.length < 4) newErrors.password = "Min 4 chars";
    if (!isLogin && password !== confirm) newErrors.confirm = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (isLogin) {
        const res = await fetch("https://moneyquest-pcoq.onrender.com/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setErrors({ general: data.error }); return; }
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        const res = await fetch("https://moneyquest-pcoq.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) { setErrors({ general: data.error }); return; }
        localStorage.setItem("token", data.token);
        // после регистрации → выбор персонажа
        navigate("/character-select");
      }
    } catch {
      setErrors({ general: "Server error" });
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

        {/* NAME */}
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

        {/* EMAIL */}
        <div className="input-group">
          <div className="input-label">EMAIL</div>
          <input
            className={`auth-input ${errors.email ? "error" : ""}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <div className="input-label">PASSWORD</div>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className={`auth-input ${errors.password ? "error" : ""}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
            <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
              </svg>
            </button>
          </div>
          {errors.password && <div className="error-text">{errors.password}</div>}
        </div>

        {/* CONFIRM */}
        {!isLogin && (
          <div className="input-group">
            <div className="input-label">CONFIRM</div>
            <input
              type="password"
              className={`auth-input ${errors.confirm ? "error" : ""}`}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="********"
            />
            {errors.confirm && <div className="error-text">{errors.confirm}</div>}
          </div>
        )}

        {errors.general && <div className="error-general">{errors.general}</div>}

        <button className="auth-button" onClick={handleSubmit}>
          {isLogin ? "Log in →" : "Create Account →"}
        </button>

        <div className="auth-footer">
          {isLogin ? (
            <>Don't have an account?{" "}<span onClick={() => setIsLogin(false)}>Create account</span></>
          ) : (
            <>Already have an account?{" "}<span onClick={() => setIsLogin(true)}>Log in</span></>
          )}
        </div>

      </div>
    </div>
  );
}

export default Auth;