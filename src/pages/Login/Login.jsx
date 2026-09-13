import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "../auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/demo");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button
          type="button"
          className="auth-close"
          onClick={() => navigate("/")}
        >
          ×
        </button>

        <h1 className="auth-title">Log In</h1>

        <div className="auth-tab">Via Password</div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="email">
            Email
          </label>

          <input
            className="auth-input"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />

          <label className="auth-label" htmlFor="password">
            Password
          </label>

          <div className="auth-password-wrapper">
            <input
              className="auth-input"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>

          {error && (
            <p className="auth-message auth-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="auth-button auth-button-pink"
            disabled={loading}
          >
            {loading ? "Logging In..." : "→  Log In"}
          </button>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="auth-button auth-button-orange"
            onClick={() => navigate("/register")}
          >
            ♙  Create New Account
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;