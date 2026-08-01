import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import BranchSelector from '../components/BranchSelector';
import './Home.css';

const Home = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFamilies: 0,
    totalEvents: 0,
    totalTransactions: 0
  });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  let username = "User";
  try {
    if (token) {
      const decoded = jwtDecode(token);
      let rawUsername = decoded.sub || decoded.username || "User";
      username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1).toLowerCase();
    }
  } catch (err) {}

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  return (
    <div className="home-dashboard">
      <div className="home-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>Welcome Back, {username}!</h1>
          <p>Here is an overview of your branch's activity.</p>
        </div>
        <div style={{ marginTop: '10px' }}>
          <BranchSelector />
        </div>
      </div>

      <div className="home-stats-grid">
        <div className="stat-card">
          <div className="stat-icon members-icon">👥</div>
          <div className="stat-details">
            <h3>{loading ? '...' : stats.totalMembers}</h3>
            <p>Total Members</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon families-icon">👨‍👩‍👧‍👦</div>
          <div className="stat-details">
            <h3>{loading ? '...' : stats.totalFamilies}</h3>
            <p>Total Families</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon events-icon">📅</div>
          <div className="stat-details">
            <h3>{loading ? '...' : stats.totalEvents}</h3>
            <p>Total Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon transactions-icon">💳</div>
          <div className="stat-details">
            <h3>{loading ? '...' : stats.totalTransactions}</h3>
            <p>Total Offerings</p>
          </div>
        </div>
      </div>

      <div className="home-cards-container">
        <div className="home-card">
          <div className="card-icon">👋</div>
          <h3>Getting Started</h3>
          <p>Select an option from the left menu to begin managing your church.</p>
        </div>
        <div className="home-card">
          <div className="card-icon">🛡️</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h3>Secure Session</h3>
              <p>Your access is automatically restricted to your assigned branch.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
