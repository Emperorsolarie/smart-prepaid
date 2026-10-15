import { useState } from "react";

import { Link } from "react-router-dom";

function Sidebar({onLogout}){
    return(
        <>
            <div>
                <aside className="side-container">
                    <div>
                        <h1>⚡<span> Smart</span>Prepaid</h1>
                    </div>

                    <div >
                        
                        <Link className="sidebar-links" to={"/"}>Dashboard</Link>
                        <Link className="sidebar-links" to={"/ConnectMeter"}>Connect Meter</Link>
                        <Link className="sidebar-links" to={"/meter"}>My Meter</Link>
                        <Link className="sidebar-links" to={"/recharge"}>Recharge</Link>
                        <Link className="sidebar-links" to={"/history"}>History</Link>

                    </div>

                    <div>
                        <h4 className="logout" onClick={onLogout}>Logout</h4>
                    </div>

                </aside>
            </div>
        </>
    )
}
export default Sidebar