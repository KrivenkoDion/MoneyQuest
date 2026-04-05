import { useState } from "react";
import { useNavigate } from "react-router-dom";

const COLORS = [
  { id: "brown", label: "Classic", fur: "#8B7355", inner: "#C4956A" },
  { id: "gray", label: "Shadow", fur: "#6B7280", inner: "#9CA3AF" },
  { id: "black", label: "Dark", fur: "#2D2D2D", inner: "#4B4B4B" },
  { id: "orange", label: "Sunny", fur: "#C2703A", inner: "#E8967A" },
];

function ChillGuyPreview({ fur, inner }: { fur: string; inner: string }) {
  return (
    <svg width="80" height="90" viewBox="0 0 200 220">
      {/* ears */}
      <ellipse cx="55" cy="60" rx="18" ry="24" fill={fur} transform="rotate(-15,55,60)" />
      <ellipse cx="145" cy="60" rx="18" ry="24" fill={fur} transform="rotate(15,145,60)" />
      <ellipse cx="55" cy="62" rx="10" ry="14" fill={inner} transform="rotate(-15,55,62)" />
      <ellipse cx="145" cy="62" rx="10" ry="14" fill={inner} transform="rotate(15,145,62)" />
      {/* head */}
      <ellipse cx="100" cy="95" rx="52" ry="50" fill={fur} />
      {/* snout */}
      <ellipse cx="100" cy="118" rx="28" ry="20" fill={inner} />
      {/* nose */}
      <ellipse cx="100" cy="108" rx="10" ry="7" fill="#2D1B0E" />
      {/* eyes */}
      <ellipse cx="78" cy="88" rx="10" ry="7" fill="white" />
      <ellipse cx="122" cy="88" rx="10" ry="7" fill="white" />
      <ellipse cx="78" cy="90" rx="6" ry="5" fill="#3D2B1F" />
      <ellipse cx="122" cy="90" rx="6" ry="5" fill="#3D2B1F" />
      <rect x="68" y="83" width="20" height="7" rx="4" fill={fur} />
      <rect x="112" y="83" width="20" height="7" rx="4" fill={fur} />
      {/* mouth */}
      <path d="M88 126 Q100 134 112 126" fill="none" stroke="#2D1B0E" strokeWidth="2.5" strokeLinecap="round" />
      {/* neck */}
      <rect x="82" y="140" width="36" height="20" fill={fur} />
      {/* hoodie */}
      <rect x="30" y="158" width="140" height="60" rx="20" fill="#4A4A6A" />
      <path d="M30 175 Q100 148 170 175" fill="#4A4A6A" />
    </svg>
  );
}

function Auth() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("brown");
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
          body: JSON.stringify({ email, password, name, avatar }),
        });
        const data = await res.json();
        if (!res.ok) { setErrors({ general: data.error }); return; }
        setIsLogin(true);
      }
    } catch {
      setErrors({ general: "Server error" });
    }
  };

  const selectedColor = COLORS.find(c => c.id === avatar)!;

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

        {/* CHARACTER PICKER */}
        {!isLogin && (
          <div className="input-group">
            <div className="input-label">YOUR CHARACTER</div>

            {/* Preview */}
            <div style={{ display: "flex", justifyContent: "center", margin: "8px 0" }}>
              <ChillGuyPreview fur={selectedColor.fur} inner={selectedColor.inner} />
            </div>

            {/* Color options */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              {COLORS.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setAvatar(c.id)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: c.fur,
                    border: avatar === c.id ? "3px solid #1a1a2e" : "3px solid transparent",
                    transition: "border 0.2s",
                  }} />
                  <span style={{ fontSize: 10, color: avatar === c.id ? "#1a1a2e" : "#999" }}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
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