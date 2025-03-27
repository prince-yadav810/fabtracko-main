
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import '../styles/LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('vikasfabtech');
  const [password, setPassword] = useState('passfabtech');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      console.log("Submitting login form with:", { username, passwordLength: password.length });
      await login(username, password);
      toast.success("Login successful!");
      localStorage.setItem('authenticated', 'true');
      navigate("/");
    } catch (error) {
      let errorMessage = "Invalid credentials. Please try again.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Vikas Fabrication Works</h2>
        {error && <p className="error-message">{error}</p>}
        
        <div className="credentials-info">
          <p>Use the following credentials:</p>
          <div className="credentials-box">
            <div>Username: vikasfabtech</div>
            <div>Password: passfabtech</div>
          </div>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              id="username-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              title="Enter your username"
              placeholder="Enter username"
              disabled={isLoading}
              required
            />
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              title="Enter your password"
              placeholder="Enter password"
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
        <div className="app-version">Application version 1.0.1</div>
      </div>
    </div>
  );
};

export default LoginPage;
