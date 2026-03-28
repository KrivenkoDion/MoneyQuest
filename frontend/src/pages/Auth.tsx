import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  // 🔥 ошибки
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};

    if (!email.includes("@")) {
      newErrors.email = "Enter a valid email";
    }

    if (password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }

    if (!isLogin && password !== confirm) {
      newErrors.confirm = "Passwords do not match";
    }

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

        if (!res.ok) {
          setErrors({ general: data.error });
          return;
        }

        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        const res = await fetch("https://moneyquest-pcoq.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setErrors({ general: data.error });
          return;
        }

        setErrors({});
        setIsLogin(true);
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

            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          {errors.password && (
            <div className="error-text">{errors.password}</div>
          )}
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
            {errors.confirm && (
              <div className="error-text">{errors.confirm}</div>
            )}
          </div>
        )}

        {/* GENERAL ERROR */}
        {errors.general && (
          <div className="error-general">{errors.general}</div>
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