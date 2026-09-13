import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "../auth.css";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
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
    setMessage("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      setMessage(response.message);

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
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
          onClick={() => navigate("/login")}
        >
          ×
        </button>

        <h1 className="auth-title">Create Account</h1>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="name">
            Name
          </label>

          <input
            className="auth-input"
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />

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
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>

          <label className="auth-label" htmlFor="confirmPassword">
            Confirm Password
          </label>

          <div className="auth-password-wrapper">
            <input
              className="auth-input"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              {showConfirmPassword ? "◉" : "◌"}
            </button>
          </div>

          {error && (
            <p className="auth-message auth-error">
              {error}
            </p>
          )}

          {message && (
            <p className="auth-message auth-success">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="auth-button auth-button-pink"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "♙  Create Account"}
          </button>

          <div className="auth-switch">
            Already have an account?{" "}
            <span
              className="auth-link"
              onClick={() => navigate("/login")}
            >
              Log In
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;