import { useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import GeminiImage from "../pages/logos/Gemini_Generated_Image_pqac0epqac0epqac.png";

const AuthLanding = ({ setToken }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [successGlow, setSuccessGlow] = useState(false);

  const navigate = useNavigate();
  const { fetchUser } = useContext(UserContext);

  // ⭐ Prevent theme toggle from overriding this page
  useEffect(() => {
    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
  }, []);

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
      {/* Violet Background */}
      <div style={styles.gradientBg}></div>

      {/* Card */}
      <div
        style={{
          ...styles.card,
          animation: successGlow ? "successGlow 0.8s ease" : "none",
        }}
      >
        <div style={styles.inner}>
          {/* LEFT SIDE */}
          <div
            style={{
              ...styles.side,
              transform:
                mode === "login" ? "translateX(0)" : "translateX(-40px)",
              opacity: mode === "login" ? 1 : 0,
              transition: "all 0.6s ease",
            }}
          >
            {mode === "login" ? (
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
            ) : (
              <div style={styles.imageWrapper}>
                <img src={GeminiImage} alt="Gemini" style={styles.image} />
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              ...styles.side,
              transform:
                mode === "login" ? "translateX(40px)" : "translateX(0)",
              opacity: mode === "login" ? 0 : 1,
              transition: "all 0.6s ease",
            }}
          >
            {mode === "login" ? (
              <div style={styles.imageWrapper}>
                <img src={GeminiImage} alt="Gemini" style={styles.image} />
              </div>
            ) : (
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
          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

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

    // ⭐ Prevent theme override
    background: "transparent !important",
  },

  gradientBg: {
    position: "absolute",
    width: "200%",
    height: "200%",
    background: "linear-gradient(135deg, #6d28d9, #8b5cf6, #a78bfa)",
    backgroundSize: "400% 400%",
    animation: "gradientMove 30s ease infinite",
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

  formContainer: {
    width: "80%",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },

  imageWrapper: {
    width: "80%",
    display: "flex",
    justifyContent: "center",
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
    textAlign: "center",
  },

  switchLink: {
    color: "#fff",
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "600",
  },
};

export default AuthLanding;
