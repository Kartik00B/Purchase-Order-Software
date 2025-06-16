import React, { useState } from "react";
import axios from "axios";
import "./loginform.css";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"; // Import icons

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
      });
      setMessage(response.data.message);

      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/MainScreen");
      }
    } catch (error) {
      console.log(
          "Error:",
          error.response ? error.response.data : error.message
      );
      setMessage("Error: enter valid username or password");
    }
  };

  return (
      <div className="login-body">
        <div className="container-login">
          <h1 className="login-header">Login</h1>
          <form className="form-login" onSubmit={handleSubmit}>
            <label className="login-label">Username</label>
            <input
                className="login-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <label className="login-label">Password</label>
            {/*<br/>*/}
            <div className="password-container">
              <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
              <span
                  className="password-toggle-icon"
                  onClick={() => setShowPassword(!showPassword)}
              >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
            </div>

            <button className="btn-login" type="submit">
              Login
            </button>
          </form>
          <p className="login-message">{message}</p>
          <p className="register">
            Don't have an account?{" "}
            <Link className="register-link" to="/register">
              Register here
            </Link>
          </p>
        </div>
      </div>
  );
}

export default LoginForm;
