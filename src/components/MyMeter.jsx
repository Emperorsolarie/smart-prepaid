import { useEffect, useState } from "react";
import { Link } from "react-router-dom"

function MyMeter({ meterStatus, meterNumber}){
    const [connectedMeterBalance, setConnectedMeterBalance] = useState(null);
    const [lastRecharge, setLastRecharge] = useState(null);

    useEffect(() => {
        if (meterNumber) {
            fetch("http://localhost:5000/api/meters", {
                credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch meters");
                }
                return response.json();
            })
            .then(data => {
                const connectedMeter = data.find(
                    meter => meter.meter_number === meterNumber
                );

                if (connectedMeter) {
                    setConnectedMeterBalance(connectedMeter.balance);
                }else {
                    setConnectedMeterBalance(null);
                }
            })
            .catch(error => console.error("Error fetching meter:", error));

           
        fetch("http://localhost:5000/api/recharges", {
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch recharges");
                }
                return response.json();
            })
            .then(data => {
                const meterRecharges = data.filter(
                    recharge => recharge.meter_number === meterNumber
                );

                if (meterRecharges.length > 0) {
                    setLastRecharge(meterRecharges[0]);
                }
            })
            .catch(error => console.error("Error fetching recharges:", error));
        }
                
    }, [meterNumber]);



    return(
        <>

            <div className="meter-container">

                <div>
                    <h1>Meter Information</h1>

                </div>

                <div className="meter-cards">

                    <div className="number-card">
                        <h4>Meter  Number</h4>
                        <p>{meterNumber}</p>
                    </div>

                    <div className="meter-balance-card">
                        <h4>Current Balance</h4>
                        
                        {connectedMeterBalance === null ? (
                            <p>No connected meter found.</p>
                        ) : (
                            <p className={ connectedMeterBalance > 20 ? "good-balance": connectedMeterBalance > 0
                                            ? "low-balance" : "empty-balance"}> {connectedMeterBalance} kWh </p>
                        )}


                    </div>

                    <div className="status-card">
                        <h4>Meter Status</h4>
                        <p className={meterStatus === "Connected"? "connect" : "disconnect"}>
                        <span className="status-dot"></span> {meterStatus}</p>
                    </div>

                    <div className="myMeter-last-card">
                        <h4>Last Recharge</h4>
                        <p> <span>Energy</span> : {lastRecharge? `${lastRecharge.energy} kWh` : "No recharge yet"}</p>
                        <p> <span>Time</span> : {lastRecharge? new Date(lastRecharge.created_at).toLocaleTimeString() : "———"}</p>
                        <p> <span>Date</span> : {lastRecharge? new Date(lastRecharge.created_at).toLocaleDateString() : "———"}</p>
                    </div>


                </div>

                <Link to="/recharge">
                    <button className="meter-recharge-button">Recharge Meter</button>
                </Link>

            </div>
        </>
    )
}
export default MyMeter