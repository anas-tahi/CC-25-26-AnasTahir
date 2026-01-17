import { useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import GeminiImage from "./logos/Gemini_Generated_Image_pqac0epqac0epqac.png";

const AuthLanding = () => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { fetchUser } = useContext(UserContext);

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
      // ================= LOGIN =================
      if (mode === "login") {
        const res = await authAPI.post("/login", {
          email: form.email,
          password: form.password,
        });

        // ✅ Save token
        localStorage.setItem("token", res.data.token);

        // ✅ Navigate immediately
        navigate("/home", { replace: true });

        // ✅ Fetch user AFTER navigation
        fetchUser();

        return;
      }

      // ================= REGISTER =================
      await authAPI.post("/register", form);
      alert("Account created successfully. Please log in.");

      setMode("login");
      setForm({ name: "", email: "", password: "" });
    } catch (err) {
      console.error("❌ Auth error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.inner}>
          {/* LEFT */}
          <div style={styles.side}>
            {mode === "login" ? (
              <div style={styles.formContainer}>
                <h2 style={styles.title}>Welcome Back</h2>

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
                  {loading ? "Loading..." : "Login"}
                </button>

                <p style={styles.switchText}>
                  New here?{" "}
                  <span onClick={() => setMode("register")} style={styles.switchLink}>
                    Create account
                  </span>
                </p>
              </div>
            ) : (
              <img src={GeminiImage} alt="Gemini" style={styles.image} />
            )}
          </div>

          {/* RIGHT */}
          <div style={styles.side}>
            {mode === "register" ? (
              <div style={styles.formContainer}>
                <h2 style={styles.title}>Create Account</h2>

                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                />
                <input
                  name="email"
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
                  {loading ? "Loading..." : "Register"}
                </button>

                <p style={styles.switchText}>
                  Already have an account?{" "}
                  <span onClick={() => setMode("login")} style={styles.switchLink}>
                    Login
                  </span>
                </p>
              </div>
            ) : (
              <img src={GeminiImage} alt="Gemini" style={styles.image} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" },
  card: { width: "900px", height: "520px", background: "#52214e", borderRadius: "20px" },
  inner: { display: "flex", height: "100%" },
  side: { width: "50%", display: "flex", justifyContent: "center", alignItems: "center" },
  formContainer: { width: "80%", display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "2rem", fontWeight: "700" },
  input: { padding: "0.9rem", borderRadius: "10px", border: "1px solid #ddd" },
  button: { padding: "0.9rem", background: "#10b981", color: "#fff", borderRadius: "10px" },
  switchText: { textAlign: "center" },
  switchLink: { color: "#4f46e5", cursor: "pointer" },
  image: { width: "80%", borderRadius: "20px" },
};

export default AuthLanding;
