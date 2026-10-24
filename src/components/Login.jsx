import { useState } from "react";
import "./Register.css";
import { Link, useNavigate } from "react-router-dom";


function Login({ onLoginSuccess }){
    
    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    async function handleLogin(){
        console.log("Login button clicked");
        if (!email || !password) {
            setMessage("Please enter both email and password.");
            return;
        }

        const response = await fetch("http://localhost:5000/api/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(data.error || "Login failed.");
            return;
        }

        setMessage(data.message);
        console.log("Login succeeded. Redirecting...");
        onLoginSuccess();
        navigate("/");
    }

    return(
        <>
            <div className="register-container">

                <div className="register-card">
                    <h1>Welcome Back</h1>
                    
                    <input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)}/>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)}/>

                    <button type="button" onClick={handleLogin}>Login</button>
                    <p  className="register-message">{message}</p>
                    <p>Don't have an account?{" "} <Link to="/register">Register here</Link></p>
                </div>

            </div>  
        </>
    )
}
export default Login

