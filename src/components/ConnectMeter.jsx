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
            <div className="connect-meter-page-header">
                <div>
                <h1>Connect Meter</h1>
                <p>Link your prepaid electricity meter to your account.</p>
                </div>
                <div className="connect-meter-icon">⚡</div>
            </div>

            {message && (
                <div className="connect-meter-message" role="status">
                {message}
                </div>
            )}

            <div className="connect-meter-card">
                <div className="connect-meter-header">
                <div className="connect-meter-card-icon">⚡</div>
                <h2>Connect Your Meter</h2>
                <p>Enter the meter number associated with your electricity meter.</p>
            </div>

            <div className="connect-meter-input">
                <label htmlFor="meterNumber">Meter Number</label>
                <input
                    id="meterNumber"
                    type="tel"
                    value={meterNumber}
                    onChange={handleMeterNumber}
                    placeholder="Enter your meter number"
                />
                <small>Check the number on your meter before connecting.</small>
            </div>

            <div className="connect-meter-actions">
                <button
                    type="button"
                    className="connect-meter-button"
                    onClick={handleConnectMeter}
                >
                    Connect Meter
                </button>

                <button
                    type="button"
                    className="disconnect-meter-button"
                    onClick={handleDisconnectMeter}
                >
                    Disconnect Meter
                </button>
                </div>
            </div>

            <div className="connect-meter-note">
                <span>ⓘ</span>
                <p>
                Connect only a meter that is associated with your account.
                </p>
            </div>
        </div>

    )
}

export default ConnectMeter