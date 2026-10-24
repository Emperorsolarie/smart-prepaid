import {
    Zap,
    LayoutDashboard,
    Cable,
    Gauge,
    CreditCard,
    History,
    LogOut
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Sidebar({ onLogout }) {
    return (
        <aside className="side-container">
            <div className="sidebar-brand">
                <h1>
                    <Zap size={26} />
                    <span>Smart</span>Prepaid
                </h1>
            </div>

            <nav className="sidebar-nav">
                <NavLink className="sidebar-links" to="/">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <NavLink className="sidebar-links" to="/ConnectMeter">
                    <Cable size={20} />
                    <span>Connect Meter</span>
                </NavLink>

                <NavLink className="sidebar-links" to="/meter">
                    <Gauge size={20} />
                    <span>My Meter</span>
                </NavLink>

                <NavLink className="sidebar-links" to="/recharge">
                    <CreditCard size={20} />
                    <span>Recharge</span>
                </NavLink>

                <NavLink className="sidebar-links" to="/history">
                    <History size={20} />
                    <span>History</span>
                </NavLink>
            </nav>

            <div className="logout-container">
                <button className="logout" onClick={onLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;