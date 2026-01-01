import { useState, useContext } from "react";
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

      {/* Main Glassmorphic Card */}
      <div
        style={{
          ...styles.card,
          animation: successGlow ? "successGlow 0.8s ease" : "none",
        }}
      >
        <div
          style={{
            ...styles.inner,
          }}
        >
          {/* LEFT SIDE (depends on mode) */}
          <div
            style={{
              ...styles.side,
              ...styles.leftSide,
              transform:
                mode === "login"
                  ? "translateX(0)"
                  : "translateX(-40px)",
              opacity: mode === "login" ? 1 : 0,
              transition: "all 0.6s ease",
            }}
          >
            {mode === "login" && (
              <div style={styles.formContainer}>
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
            )}

            {mode === "register" && (
              <div
                style={{
                  ...styles.imageWrapper,
                  transform: "translateX(0)",
                }}
              >
                <img
                  src={require("./logos/Gemini_Generated_Image_pqac0epqac0epqac.png")}
                  alt="Gemini"
                  style={styles.image}
                />
              </div>
            )}
          </div>

          {/* RIGHT SIDE (depends on mode) */}
          <div
            style={{
              ...styles.side,
              ...styles.rightSide,
              transform:
                mode === "login"
                  ? "translateX(40px)"
                  : "translateX(0)",
              opacity: mode === "login" ? 0 : 1,
              transition: "all 0.6s ease",
            }}
          >
            {mode === "login" && (
              <div
                style={{
                  ...styles.imageWrapper,
                  transform: "translateX(0)",
                }}
              >
                <img
                  src={require("./logos/Gemini_Generated_Image_pqac0epqac0epqac.png")}
                  alt="Gemini"
                  style={styles.image}
                />
              </div>
            )}

            {mode === "register" && (
              <div style={styles.formContainer}>
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
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes successGlow {
            0% { box-shadow: 0 0 0px rgba(0,255,150,0.0); }
            50% { box-shadow: 0 0 40px rgba(0,255,150,0.6); }
            100% { box-shadow: 0 0 0px rgba(0,255,150,0.0); }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 3px solid #fff;
            border-top: 3px solid transparent;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
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
      "linear-gradient(135deg, #0ea5e9, #6366f1, #8b5cf6, #14b8a6)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 12s ease infinite",
    zIndex: -3,
  },

  card: {
    width: "900px",
    height: "520px",
    backdropFilter: "blur(25px)",
    background: "rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "1rem",
    boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
    overflow: "hidden",
    position: "relative",
  },

  inner: {
    display: "flex",
    width: "100%",
    height: "100%",
  },

  side: {
    width: "50%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  leftSide: {
    transformOrigin: "center",
  },

  rightSide: {
    transformOrigin: "center",
  },

  formContainer: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    animation: "fadeScale 0.6s ease",
  },

  imageWrapper: {
    width: "80%",
    display: "flex",
    justifyContent: "center",
    animation: "fadeScale 0.6s ease",
  },

  image: {
    width: "100%",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },

  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#fff",
  },

  subtitle: {
    fontSize: "1rem",
    color: "#e0e0e0",
    marginBottom: "1rem",
  },

  input: {
    width: "100%",
    padding: "0.9rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.3)",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "1rem",
    outline: "none",
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
  },

  switchText: {
    marginTop: "0.5rem",
    color: "#e0e0e0",
  },

  switchLink: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "underline",
  },
};

export default AuthLanding;
