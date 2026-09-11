import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Navbar/Navbar";
import './AdminLayout.css';

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed((prev) => !prev);

    return (
        <div className="layout-wrapper">
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
            />

            <div className="layout-content">
                <Topbar collapsed={collapsed} setCollapsed={setCollapsed} toggleSidebar={toggleSidebar} />

                <main className="layout-main">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;