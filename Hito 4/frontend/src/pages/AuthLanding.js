import { useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  FaSun,
  FaMoon,
  FaGoogle,
  FaGithub,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";

const AuthLanding = ({ setToken }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.background =
      theme === "light"
        ? "linear-gradient(135deg, #dbeafe, #f0f9ff)"
        : "linear-gradient(135deg, #0f172a, #1e293b)";
  }, [theme]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (mode === "login") {
        const res = await authAPI.post("/login", form);
        localStorage.setItem("token", res.data.token);
        if (setToken) setToken(res.data.token);
        setMessage("✅ Login successful!");
        navigate("/home");
      } else {
        await authAPI.post("/register", form);
        setMessage("✅ Registration successful!");
        setMode("login");
      }
    } catch (err) {
      setMessage(`❌ ${mode === "login" ? "Login" : "Registration"} failed`);
      console.error("❌ Auth error:", err.response?.data || err.message);
    }
  };


  const handleGoogleSignIn = () => {
    alert("🔗 Google Sign-In clicked (connect backend to make it live)");
  };

  return (
    <div
      style={{
        ...styles.wrapper,
        color: theme === "light" ? "#1e293b" : "#f8fafc",
      }}
    >
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        style={styles.themeToggle}
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>

      <div style={styles.container}>
        {/* Left: Login/Register Form */}
        <div
          style={{
            ...styles.card,
            background:
              theme === "light"
                ? "rgba(255, 255, 255, 0.85)"
                : "rgba(30, 41, 59, 0.85)",
            boxShadow:
              theme === "light"
                ? "0 15px 35px rgba(0,0,0,0.1)"
                : "0 15px 35px rgba(255,255,255,0.05)",
          }}
        >
          <div
            style={{
              ...styles.inner,
              transform:
                mode === "login" ? "translateX(0%)" : "translateX(-50%)",
            }}
          >
            {/* Login Form */}
            <div style={styles.formSection}>
              <h2 style={styles.title}>🔐 Welcome Back</h2>
              <p style={styles.subtitle}>
                Shop Smart. Compare Better. Save More. 💡
              </p>

              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
              />

              <button onClick={handleSubmit} style={styles.button}>
                Login
              </button>
              <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
                <FaGoogle style={{ marginRight: "8px" }} /> Continue with Google
              </button>

              <p style={styles.switchText}>
                New here?{" "}
                <span
                  onClick={() => {
                    setMode("register");
                    setMessage("");
                  }}
                  style={styles.switchLink}
                >
                  Create an account
                </span>
              </p>
              {message && <p style={styles.message}>{message}</p>}
            </div>

            {/* Register Form */}
            <div style={styles.formSection}>
              <h2 style={styles.title}>📝 Create Account</h2>
              <p style={styles.subtitle}>
                Join us and start saving today! Smart Shopping Awaits.
              </p>

              <input
                name="name"
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                style={styles.input}
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                style={styles.input}
              />

              <button onClick={handleSubmit} style={styles.button}>
                Register
              </button>
              <button onClick={handleGoogleSignIn} style={styles.googleBtn}>
                <FaGoogle style={{ marginRight: "8px" }} /> Continue with Google
              </button>

              <p style={styles.switchText}>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setMode("login");
                    setMessage("");
                  }}
                  style={styles.switchLink}
                >
                  Log in
                </span>
              </p>
              {message && <p style={styles.message}>{message}</p>}
            </div>
          </div>

          {/* Footer */}
          <footer style={styles.footer}>
            <div style={styles.socials}>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <FaGithub />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer">
                <FaLinkedin />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer">
                <FaTwitter />
              </a>
            </div>
            <p style={styles.copy}>© {new Date().getFullYear()} CompraSmart</p>
          </footer>
        </div>

        {/* Right: Image Box */}
        <div
          style={{
            ...styles.card,
            overflow: "hidden",
            background: "none",
            boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={require("./logos/Gemini_Generated_Image_pqac0epqac0epqac.png")}
            alt="Smart shopping illustration"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "20px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    fontFamily: "'Inter', sans-serif",
  },
  container: {
    width: "90%",
    maxWidth: "900px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    margin: "3rem auto",
  },
  card: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    borderRadius: "20px",
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    transition: "all 0.5s ease",
    maxHeight: "600px",
  },
  inner: {
    display: "flex",
    width: "200%",
    transition: "transform 0.6s ease-in-out",
  },
  formSection: {
    width: "50%",
    padding: "3rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem" },
  subtitle: { fontSize: "1rem", color: "#64748b", marginBottom: "2rem", textAlign: "center" },
  input: {
    width: "100%",
    maxWidth: "300px",
    padding: "0.85rem",
    marginBottom: "1rem",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    maxWidth: "300px",
    padding: "0.9rem",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "1rem",
    transition: "transform 0.2s, background 0.3s",
  },
  googleBtn: {
    width: "100%",
    maxWidth: "300px",
    padding: "0.9rem",
    backgroundColor: "#fff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  switchText: { fontSize: "0.95rem", color: "#475569", textAlign: "center" },
  switchLink: { color: "#2563eb", cursor: "pointer", textDecoration: "underline" },
  message: { marginTop: "0.5rem", color: "#ef4444" },
  footer: { textAlign: "center", color: "#94a3b8", paddingBottom: "1rem" },
  socials: { display: "flex", gap: "12px", justifyContent: "center", marginBottom: "8px" },
  copy: { fontSize: "0.85rem" },
  themeToggle: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    background: "none",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    color: "#2563eb",
  },
};

export default AuthLanding;
