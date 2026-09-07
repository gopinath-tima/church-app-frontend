import React, { useState } from "react";
import axios from "axios";
import "./CreateUser.css";

function CreateUser({ user }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);

  // Verify creator has admin rights
  const hasAdminRights = user?.roles?.some(role =>
    ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(role)
  );

  if (!user || !hasAdminRights) {
    return (
      <div className="access-denied-container">
        <div className="access-denied-icon">🔒</div>
        <h3>Access Denied</h3>
        <p>You do not have sufficient permissions to create user accounts.</p>
      </div>
    );
  }

  const coreModules = [
    { value: "DOCUMENTS", label: "Documents", icon: "📁" },
    { value: "CONTACTS", label: "Contacts & Families", icon: "👥" },
    { value: "ACCOUNTING", label: "Accounting & Donations", icon: "💰" },
    { value: "GROUPS", label: "Groups", icon: "⛪" },
    { value: "EVENTS", label: "Events", icon: "📅" },
    { value: "FORMS", label: "Forms", icon: "📝" },
    { value: "MINISTRY", label: "Ministry (Check-In)", icon: "🛡️" },
    { value: "INVENTORY", label: "Assets / Inventory", icon: "📦" },
    { value: "COMMUNICATION", label: "Communication", icon: "✉️" },
    { value: "ADD_MEMBER", label: "Add Member", icon: "➕" }
  ];

  let adminRoles = [];
  if (user.roles.includes("SUPER_PLUS_ADMIN")) {
    adminRoles = [
      { value: "SUPER_PLUS_ADMIN", label: "Super Plus Admin", desc: "Full root access to all systems, settings, and database management." },
      { value: "SUPER_ADMIN", label: "Super Admin", desc: "Access to all modules and system settings." },
      { value: "ADMIN", label: "Admin", desc: "General administrative controls and modules access." }
    ];
  } else if (user.roles.includes("SUPER_ADMIN")) {
    adminRoles = [
      { value: "ADMIN", label: "Admin", desc: "General administrative controls and modules access." }
    ];
  }

  // ✅ SMART UI LOGIC: Check if an Admin role is currently selected
  const isAdminSelected = selectedRoles.includes("SUPER_PLUS_ADMIN") || selectedRoles.includes("SUPER_ADMIN") || selectedRoles.includes("ADMIN");

  const handleRoleToggle = (roleValue) => {
    setSelectedRoles((prev) => {
      const isCurrentlyChecked = prev.includes(roleValue);

      if (isCurrentlyChecked) {
        // If it's already checked, uncheck it
        return prev.filter(r => r !== roleValue);
      } else {
        // ✅ If they check an Admin role, clear all other checkboxes to keep the database clean
        if (roleValue === "SUPER_PLUS_ADMIN" || roleValue === "SUPER_ADMIN" || roleValue === "ADMIN") {
          return [roleValue];
        } else {
          // Otherwise, just add the new module role normally
          return [...prev, roleValue];
        }
      }
    });
  };

  const createUser = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No token found. Please log in first.");
      return;
    }

    try {
      await axios.post(
        "https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/users/create",
        { username, password, roles: selectedRoles },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("User Created Successfully!");
      setUsername("");
      setPassword("");
      setSelectedRoles([]);
      setShowPassword(false);

    } catch (err) {
      if (err.response?.data && typeof err.response.data === 'object') {
        const errorMessages = Object.values(err.response.data).join("\n");
        alert("Validation Failed:\n" + errorMessages);
      } else {
        alert(err.response?.data || "Error creating user.");
      }
    }
  };

  return (
    <div className="premium-admin-card">
      <div className="premium-card-header">
        <div className="premium-card-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <div className="premium-card-header-text">
          <h3>Create New User Account</h3>
          <p>Add credentials and configure fine-grained system access levels.</p>
        </div>
      </div>

      <div className="premium-card-body">
        {/* Left Column: Credentials */}
        <div className="form-column credentials-section">
          <h4 className="section-subtitle">Account Credentials</h4>
          
          <div className="premium-form-group">
            <label className="premium-label">Username</label>
            <div className="premium-input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input
                type="text"
                className="premium-input"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="premium-form-group">
            <label className="premium-label">Password</label>
            <div className="premium-input-wrapper">
              <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                className="premium-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="helper-info-box">
            <h5>💡 Quick Help</h5>
            <ul>
              <li>Use a strong, unique username.</li>
              <li>Passwords must be at least 6 characters long.</li>
              <li>Administrative roles override individual module permissions.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Roles & Modules */}
        <div className="form-column roles-section">
          {adminRoles.length > 0 && (
            <div className="premium-form-group">
              <h4 className="section-subtitle">Administrative Roles</h4>
              <div className="admin-roles-grid">
                {adminRoles.map((role) => (
                  <label 
                    key={role.value} 
                    className={`admin-role-card ${selectedRoles.includes(role.value) ? "selected" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden-checkbox"
                      value={role.value}
                      checked={selectedRoles.includes(role.value)}
                      onChange={() => handleRoleToggle(role.value)}
                    />
                    <div className="admin-role-card-content">
                      <div className="role-header">
                        <span className="role-title">{role.label}</span>
                        <span className="checkbox-indicator"></span>
                      </div>
                      <p className="role-desc">{role.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="premium-form-group">
            <h4 className="section-subtitle">
              Module Access Permissions
              {isAdminSelected && <span className="disabled-badge">Admin Override Active</span>}
            </h4>
            <div className="modules-grid-selection">
              {coreModules.map((module) => {
                const isSelected = selectedRoles.includes(module.value);
                const isDisabled = isAdminSelected;

                return (
                  <label
                    key={module.value}
                    className={`module-selection-card ${isSelected ? "selected" : ""} ${isDisabled ? "disabled" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="hidden-checkbox"
                      value={module.value}
                      checked={isSelected}
                      onChange={() => handleRoleToggle(module.value)}
                      disabled={isDisabled}
                    />
                    <div className="module-card-inner">
                      <span className="module-emoji">{module.icon}</span>
                      <span className="module-name">{module.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="premium-card-footer">
        <button
          className="premium-submit-btn"
          onClick={createUser}
          disabled={!username || !password || selectedRoles.length === 0}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
          Create User Account
        </button>
      </div>
    </div>
  );
}

export default CreateUser;