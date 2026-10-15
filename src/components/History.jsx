import { useEffect, useState } from "react";

function History(){
    const [recharges, setRecharges] = useState([]);

    
    useEffect(() => {
        fetch("http://localhost:5000/api/recharges", {
            credentials: "include"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to fetch recharge history");
                }
                return response.json();
            })
            .then(data => {
                setRecharges(data);
            })
            .catch(error => {
                console.error("Error fetching recharge history:", error);
            });
    }, []);


    
    async function handleClearHistory() {
        const confirmMessage = confirm(
            "Are you sure you want to clear your recharge history?"
        );

        if (!confirmMessage) {
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/recharges",
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.error || "Failed to clear recharge history");
                return;
            }

            setRecharges([]);
            alert(data.message);
        } catch (error) {
            console.error("Error clearing history:", error);
            alert("Could not connect to the server");
        }
    }


    return(
        <>

            <div className="history-container">
                <div>
                    <h1>Recharge History</h1>
                </div>

                <div className="table-card">
                    <h2>Recent Recharge Transactions</h2>

                    <div className="table-wrapper">
                        <table className="history-table">
                            <thead className="history-table-header">

                                <tr>

                                    <th>Meter Number</th>
                                    <th>Token</th>
                                    <th>Energy</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Recharge Type</th>

                                </tr>

                            </thead>

                            <tbody className="history-table-body">
                                {   recharges.length ===0? 
                                    <tr>
                                        <td colSpan={6} className="no-transactions">No recharge transactions yet.</td> 
                                    </tr>
                                    : recharges.map((record, index)=>{
                                        
                                    return(
                                        <tr key={index}>
                                            <td>{record.meter_number}</td>
                                            <td>{record.token}</td>
                                            <td>+{record.energy} kWh</td>
                                            <td className={record.status === "Successful"? "successful" : "failed"}>{record.status}</td>
                                            <td>{new Date(record.created_at).toLocaleDateString()}</td>
                                            <td>{new Date(record.created_at).toLocaleTimeString()}</td>
                                            <td>{record.recharge_type}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <button className="clear-history-button" onClick={handleClearHistory}>Clear History</button>
                </div>
            </div>
        </>
    );
}
export default History