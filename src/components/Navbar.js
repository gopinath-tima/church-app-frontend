import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    // Don't show the navbar on the login screen
    if (!token) return null;

    let roles = [];
    try {
        const decoded = jwtDecode(token);
        roles = decoded.roles || [];
    } catch (err) {
        return null;
    }

    let allowedLinks = [];

    // 1. Admin Dashboards
    if (roles.includes("SUPER_PLUS_ADMIN")) {
        allowedLinks.push({ path: "/super-plus-admin", name: "Super Plus Admin" });
    }
    if (roles.includes("SUPER_ADMIN")) {
        allowedLinks.push({ path: "/super-admin", name: "Super Admin" });
    }
    if (roles.includes("ADMIN")) {
        allowedLinks.push({ path: "/admin", name: "Admin Panel" });
    }

    // 2. Module Access Logic
    const isAdmin = roles.some(r => ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(r));

    if (isAdmin || roles.includes("CORE")) allowedLinks.push({ path: "/core", name: "Core" });
    if (isAdmin || roles.includes("INVENTORY")) allowedLinks.push({ path: "/inventory", name: "Inventory" });
    if (isAdmin || roles.includes("FINANCE")) allowedLinks.push({ path: "/finance", name: "Finance" });
    if (isAdmin || roles.includes("WORKFORCE")) allowedLinks.push({ path: "/workforce", name: "Workforce" });
    if (isAdmin || roles.includes("COMMUNICATION")) allowedLinks.push({ path: "/communication", name: "Communication" });
    if (isAdmin || roles.includes("REPORTING")) allowedLinks.push({ path: "/reporting", name: "Reporting" });

    // ✅ The new Add Member button
    if (isAdmin || roles.includes("ADD_MEMBER")) allowedLinks.push({ path: "/add-member", name: "Add Member" });

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav style={{
            backgroundColor: "#2c3e50",
            padding: "15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "white",
            flexWrap: "wrap", /* Helps if the menu gets too wide */
            gap: "10px"
        }}>
            <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>ChurchApp</div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                {allowedLinks.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        style={{ color: "white", textDecoration: "none", margin: "0 10px", fontWeight: "500", whiteSpace: "nowrap" }}
                    >
                        {link.name}
                    </Link>
                ))}

                <button
                    onClick={handleLogout}
                    style={{
                        marginLeft: "15px",
                        padding: "8px 15px",
                        backgroundColor: "#e74c3c",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;