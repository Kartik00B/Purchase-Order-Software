import React, {useState} from "react";
import axios from "axios";
import "./registerform.css"; // Ensure this path is correct
import {useNavigate} from "react-router-dom";

function RegisterForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  // const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
        email,
      });
      setMessage(response.data.message);

      if (response.data.success) {
        setMessage("Registration successful! Redirecting to Mainscreen...");
        setTimeout(() => {
          navigate("/MainScreen");
        }, 3000);
      }

    } catch (error) {
      // Handle specific error messages
      if (error.response && error.response.data) {
        setMessage(error.response.data.message); // Display specific error message

        setUsername("");
        setPassword("");
        setEmail("");
      } else {
        setMessage("Error: Could not register"); // Fallback error message
      }
    }
  };

  return (
    <div className="register-body">
      <div className="container-register">
        <h2>Register</h2>
        <form className="form-register" onSubmit={handleSubmit}>
          <label className="register-label">Your name</label>
          <input
            className="register-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <label className="register-label">Password</label>
          <input
            className="register-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="register-label">Email</label>
          <input
            className="register-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn-register" type="submit">
            
            Register
          </button>
        </form>
        <p className="register-message">{message}</p>
      </div>
    </div>
  );
}

export default RegisterForm;
