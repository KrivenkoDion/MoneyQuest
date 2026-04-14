import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FONT = "@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');";

function Auth() {
  const navigate = useNavigate();
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [isLogin, setIsLogin]     = useState(false);
  const [showPw, setShowPw]       = useState(false);
  const [errors, setErrors]       = useState<any>({});
  const [loading, setLoading]     = useState(false);

  const validate = () => {
    const e: any = {};
    if (!email.includes("@")) e.email = "Enter a valid email";
    if (password.length < 4)  e.password = "Min 4 characters";
    if (!isLogin && password !== confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const res  = await fetch("https://moneyquest-pcoq.onrender.com/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { setErrors({ general: data.error }); setLoading(false); return; }
        localStorage.setItem("token", data.token);
        navigate("/home");
      } else {
        const res  = await fetch("https://moneyquest-pcoq.onrender.com/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) { setErrors({ general: data.error }); setLoading(false); return; }
        localStorage.setItem("token", data.token);
        navigate("/character-select");
      }
    } catch {
      setErrors({ general: "Server error — try again" });
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      <style>{`
        ${FONT}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes auth-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes float-orb {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(20px,-15px) scale(1.08); }
          66%      { transform: translate(-15px,10px) scale(0.95); }
        }
        @keyframes tab-slide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .auth-wrap {
          min-height: 100vh;
          background: #f0f0eb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: 'Plus Jakarta Sans', 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ambient orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(60px);
        }
        .orb-1 {
          width: 280px; height: 280px;
          background: rgba(59,91,219,0.12);
          top: -80px; right: -60px;
          animation: float-orb 9s ease-in-out infinite;
        }
        .orb-2 {
          width: 220px; height: 220px;
          background: rgba(201,168,76,0.1);
          bottom: -60px; left: -40px;
          animation: float-orb 12s ease-in-out infinite reverse;
        }

        .auth-card {
          position: relative;
          width: 100%;
          max-width: 360px;
          background: white;
          border-radius: 28px;
          padding: 32px 28px 28px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.1), 0 2px 10px rgba(0,0,0,0.06);
          animation: auth-in 0.42s cubic-bezier(0.34,1.1,0.64,1) both;
        }

        .auth-form {
          animation: tab-slide 0.26s ease both;
        }

        .brand {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 24px;
        }
        .brand-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: #11112a;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        .brand-name {
          font-size: 17px; font-weight: 900; color: #11112a; letter-spacing: -0.4px;
        }

        .auth-title {
          font-size: 24px; font-weight: 900; color: #11112a;
          letter-spacing: -0.6px; line-height: 1.2; margin-bottom: 6px;
        }
        .auth-sub {
          font-size: 13px; color: #999; font-weight: 500; margin-bottom: 26px;
          line-height: 1.5;
        }
        .auth-sub span { color: #3b5bdb; font-weight: 700; }

        .input-group { margin-bottom: 12px; }
        .input-label {
          font-size: 10px; font-weight: 700; color: #aaa;
          letter-spacing: 1px; text-transform: uppercase;
          display: block; margin-bottom: 5px;
        }

        .auth-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 14px;
          border: 1.5px solid #e4e4de;
          background: #fafaf8;
          font-size: 15px;
          font-family: inherit;
          font-weight: 500;
          color: #11112a;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .auth-input:focus {
          border-color: #11112a;
          background: white;
          box-shadow: 0 0 0 3px rgba(17,17,42,0.08);
        }
        .auth-input.err {
          border-color: #e53935;
          background: #fff5f5;
        }
        .error-text { font-size: 12px; color: #e53935; margin-top: 5px; font-weight: 600; }
        .error-box {
          background: #fff5f5; color: #c62828;
          padding: 12px 14px; border-radius: 12px;
          font-size: 13px; font-weight: 600;
          margin-bottom: 14px; line-height: 1.4;
        }

        .pw-wrap { position: relative; }
        .pw-wrap .auth-input { padding-right: 48px; }
        .eye-btn {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #aaa; display: flex; align-items: center;
          transition: color 0.15s;
          -webkit-tap-highlight-color: transparent;
        }
        .eye-btn:hover { color: #11112a; }

        .submit-btn {
          width: 100%;
          padding: 16px;
          border-radius: 16px;
          border: none;
          background: #11112a;
          color: white;
          font-size: 16px;
          font-weight: 800;
          font-family: inherit;
          letter-spacing: -0.2px;
          cursor: pointer;
          margin-top: 4px;
          box-shadow: 0 4px 20px rgba(17,17,42,0.25);
          transition: transform 0.13s cubic-bezier(0.34,1.5,0.64,1), opacity 0.13s, box-shadow 0.13s;
          -webkit-tap-highlight-color: transparent;
        }
        .submit-btn:hover  { opacity: 0.9; }
        .submit-btn:active { transform: scale(0.95); opacity: 0.8; }
        .submit-btn:disabled { opacity: 0.5; cursor: default; }

        .auth-toggle {
          text-align: center;
          margin-top: 18px;
          font-size: 13px;
          color: #999;
          font-weight: 500;
        }
        .auth-toggle button {
          background: none; border: none; cursor: pointer;
          color: #3b5bdb; font-weight: 800; font-family: inherit;
          font-size: 13px; padding: 0;
          -webkit-tap-highlight-color: transparent;
        }

        /* Tab switcher */
        .auth-tabs {
          display: flex;
          background: #f0f0ea;
          border-radius: 14px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 24px;
        }
        .auth-tab {
          flex: 1; padding: 10px; border-radius: 10px; border: none;
          font-family: inherit; font-size: 14px; font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, box-shadow 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .auth-tab.on {
          background: white;
          color: #11112a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .auth-tab.off {
          background: transparent;
          color: #aaa;
        }
      `}</style>

      <div className="auth-wrap">
        <div className="orb orb-1" />
        <div className="orb orb-2" />

        <div className="auth-card">
          {/* Brand */}
          <div className="brand">
            <div className="brand-icon">🐻</div>
            <span className="brand-name">MoneyQuest</span>
          </div>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${!isLogin ? "on" : "off"}`}
              onClick={() => { setIsLogin(false); setErrors({}); }}
            >
              Sign Up
            </button>
            <button
              className={`auth-tab ${isLogin ? "on" : "off"}`}
              onClick={() => { setIsLogin(true); setErrors({}); }}
            >
              Log In
            </button>
          </div>

          <div className="auth-form" key={isLogin ? "login" : "register"}>
            <p className="auth-title">
              {isLogin ? "Welcome back." : "Begin your ascent."}
            </p>
            <p className="auth-sub">
              {isLogin
                ? "Your money adventure awaits."
                : <>Take control of your finances — <span>level up</span> your life.</>
              }
            </p>

            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  className="auth-input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Alexander Hamilton"
                />
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                className={`auth-input ${errors.email ? "err" : ""}`}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKey}
                placeholder="name@example.com"
              />
              {errors.email && <p className="error-text">{errors.email}</p>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? "text" : "password"}
                  className={`auth-input ${errors.password ? "err" : ""}`}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                />
                <button type="button" className="eye-btn" onClick={() => setShowPw(!showPw)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPw
                      ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                      : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                    }
                  </svg>
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <input
                  type="password"
                  className={`auth-input ${errors.confirm ? "err" : ""}`}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                />
                {errors.confirm && <p className="error-text">{errors.confirm}</p>}
              </div>
            )}

            {errors.general && <div className="error-box">⚠️ {errors.general}</div>}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Please wait…" : isLogin ? "Log In →" : "Create Account →"}
            </button>

            <div className="auth-toggle">
              {isLogin
                ? <>No account?{" "}<button onClick={() => { setIsLogin(false); setErrors({}); }}>Create one</button></>
                : <>Already have one?{" "}<button onClick={() => { setIsLogin(true); setErrors({}); }}>Log in</button></>
              }
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Auth;
