import { useState, useEffect, useContext } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const AuthLanding = ({ setToken }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [successGlow, setSuccessGlow] = useState(false);

  const navigate = useNavigate();
  const { fetchUser } = useContext(UserContext);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await authAPI.post("/login", form);
        localStorage.setItem("token", res.data.token);
        if (setToken) setToken(res.data.token);

        await fetchUser();

        // Success glow animation
        setSuccessGlow(true);
        setTimeout(() => navigate("/home"), 800);
      } else {
        await authAPI.post("/register", form);
        setMode("login");
      }
    } catch (err) {
      console.error("❌ Auth error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      {/* Animated Background */}
      <div style={styles.gradientBg}></div>
      <div style={{ ...styles.blob, ...styles.blob1 }}></div>
      <div style={{ ...styles.blob, ...styles.blob2 }}></div>

      {/* Glass Card */}
      <div
        style={{
          ...styles.card,
          animation: successGlow ? "successGlow 0.8s ease" : "none",
        }}
      >
        {/* Slide Container */}
        <div
          style={{
            ...styles.inner,
            transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)",
          }}
        >
          {/* LOGIN */}
          <div style={styles.formSection}>
            <h2 style={styles.title}>Welcome Back</h2>
            <p style={styles.subtitle}>Log in to continue your journey</p>

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
              {loading ? <div className="spinner"></div> : "Login"}
            </button>

            <p style={styles.switchText}>
              New here?{" "}
              <span
                onClick={() => setMode("register")}
                style={styles.switchLink}
              >
                Create an account
              </span>
            </p>
          </div>

          {/* REGISTER */}
          <div style={styles.formSection}>
            <h2 style={styles.title}>Create Account</h2>
            <p style={styles.subtitle}>Join us and start saving today</p>

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
              {loading ? <div className="spinner"></div> : "Register"}
            </button>

            <p style={styles.switchText}>
              Already have an account?{" "}
              <span
                onClick={() => setMode("login")}
                style={styles.switchLink}
              >
                Log in
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
            100% { transform: translateY(0px); }
          }

          @keyframes successGlow {
            0% { box-shadow: 0 0 0px rgba(0,255,150,0.0); }
            50% { box-shadow: 0 0 40px rgba(0,255,150,0.6); }
            100% { box-shadow: 0 0 0px rgba(0,255,150,0.0); }
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid #fff;
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
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
    overflow: "hidden",
    fontFamily: "'Inter', sans-serif",
  },

  gradientBg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background:
      "linear-gradient(135deg, #4f46e5, #3b82f6, #06b6d4, #10b981)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 12s ease infinite",
    zIndex: -3,
  },

  blob: {
    position: "absolute",
    width: "350px",
    height: "350px",
    background: "rgba(255,255,255,0.15)",
    filter: "blur(80px)",
    borderRadius: "50%",
    animation: "float 6s ease-in-out infinite",
    zIndex: -2,
  },

  blob1: { top: "10%", left: "15%" },
  blob2: { bottom: "10%", right: "15%" },

  card: {
    width: "420px",
    height: "520px",
    backdropFilter: "blur(25px)",
    background: "rgba(255,255,255,0.15)",
    borderRadius: "20px",
    padding: "2rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    overflow: "hidden",
    position: "relative",
  },

  inner: {
    display: "flex",
    width: "200%",
    height: "100%",
    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  formSection: {
    width: "50%",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#fff",
    marginBottom: "0.5rem",
  },

  subtitle: {
    fontSize: "1rem",
    color: "#e0e0e0",
    marginBottom: "2rem",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "0.9rem",
    marginBottom: "1rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
    transition: "0.3s",
  },

  button: {
    width: "100%",
    padding: "0.9rem",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "0.3s",
  },

  switchText: {
    marginTop: "1rem",
    color: "#e0e0e0",
  },

  switchLink: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default AuthLanding;
