import { useState } from "react";


function Recharge(  { connectedMeterNumber }){

    const [token, setToken] = useState("");
    const [message, setMessage] = useState("");
    const [rechargeMeterNumber, setRechargeMeterNumber] = useState("");

    function handleMeterNumber(event){
        setRechargeMeterNumber( event.target.value
                        .replace(/[^\d]/g, "")
                        .slice(0, 12)
        );
    }

    function handleToken(event){
        setToken(
            event.target.value
            .replace(/[^\d]/g, "")
            .slice(0, 20)
            .replace(/(\d{4})(?=\d)/g, "$1 ")
        );
        
    }

    async function handleActivateToken(){

        if(rechargeMeterNumber === ""){
            setMessage("ERROR! Please enter a meter number");
            return;
        }

        if (token === ""){
            setMessage("ERROR! Please enter a token");
            return;
        }

        if (rechargeMeterNumber.length < 12){
            setMessage("ERROR! Meter number must be 12 digits");
            return
        }

        if (token.length < 20){
            setMessage("ERROR! Token must be 20 digits");
            return
        }

        const cleanToken = token.replace(/\s/g, "");


        
        
            
                

        const response = await fetch("http://localhost:5000/api/recharges", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                meterNumber: rechargeMeterNumber,
                token: cleanToken,
            })
        });

        const data = await response.json();

        if (!response.ok) {
            setMessage(`ERROR! ${data.error}`);
            return;
        }
        
        const newBalance = data.balance;

            
        setMessage(`TOKEN ACTIVATED SUCCESSFULLY - ${data.energy} 
                    kWh added. New Balance: ${newBalance} kWh`);
                       
    
    }


    return(
        <>

        <div className="recharge-container">

            <div>
                <h1>Recharge Meter</h1>
            </div>

            {message && (
                <div className="recharge-message" role="status">
                    {message}
                </div>
            )}

            <div className="recharge-cards">

                
                <div className="meter-number-card">
                    <p className="label-p">
                        <label>Recharge Meter Number:</label>
                    </p>
                    <p> Connected Meter: {connectedMeterNumber || "No meter connected"}</p>
                    <input type="tel" placeholder="Enter 12-digit meter number" value={rechargeMeterNumber} onChange={handleMeterNumber} />
                    <p>Enter the meter number associated with the token.</p>
                </div>

                <div className="token-card">
                    <p>
                        <label>Electricity Token:</label>
                    </p>
                    <input type="tel" placeholder="Enter token" value={token} onChange={handleToken}  />
                </div>

            </div>

            <button className="activate-button" disabled={rechargeMeterNumber === "" } onClick={handleActivateToken}>Activate Token</button>
        </div>

        

        </>
    )
}
export default Recharge