import { useState } from "react";
import "./Register.css";
import { Link } from "react-router-dom";

function Register() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    async function handleRegister() {

        try{

            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Registration failed");
                return;
            }

            setMessage(data.message);

        }catch (error){
             console.error("Registration error:", error);
        }
    }

    return (
        <>
            <div className="register-container">
                <div className="register-card">
                    <h1>Create Account</h1>
                    <p>{message}</p>
                    <input type="text" placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)}/>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(event) => setEmail(event.target.value)}/>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)}/>

                    <button type="button" onClick={handleRegister}> Create Account </button>
                    <p>Already have an account? <Link to="/login">Login here</Link></p>

                </div>

            </div>
        </>
    );
}

export default Register;