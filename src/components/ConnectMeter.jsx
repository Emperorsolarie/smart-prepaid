import { useState } from "react";

function ConnectMeter({meterNumber, setMeterNumber}){

    const [message, setMessage] = useState("");

    function handleMeterNumber(event) {
        setMeterNumber( event.target.value
                        .replace(/[^\d]/g, "")
                        .slice(0, 12)
        );
    }

    async function handleConnectMeter(){
        console.log(meterNumber)

        if (meterNumber === ""){
            setMessage("ERROR! Meter number must be 12 digits");
            return;
        }

        if(meterNumber.length !== 12){
            setMessage("ERROR! Meter number must be 12 digits");
            return;
        }

        
        try {
            const response = await fetch(
                "http://localhost:5000/api/connect-meter",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ meterNumber })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(`ERROR! ${data.error}`);
                return;
            }

            setMessage(data.message);

        } catch (error) {
            console.error(error);
            setMessage("ERROR! Could not connect to the server");
        }
    }

    async function handleDisconnectMeter() {
        
        if (!meterNumber) {
            setMessage("ERROR! Enter a meter number first");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/disconnect-meter",
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ meterNumber })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setMessage(`ERROR! ${data.error}`);
                return;
            }

            setMessage(data.message);
            setMeterNumber("");
            localStorage.removeItem("meterNumber");

        } catch (error) {
            console.error(error);
            setMessage("ERROR! Could not connect to the server");
        }

    }

    return(
    
        <div className="connect-meter-container">
            <h1>Connect Your Meter</h1>

            <h3>{message}</h3>

            <div className="connect-meter-card">

                <div className="connect-meter-header">
                    <h2>Connect Your Meter</h2>
                </div>

                <div className="connect-meter-input">
                
                    <label>Meter Number:</label>
                

                    <input type="tel" value={meterNumber} onChange={handleMeterNumber} placeholder="Enter Meter Number" />
                </div>

            </div>

            <button className="connect-meter-button" onClick={handleConnectMeter} >Connect Meter</button>

            <button className="disconnect-meter-button" onClick={handleDisconnectMeter}>Disconnect Meter</button>
        </div>

    )
}

export default ConnectMeter