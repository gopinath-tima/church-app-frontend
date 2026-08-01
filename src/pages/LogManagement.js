import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LogManagement.css';

function LogManagement() {
  const token = localStorage.getItem("token");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("ALL");
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get("http://localhost:8081/api/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError("Failed to fetch system logs. Check database connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatTimestamp = (tsStr) => {
    if (!tsStr) return "";
    try {
      const date = new Date(tsStr);
      return date.toLocaleString();
    } catch (e) {
      return tsStr;
    }
  };

  const toggleExpand = (id) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const formatKey = (key) => {
    const result = key.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const renderDetails = (details) => {
    if (!details || details.trim() === "") {
      return <div className="text-details empty">No data changes or payload recorded.</div>;
    }

    // Check if details is JSON
    if (details.trim().startsWith("{") || details.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(details);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        
        return (
          <div className="json-details-container">
            {items.map((item, index) => {
              if (typeof item !== 'object' || item === null) {
                return <div key={index} className="text-details">{String(item)}</div>;
              }
              
              const entries = Object.entries(item).filter(([key, val]) => {
                return val !== null && val !== "" && 
                       key !== "password" && key !== "profilePhoto" && 
                       key !== "photo" && !key.toLowerCase().endsWith("id");
              });

              if (entries.length === 0) {
                return <div key={index} className="text-details empty">No significant fields recorded.</div>;
              }

              return (
                <div key={index} className="details-grid-card">
                  {entries.map(([key, val]) => {
                    let displayValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
                    if (displayValue.includes("T") && displayValue.length >= 16 && !isNaN(Date.parse(displayValue))) {
                      displayValue = new Date(displayValue).toLocaleString();
                    }
                    return (
                      <div key={key} className="details-grid-item">
                        <span className="details-item-label">{formatKey(key)}</span>
                        <span className="details-item-value">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      } catch (e) {
        // Fallback to text
      }
    }

    // If it's a multiline diff text:
    if (details.includes("\n")) {
      const lines = details.split("\n");
      return (
        <div className="text-details-lines">
          {lines.map((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.startsWith("-")) {
              const match = trimmed.match(/^-\s*([^:]+):\s*(.*)$/);
              if (match) {
                return (
                  <div key={idx} className="diff-line">
                    <span className="diff-field">{formatKey(match[1])}</span>
                    <span className="diff-arrow">➜</span>
                    <span className="diff-value">{match[2]}</span>
                  </div>
                );
              }
            }
            if (trimmed.toLowerCase().startsWith("member targeted") || 
                trimmed.toLowerCase().startsWith("user targeted") ||
                trimmed.toLowerCase().startsWith("asset targeted") ||
                trimmed.toLowerCase().startsWith("group targeted") ||
                trimmed.toLowerCase().startsWith("event targeted") ||
                trimmed.toLowerCase().startsWith("document targeted") ||
                trimmed.toLowerCase().startsWith("transaction targeted") ||
                trimmed.toLowerCase().startsWith("family targeted") ||
                trimmed.toLowerCase().startsWith("announcement targeted")) {
              return <div key={idx} className="details-target-header">{line}</div>;
            }
            return <div key={idx} className={idx === 0 || trimmed.toLowerCase().startsWith("updated fields") ? "details-group-header" : "details-text-line"}>{line}</div>;
          })}
        </div>
      );
    }

    return <div className="text-details">{details}</div>;
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesMethod = selectedMethod === "ALL" || log.method === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  return (
    <div className="log-management-container">
      <div className="log-header">
        <div className="log-title">
          <h1>Log Management</h1>
          <p>System-wide activity log audit deck. Tracks operator actions, database state changes, and modified data.</p>
        </div>
        <button className="btn-primary" onClick={fetchLogs} style={{ padding: '10px 16px' }}>
          🔄 Refresh Audit Logs
        </button>
      </div>

      <div className="filter-card">
        <div className="filter-input-wrapper">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input 
            type="text" 
            className="filter-input" 
            placeholder="Search by User, Action, Endpoint, or Data details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ width: '180px' }}>
          <select 
            className="admin-input" 
            style={{ padding: '12px', background: '#f9fafb', fontSize: '0.95rem' }}
            value={selectedMethod}
            onChange={e => setSelectedMethod(e.target.value)}
          >
            <option value="ALL">All Methods</option>
            <option value="POST">POST (Create)</option>
            <option value="PUT">PUT (Update)</option>
            <option value="DELETE">DELETE (Remove)</option>
          </select>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px 20px', color: '#b91c1c', backgroundColor: '#fef2f2', borderRadius: '12px', marginBottom: '24px', fontWeight: '500' }}>
          {error}
        </div>
      )}

      <div className="log-table-card">
        <div style={{ overflowX: 'auto' }} className="desktop-only">
          <table className="log-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th style={{ width: '60px' }}>ID</th>
                <th>Operator</th>
                <th style={{ width: '100px' }}>HTTP Method</th>
                <th>Description / Action</th>
                <th>API Endpoint</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <React.Fragment key={log.id}>
                    <tr onClick={() => toggleExpand(log.id)} style={{ cursor: 'pointer' }} className={isExpanded ? 'selected-row' : ''}>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`expand-arrow ${isExpanded ? 'expanded' : ''}`}>
                          ▶
                        </span>
                      </td>
                      <td style={{ fontWeight: '600', color: '#6b7280' }}>{log.id}</td>
                      <td style={{ fontWeight: '700', color: '#1e3a8a' }}>{log.username}</td>
                      <td>
                        <span className={`method-badge ${log.method}`}>{log.method}</span>
                      </td>
                      <td style={{ fontWeight: '600' }}>{log.action}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#4b5563' }}>{log.endpoint}</td>
                      <td>
                        <span className={`status-badge ${log.responseStatus >= 200 && log.responseStatus < 300 ? 'success' : 'warning'}`}>
                          {log.responseStatus}
                        </span>
                      </td>
                      <td className="timestamp-text">{formatTimestamp(log.timestamp)}</td>
                    </tr>
                    {isExpanded && (
                      <tr className="details-row">
                        <td colSpan="8" className="details-cell">
                          <div className="details-wrapper">
                            <div className="details-header">
                              <strong>Data Payload / Action Details:</strong>
                            </div>
                            <div className="details-body">
                              {renderDetails(log.details)}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredLogs.length === 0 && !loading && (
                <tr>
                  <td colSpan="8">
                    <div className="no-logs-message">
                      No matching activity logs found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="log-mobile-list mobile-only">
          {filteredLogs.map(log => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div key={log.id} className="log-mobile-card" onClick={() => toggleExpand(log.id)}>
                <div className="log-mobile-card-header">
                  <div>
                    <h4 className="log-mobile-card-title">{log.username}</h4>
                    <p className="log-mobile-card-subtitle">{formatTimestamp(log.timestamp)}</p>
                  </div>
                  <span className={`status-badge ${log.responseStatus >= 200 && log.responseStatus < 300 ? 'success' : 'warning'}`}>
                    {log.responseStatus}
                  </span>
                </div>
                
                <div className="log-mobile-card-body">
                  <div className="log-mobile-card-row">
                    <span className="log-mobile-label">Action</span>
                    <span className="log-mobile-value">{log.action}</span>
                  </div>
                  <div className="log-mobile-card-row">
                    <span className="log-mobile-label">Method</span>
                    <span className="log-mobile-value">
                      <span className={`method-badge ${log.method}`}>{log.method}</span>
                    </span>
                  </div>
                  <div className="log-mobile-card-row">
                    <span className="log-mobile-label">Endpoint</span>
                    <span className="log-mobile-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{log.endpoint}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="log-mobile-details" onClick={(e) => e.stopPropagation()}>
                    <div className="details-header">
                      <strong>Data Payload / Action Details:</strong>
                    </div>
                    <div className="details-body">
                      {renderDetails(log.details)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredLogs.length === 0 && !loading && (
            <div className="no-logs-message">
              No matching activity logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogManagement;

