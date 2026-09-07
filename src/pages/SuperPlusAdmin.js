import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CreateUser from '../components/CreateUser';
import Branches from './Branches';
import './SuperPlusAdmin.css';

function SuperPlusAdmin() {
  const token = localStorage.getItem("token");
  let currentUser = null;

  if (token) {
    try {
      currentUser = jwtDecode(token);
    } catch (err) {
      console.error("Invalid token");
    }
  }

  const [users, setUsers] = useState([]);
  const [liveTime, setLiveTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [activeTab, setActiveTab] = useState('overview'); // overview, users, create, modules, settings
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // System Settings state
  const [dbSettings, setDbSettings] = useState([]);
  const [localSettings, setLocalSettings] = useState({});

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRoles, setEditRoles] = useState([]);

  const fetchUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
      setError(err.response?.data?.message || "Failed to fetch user accounts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get("https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/settings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDbSettings(response.data);
      const sMap = {};
      response.data.forEach(item => {
        sMap[item.settingKey] = item.settingValue;
      });
      setLocalSettings(sMap);
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  const handleDeleteUser = async (userId, username) => {
    if (username === currentUser?.sub) {
      alert("You cannot delete yourself!");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await axios.delete(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User deleted successfully!");
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword("");
    setEditRoles(user.roles || []);
  };

  const handleEditRoleToggle = (role) => {
    setEditRoles(prev => {
      const exists = prev.includes(role);
      const isAdminRole = ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(role);

      if (exists) {
        return prev.filter(r => r !== role);
      } else {
        if (isAdminRole) {
          return [role];
        } else {
          return [...prev.filter(r => !["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(r)), role];
        }
      }
    });
  };

  const handleSaveUser = async () => {
    if (!editUsername) {
      alert("Username cannot be empty");
      return;
    }
    try {
      await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/users/${editingUser.id}`, {
        username: editUsername,
        password: editPassword || null,
        roles: editRoles
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("User updated successfully!");
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleSettingChange = (key, val) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await axios.post("https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/settings/update", localSettings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("System Settings saved successfully!");
      fetchSettings();
    } catch (err) {
      alert("Failed to save settings: " + (err.response?.data?.message || err.message));
    }
  };

  const coreModules = [
    { value: "DOCUMENTS", label: "Documents" },
    { value: "CONTACTS", label: "Contacts & Families" },
    { value: "ACCOUNTING", label: "Accounting & Donations" },
    { value: "GROUPS", label: "Groups" },
    { value: "EVENTS", label: "Events" },
    { value: "FORMS", label: "Forms" },
    { value: "MINISTRY", label: "Ministry (Check-In)" },
    { value: "INVENTORY", label: "Assets / Inventory" },
    { value: "COMMUNICATION", label: "Communication" },
    { value: "ADD_MEMBER", label: "Add Member" }
  ];

  const adminRoles = [
    { value: "SUPER_PLUS_ADMIN", label: "Super Plus Admin" },
    { value: "SUPER_ADMIN", label: "Super Admin" },
    { value: "ADMIN", label: "Admin" }
  ];

  const getRoleBadgeClass = (role) => {
    if (role === 'SUPER_PLUS_ADMIN') return 'role-badge superplus-role';
    if (role === 'SUPER_ADMIN') return 'role-badge super-role';
    if (role === 'ADMIN') return 'role-badge admin-role';
    return 'role-badge module-role';
  };

  const modulesInfo = [
    { name: "Contacts & Families", desc: "Manage members, families, and visitor profiles. View directory details.", path: "/people", icon: "👥" },
    { name: "Accounting & Donations", desc: "Track contributions, donations, accounting metrics and transaction history.", path: "/accounting", icon: "💰" },
    { name: "Groups Management", desc: "Organize bible study, ministry groups, and members within them.", path: "/groups", icon: "⛪" },
    { name: "Events Scheduler", desc: "Create, monitor and schedule church events and public calendars.", path: "/events", icon: "📅" },
    { name: "Form Builder", desc: "Collect information through custom registration and feedback forms.", path: "/forms", icon: "📝" },
    { name: "Ministry Check-In", desc: "Check-in kids and volunteers, track attendance, and run reports.", path: "/check-in", icon: "🛡️" },
    { name: "Asset & Inventory", desc: "Catalog church property, equipment, and room resources.", path: "/assets", icon: "📦" },
    { name: "Communication Portal", desc: "Send automated announcements, logs, texts, and email newsletters.", path: "/communication", icon: "✉️" },
    { name: "Add Member", desc: "Directly register new members into the primary central database.", path: "/add-member", icon: "➕" },
    { name: "Documents Vault", desc: "Upload and share essential documents, brochures, and media files.", path: "/documents", icon: "📁" },
    { name: "Log Management", desc: "Audit trail record deck. Tracks every user activity and API requests without delete button.", path: "/logs", icon: "📑" }
  ];

  // Helper to filter settings by category
  const renderSettingRow = (key, label, type = "text", options = []) => {
    const value = localSettings[key] || "";
    return (
      <div className="setting-row" key={key}>
        <div className="setting-meta">
          <label className="setting-label">{label}</label>
          <span className="setting-desc">{dbSettings.find(s => s.settingKey === key)?.description}</span>
        </div>
        <div className="setting-input-area">
          {type === "text" && (
            <input 
              type="text" 
              className="admin-input" 
              style={{ paddingLeft: '14px' }} 
              value={value} 
              onChange={e => handleSettingChange(key, e.target.value)} 
            />
          )}
          {type === "toggle" && (
            <label className="switch">
              <input 
                type="checkbox" 
                checked={value === "true"} 
                onChange={e => handleSettingChange(key, e.target.checked ? "true" : "false")} 
              />
              <span className="slider round"></span>
            </label>
          )}
          {type === "select" && (
            <select 
              className="admin-input" 
              style={{ padding: '14px' }} 
              value={value} 
              onChange={e => handleSettingChange(key, e.target.value)}
            >
              {options.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="super-admin-container">
      <div className="dashboard-header">
        <div className="header-title">
          <h1>Super Plus Admin Panel</h1>
          <p>Complete control center for user administration, role assignment, and core system modules.</p>
        </div>
        <div className="live-clock-card">
          <span className="live-clock-dot"></span>
          <span className="live-clock-text">System Time: {liveTime}</span>
        </div>
      </div>

      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>User Accounts</button>
        <button className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Create Account</button>
        <button className={`tab-btn ${activeTab === 'modules' ? 'active' : ''}`} onClick={() => setActiveTab('modules')}>System Modules</button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>System Settings</button>
        <button className={`tab-btn ${activeTab === 'branches' ? 'active' : ''}`} onClick={() => setActiveTab('branches')}>Branch Management</button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <h3>Total Accounts</h3>
                <p>{loading ? "..." : users.length || "10+"}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🔑</div>
              <div className="stat-info">
                <h3>Admin Levels</h3>
                <p>3</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>⚙️</div>
              <div className="stat-info">
                <h3>System Modules</h3>
                <p>10</p>
              </div>
            </div>
          </div>

          <div className="table-card" style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: '16px', fontSize: '1.25rem', fontWeight: '700' }}>Super Plus Admin Privileges</h2>
            <p style={{ color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px 0' }}>
              As a <strong>Super Plus Admin</strong>, you possess root permissions. You are authorized to:
            </p>
            <ul style={{ color: '#4b5563', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
              <li>Create and manage user credentials for any system operator.</li>
              <li>Assign highest administrative access, including other <strong>Super Plus Admins</strong>.</li>
              <li>Instantly access, audit, and navigate all system modules.</li>
              <li>Override restriction rules across documents, finances, child safety, and group parameters.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="table-card">
          <div className="table-header">
            <h2>System Accounts</h2>
            <button className="btn-primary" onClick={fetchUsers} style={{ padding: '8px 14px', fontSize: '0.9rem' }}>
              Refresh List
            </button>
          </div>

          {error && <div style={{ padding: '20px', color: '#b91c1c', backgroundColor: '#fef2f2' }}>{error}</div>}

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Assigned Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600', color: '#6b7280' }}>{u.id}</td>
                    <td style={{ fontWeight: '600' }}>{u.username}</td>
                    <td>
                      <div className="roles-badge-container">
                        {u.roles?.map(role => (
                          <span key={role} className={getRoleBadgeClass(role)}>{role}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="action-btn-group">
                        <button className="action-btn edit" onClick={() => handleOpenEdit(u)}>
                          ✏️ Edit Roles
                        </button>
                        {u.username !== currentUser?.sub && (
                          <button className="action-btn delete" onClick={() => handleDeleteUser(u.id, u.username)}>
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#9ca3af', padding: '30px' }}>
                      No user accounts found. Click Refresh to load.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'create' && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CreateUser user={currentUser} />
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="module-grid">
          {modulesInfo.map(mod => (
            <div className="module-card" key={mod.name}>
              <div>
                <div className="module-card-header">
                  <div className="module-icon" style={{ fontSize: '24px' }}>{mod.icon}</div>
                  <div className="module-title">
                    <h3>{mod.name}</h3>
                    <span className="module-status">ACTIVE</span>
                  </div>
                </div>
                <p>{mod.desc}</p>
              </div>
              <a href={mod.path} className="module-link-btn">Launch Module &rarr;</a>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="table-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>All System Settings</h2>
              <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0 }}>Configure root parameters, security flags, and communication triggers.</p>
            </div>
            <button className="btn-primary" onClick={handleSaveSettings}>Save System Settings</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="settings-section">
              <h3 className="settings-section-title">General Settings</h3>
              <div className="settings-box">
                {renderSettingRow("church_name", "Church Name")}
                {renderSettingRow("timezone", "System Timezone", "select", ["UTC-5 (EST)", "UTC-6 (CST)", "UTC-8 (PST)", "UTC+0 (GMT)", "UTC+5:30 (IST)"])}
                {renderSettingRow("currency", "Base Currency", "select", ["USD ($)", "EUR (€)", "GBP (£)", "INR (₹)", "CAD (C$)"])}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'branches' && (
        <div style={{ marginTop: '24px' }}>
          <Branches />
        </div>
      )}

      {/* Editing Roles Modal */}
      {editingUser && (
        <div className="edit-modal-backdrop">
          <div className="edit-modal-content">
            <div className="modal-header">
              <span>Edit Account: {editingUser.username}</span>
              <button className="modal-close" onClick={() => setEditingUser(null)} style={{ fontSize: '24px' }}>&times;</button>
            </div>

            <div className="form-group">
              <label className="form-label">Username</label>
              <input 
                type="text" 
                className="admin-input" 
                style={{ paddingLeft: '14px' }} 
                value={editUsername}
                onChange={e => setEditUsername(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reset Password (leave empty to keep current)</label>
              <input 
                type="password" 
                className="admin-input" 
                style={{ paddingLeft: '14px' }} 
                placeholder="New password (optional)"
                value={editPassword}
                onChange={e => setEditPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign System Roles</label>
              <div className="roles-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                <div style={{ fontWeight: '600', color: '#4b5563', fontSize: '0.85rem', marginBottom: '6px' }}>ADMINISTRATORS (exclusive)</div>
                {adminRoles.map(opt => (
                  <label key={opt.value} className="role-checkbox-label">
                    <input 
                      type="checkbox" 
                      className="role-checkbox"
                      checked={editRoles.includes(opt.value)}
                      onChange={() => handleEditRoleToggle(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}

                <div style={{ fontWeight: '600', color: '#4b5563', fontSize: '0.85rem', marginTop: '12px', marginBottom: '6px' }}>MODULE OPERATORS (multi-select)</div>
                {coreModules.map(opt => (
                  <label key={opt.value} className="role-checkbox-label">
                    <input 
                      type="checkbox" 
                      className="role-checkbox"
                      checked={editRoles.includes(opt.value)}
                      onChange={() => handleEditRoleToggle(opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveUser}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperPlusAdmin;