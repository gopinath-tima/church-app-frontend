import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Admin() {
  const navigate = useNavigate();
  const [stats] = useState({ totalMembers: 0, activeMinistries: 0 });

  // Example of fetching dashboard data (you can wire this up to Java later!)
  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      // Placeholder for future backend calls
      // const response = await axios.get("https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } });
      // setStats(response.data);
    };
    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- STYLING OBJECTS ---
  const containerStyle = { display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f4f7f6" };
  const sidebarStyle = { width: "250px", backgroundColor: "#2c3e50", color: "white", display: "flex", flexDirection: "column" };
  const sidebarHeaderStyle = { padding: "20px", fontSize: "24px", fontWeight: "bold", textAlign: "center", borderBottom: "1px solid #34495e" };
  const menuButtonStyle = { width: "100%", padding: "15px 20px", backgroundColor: "transparent", color: "white", border: "none", textAlign: "left", fontSize: "16px", cursor: "pointer", borderBottom: "1px solid #34495e" };
  const mainContentStyle = { flex: 1, padding: "30px" };
  const cardContainerStyle = { display: "flex", gap: "20px", marginBottom: "30px" };
  const cardStyle = { flex: 1, backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", textAlign: "center" };

  return (
    <div style={containerStyle}>

      {/* SIDEBAR NAVIGATION */}
      <div style={sidebarStyle}>
        <div style={sidebarHeaderStyle}>Church Admin</div>
        <button style={menuButtonStyle} onClick={() => navigate('/admin')}>🏠 Dashboard</button>

        {/* Route to the massive form we just built! */}
        <button style={menuButtonStyle} onClick={() => navigate('/add-member')}>➕ Add New Member</button>

        <button style={menuButtonStyle} onClick={() => navigate('/members')}>👥 View Directory</button>
        <button style={menuButtonStyle} onClick={() => navigate('/ministries')}>🕊️ Manage Ministries</button>

        <div style={{ marginTop: "auto" }}>
          <button style={{ ...menuButtonStyle, backgroundColor: "#e74c3c", borderBottom: "none" }} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={mainContentStyle}>
        <h1 style={{ color: "#2c3e50", marginBottom: "10px" }}>Admin Dashboard</h1>
        <p style={{ color: "#7f8c8d", marginBottom: "30px" }}>Welcome back! Here is an overview of the church system.</p>

        {/* QUICK STATS CARDS */}
        <div style={cardContainerStyle}>
          <div style={cardStyle}>
            <h3 style={{ color: "#7f8c8d", margin: "0 0 10px 0" }}>Total Members</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#3498db", margin: 0 }}>{stats.totalMembers || "---"}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ color: "#7f8c8d", margin: "0 0 10px 0" }}>Active Ministries</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#27ae60", margin: 0 }}>{stats.activeMinistries || "---"}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={{ color: "#7f8c8d", margin: "0 0 10px 0" }}>Recent Registrations</h3>
            <p style={{ fontSize: "32px", fontWeight: "bold", color: "#e67e22", margin: 0 }}>0</p>
          </div>
        </div>

        {/* RECENT ACTIVITY SECTION */}
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          <h3 style={{ borderBottom: "2px solid #3498db", paddingBottom: "10px", color: "#2c3e50" }}>System Notifications</h3>
          <p style={{ color: "#555" }}>The database architecture has been successfully upgraded to support Multi-Table Transactions.</p>
          <p style={{ color: "#555" }}>JWT Authentication is active and enforcing role-based access.</p>
        </div>

      </div>
    </div>
  );
}

export default Admin;