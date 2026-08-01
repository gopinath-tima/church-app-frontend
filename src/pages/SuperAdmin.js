import React from 'react';
import CreateUser from '../components/CreateUser';
import { jwtDecode } from 'jwt-decode';

function SuperAdmin() {
  const token = localStorage.getItem("token");
  let currentUser = null;

  if (token) {
    try {
      currentUser = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
    }
  }

  return (
    <div style={{ padding: "10px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "2rem", color: "#111827", fontWeight: "700", margin: "0 0 8px 0" }}>Super Admin Dashboard</h1>
        <p style={{ color: "#6b7280", fontSize: "1.05rem", margin: 0 }}>Control panel for organization administration and secondary user management.</p>
      </div>

      <CreateUser user={currentUser} />
    </div>
  );
}

export default SuperAdmin;