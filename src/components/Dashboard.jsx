import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

function Dashboard({ meterNumber}){


    const [meters, setMeters] = useState([]);
    const [lastRecharge, setLastRecharge] = useState(null);

    const connectedMeter = meters.find(meter => meter.meter_number === meterNumber);

    const connectedMeterBalance = connectedMeter?.balance  ?? null;
    
    

    
    useEffect(() => {
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
                setMeters(data);
            })
            .catch(error => {
                console.error("Error fetching meters:", error);
            });
    }, []);




    useEffect(() => {
        if (!meterNumber) {
            setLastRecharge(null);
            return;
        }

        fetch("http://localhost:5000/api/recharges",{
            credentials: "include"

        })
            .then(response => response.json())
            .then(data => {
                const meterRecharges = data.filter(
                    recharge => recharge.meter_number === meterNumber
                );

                setLastRecharge(
                    meterRecharges.length > 0 ? meterRecharges[0] : null
                );
            });
    }, [meterNumber]);

    
    console.log("Connected meter balance:", connectedMeter?.balance);
    
    return (
        <>
            <div className="main-container">
                <main>
                    <div>
                        <h1>Dashboard  👤  </h1>
                    </div>
                    <div>
                        <h2>Welcome back!</h2>
                    </div>

                    
                    <div className="balance-card">
                        <h4>Current Balance</h4>

                        {connectedMeterBalance === null ? (
                            <p>No connected meter found.</p>
                        ) : (
                            <p
                            className={`balance-value ${
                                connectedMeterBalance > 20
                                ? "good-balance"
                                : connectedMeterBalance > 0
                                ? "low-balance"
                                : "empty-balance"
                            }`}
                            >
                            {connectedMeterBalance} <span>kWh</span>
                            </p>
                        )}
                    </div>

                        <div className="meter-card">
                        <h4>Connected Meter</h4>
                        <p className="meter-number-value">{meterNumber}</p>
                        <span className="card-caption">Meter identification number</span>
                        </div>

                        <div className="last-card">
                        <h4>Last Recharge</h4>

                        {lastRecharge ? (
                            <>
                            <p className="recharge-energy">
                                +{lastRecharge.energy} <span>kWh</span>
                            </p>
                            <p>
                                <span className="detail-label">Time</span>
                                {new Date(lastRecharge.created_at).toLocaleTimeString()}
                            </p>
                            <p>
                                <span className="detail-label">Date</span>
                                {new Date(lastRecharge.created_at).toLocaleDateString()}
                            </p>
                            </>
                        ) : (
                            <p>No recharge yet</p>
                        )}
                    </div>

                    <div >
                        <Link to="/recharge">
                            <button className="recharge-button">Recharge Meter</button>
                        </Link>
                    </div>
                </main>
            </div>

        </>
    )
}
export default Dashboard