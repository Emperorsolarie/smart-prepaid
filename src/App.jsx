import Dashboard from "./components/Dashboard"
import Sidebar from "./components/Sidebar"
import MyMeter from "./components/MyMeter"
import Recharge from "./components/Recharge"
import { Route } from "react-router-dom"
import { Routes } from "react-router-dom"
import { useLocation } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { useEffect } from "react"
import History from "./components/History"
import ConnectMeter from "./components/ConnectMeter"

import Register from "./components/Register"
import Login from "./components/Login"
import ProtectedRoute from "./components/ProtectedRoute"


function App() {

  const [connectedMeterNumber, setconnectedMeterNumber] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  

  const [meterNumber, setMeterNumber] = useState(()=>{
    const savedMeterNumber = localStorage.getItem("meterNumber");
    if(savedMeterNumber){
      return savedMeterNumber
    }
    return "";
  });

  const [meterStatus, setMeterStatus] = useState("Disconnected");

  useEffect(()=>{
    localStorage.setItem("meterNumber", meterNumber)
  }, [meterNumber]);

  useEffect(()=>{
    if(meterNumber){
      setMeterStatus("Connected");
    }else{
      setMeterStatus("Disconnected");
    };
  },[meterNumber])

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
        try {
            const response = await fetch("http://localhost:5000/api/me", {
                credentials: "include"
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Authentication check failed:", error);
            setIsAuthenticated(false);
        }finally {
          setIsLoading(false);
        }
    }

    checkAuth();
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  async function handleLogout(){
    try{
      const response = await fetch("http://localhost:5000/api/logout", {
        method: "POST",
        credentials: "include"
      });

      if(response.ok){
        setIsAuthenticated(false);
        navigate("/login");
      }
    }catch (error){
      console.error("Logout failed:", error);
    }
  }



  return (
    
    <>
        {location.pathname === "/register" || location.pathname === "/login" ? (
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login   onLoginSuccess={() =>setIsAuthenticated(true)}/>}/>
            </Routes>
        ) : (
            <div className="app-container">
                <Sidebar onLogout={handleLogout}/>

                <Routes>
                    <Route path="/" element={<ProtectedRoute
                                              isAuthenticated={isAuthenticated}
                                              isLoading={isLoading}> 
                                              <Dashboard meterNumber={meterNumber}  /> 
                                              </ProtectedRoute>} />

                    <Route
                        path="/ConnectMeter"
                        element={ <ProtectedRoute
                                              isAuthenticated={isAuthenticated}
                                              isLoading={isLoading}>
                            <ConnectMeter
                                meterNumber={meterNumber}
                                setMeterNumber={setMeterNumber}/> 
                                </ProtectedRoute>}/>

                    <Route
                        path="/meter"
                        element={<ProtectedRoute 
                                  isAuthenticated={isAuthenticated}
                                  isLoading={isLoading}>
                            <MyMeter
                                meterStatus={meterStatus}
                                meterNumber={meterNumber}
                            />
                          </ProtectedRoute>}/>

                    <Route
                        path="/recharge"
                        element={ <ProtectedRoute 
                                  isAuthenticated={isAuthenticated}
                                  isLoading={isLoading}> 
                              <Recharge 
                                connectedMeterNumber={meterNumber} /> </ProtectedRoute>}
                    />

                    <Route path="/history" element={ <ProtectedRoute 
                                  isAuthenticated={isAuthenticated}
                                  isLoading={isLoading}>
                                  <History /> </ProtectedRoute>} />
                </Routes>
            </div>
        )}
    </>

    )
}

export default App
