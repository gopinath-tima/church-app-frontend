import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Alerts from './Alerts';
import { 
  Megaphone, Send, History, Bell, Plus, Trash2, Edit2, 
  Mail, MessageSquare, Check, X
} from 'lucide-react';
import './Communication.css';

function Communication() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'announcements';
  
  const [activeTab, setActiveTab] = useState(tabParam);

  // Sync state with URL
  useEffect(() => {
    if (tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
    setActiveTab(tab);
  };
  
  // Data States
  const [members, setMembers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // UI Loading/Error States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Announcement Modal/Form States
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [annForm, setAnnForm] = useState({ title: '', content: '', targetAudience: 'ALL' });
  
  // Broadcast Form States
  const [targetType, setTargetType] = useState('ALL'); // 'ALL', 'GROUP', 'INDIVIDUAL'
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState(['EMAIL']); // 'EMAIL', 'WHATSAPP', 'SMS', 'PUSH'
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [bcSuccessMsg, setBcSuccessMsg] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt");
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  };

  const loadData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const config = getAuthHeaders();
      
      const fetchMembers = axios.get('http://localhost:8081/api/members', config)
        .then(res => {
          const mData = res.data.content ? res.data.content : res.data;
          setMembers(Array.isArray(mData) ? mData : []);
        })
        .catch(err => {
          console.error("Failed to load members:", err);
          if (err.response?.status !== 403) {
            setErrorMsg(prev => prev || 'Failed to sync members list.');
          }
        });

      const fetchGroups = axios.get('http://localhost:8081/api/groups', config)
        .then(res => setGroups(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error("Failed to load groups:", err));

      const fetchAnnouncements = axios.get('http://localhost:8081/api/announcements', config)
        .then(res => setAnnouncements(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error("Failed to load announcements:", err));

      const fetchLogs = axios.get('http://localhost:8081/api/communication/logs', config)
        .then(res => setLogs(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error("Failed to load logs:", err));

      await Promise.all([fetchMembers, fetchGroups, fetchAnnouncements, fetchLogs]);
    } catch (err) {
      console.error("Failed to sync communication data:", err);
      setErrorMsg('Failed to sync data with the server. Please verify the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD handlers for Announcements
  const handleOpenAnnModal = (ann = null) => {
    if (ann) {
      setEditingAnn(ann);
      setAnnForm({ title: ann.title, content: ann.content, targetAudience: ann.targetAudience });
    } else {
      setEditingAnn(null);
      setAnnForm({ title: '', content: '', targetAudience: 'ALL' });
    }
    setIsAnnModalOpen(true);
  };

  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthHeaders();
      const payload = {
        ...annForm,
        authorName: localStorage.getItem("username") || "Administrator"
      };

      if (editingAnn) {
        const res = await axios.put(`http://localhost:8081/api/announcements/${editingAnn.id}`, payload, config);
        setAnnouncements(announcements.map(a => a.id === editingAnn.id ? res.data : a));
      } else {
        const res = await axios.post('http://localhost:8081/api/announcements', payload, config);
        setAnnouncements([res.data, ...announcements]);
      }
      setIsAnnModalOpen(false);
    } catch (err) {
      alert("Error saving announcement");
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`http://localhost:8081/api/announcements/${id}`, getAuthHeaders());
      setAnnouncements(announcements.filter(a => a.id !== id));
    } catch (err) {
      alert("Error deleting announcement");
    }
  };

  // Broadcast handlers
  const handleToggleChannel = (chan) => {
    setSelectedChannels(prev => 
      prev.includes(chan) ? prev.filter(c => c !== chan) : [...prev, chan]
    );
  };

  const handleToggleMember = (id) => {
    setSelectedMemberIds(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (selectedChannels.length === 0) {
      alert("Please select at least one delivery channel (Email, WhatsApp, SMS, or Push).");
      return;
    }
    if (broadcastMessage.trim() === '') {
      alert("Please enter a message body to broadcast.");
      return;
    }

    // Determine target member IDs
    let targetIds = [];
    if (targetType === 'ALL') {
      targetIds = members.map(m => m.memberId);
    } else if (targetType === 'GROUP') {
      if (!selectedGroupId) {
        alert("Please select a target group.");
        return;
      }
      // Note: Group Members must be loaded or we fetch from group members endpoint
      try {
        setIsLoading(true);
        const res = await axios.get(`http://localhost:8081/api/groups/${selectedGroupId}/members`, getAuthHeaders());
        targetIds = res.data.map(gm => gm.memberId);
      } catch (err) {
        alert("Failed to retrieve group members.");
        setIsLoading(false);
        return;
      } finally {
        setIsLoading(false);
      }
    } else {
      if (selectedMemberIds.length === 0) {
        alert("Please select at least one recipient.");
        return;
      }
      targetIds = selectedMemberIds;
    }

    if (targetIds.length === 0) {
      alert("No recipients selected or found in target pool.");
      return;
    }

    try {
      setIsLoading(true);
      setBcSuccessMsg('');
      const config = getAuthHeaders();
      const payload = {
        memberIds: targetIds,
        channels: selectedChannels,
        subject: broadcastSubject,
        message: broadcastMessage
      };

      await axios.post('http://localhost:8081/api/communication/send', payload, config);
      
      setBcSuccessMsg(`Broadcast successfully sent to ${targetIds.length} members!`);
      setBroadcastSubject('');
      setBroadcastMessage('');
      setSelectedMemberIds([]);
      
      // Reload logs
      const resLogs = await axios.get('http://localhost:8081/api/communication/logs', config);
      setLogs(resLogs.data);
    } catch (err) {
      alert("Failed to send broadcast.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTargetAudienceName = (code) => {
    if (code === 'ALL') return 'Everyone';
    if (code === 'MEMBERS') return 'All Members';
    const gp = groups.find(g => String(g.groupId) === String(code));
    return gp ? `Group: ${gp.name}` : code;
  };

  return (
    <div className="comm-container">
      {/* Page Header */}
      <div className="comm-header">
        <div>
          <h1 className="comm-title">Communication Center</h1>
          <p className="comm-subtitle">Manage church announcements and broadcast messages via SMS, Email, WhatsApp, and Push notifications.</p>
        </div>
        <button className="comm-btn-reload" onClick={loadData}>Sync Center</button>
      </div>

      {errorMsg && (
        <div className="comm-alert-danger">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tabs Menu */}
      <div className="comm-tabs-nav">
        <button className={`comm-nav-item ${activeTab === 'announcements' ? 'active' : ''}`} onClick={() => handleTabChange('announcements')}>
          <Megaphone size={18} /> Announcement Board
        </button>
        <button className={`comm-nav-item ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => handleTabChange('broadcast')}>
          <Send size={18} /> Send Broadcast
        </button>
        <button className={`comm-nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => handleTabChange('logs')}>
          <History size={18} /> Sent Logs
        </button>
        <button className={`comm-nav-item ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => handleTabChange('alerts')}>
          <Bell size={18} /> System Alerts
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="comm-content-panel">
        
        {/* ==================== ANNOUNCEMENTS PANEL ==================== */}
        {activeTab === 'announcements' && (
          <div>
            <div className="comm-panel-header">
              <h3>Active Announcements</h3>
              <button className="comm-btn-primary" onClick={() => handleOpenAnnModal()}><Plus size={16} /> Add Announcement</button>
            </div>

            {announcements.length === 0 ? (
              <div className="comm-empty-state">
                <Megaphone size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <h4>No active announcements</h4>
                <p>Post church news, scheduling changes, or events for everyone to view.</p>
              </div>
            ) : (
              <div className="comm-ann-grid">
                {announcements.map(ann => (
                  <div key={ann.id} className="comm-ann-card">
                    <div className="comm-ann-card-header">
                      <div>
                        <h4>{ann.title}</h4>
                        <div className="comm-ann-meta">
                          <span>👤 By {ann.authorName}</span>
                          <span>•</span>
                          <span>📅 {new Date(ann.createdDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="comm-card-actions">
                        <button onClick={() => handleOpenAnnModal(ann)}><Edit2 size={13} /></button>
                        <button className="danger" onClick={() => handleDeleteAnnouncement(ann.id)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                    <p className="comm-ann-text">{ann.content}</p>
                    <div className="comm-ann-footer">
                      <span className="comm-badge-audience">Target: {getTargetAudienceName(ann.targetAudience)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================== BROADCAST PANEL ==================== */}
        {activeTab === 'broadcast' && (
          <div className="comm-broadcast-layout">
            <form onSubmit={handleSendBroadcast} className="comm-broadcast-form">
              <h3>Draft Broadcast Message</h3>
              <p className="comm-form-desc">Select delivery channels and target groups to dispatch a custom notification.</p>

              {bcSuccessMsg && (
                <div className="comm-alert-success">
                  ✅ {bcSuccessMsg}
                </div>
              )}

              {/* Step 1: Channels */}
              <div className="comm-form-section">
                <label className="comm-form-label">1. Choose Delivery Channels</label>
                <div className="comm-channel-options">
                  <button type="button" className={`comm-chan-btn ${selectedChannels.includes('EMAIL') ? 'active' : ''}`} onClick={() => handleToggleChannel('EMAIL')}>
                    <Mail size={16} /> Email
                  </button>
                  <button type="button" className={`comm-chan-btn ${selectedChannels.includes('WHATSAPP') ? 'active' : ''}`} onClick={() => handleToggleChannel('WHATSAPP')}>
                    <MessageSquare size={16} /> WhatsApp
                  </button>
                  <button type="button" className={`comm-chan-btn ${selectedChannels.includes('SMS') ? 'active' : ''}`} onClick={() => handleToggleChannel('SMS')}>
                    <MessageSquare size={16} /> SMS
                  </button>
                  <button type="button" className={`comm-chan-btn ${selectedChannels.includes('PUSH') ? 'active' : ''}`} onClick={() => handleToggleChannel('PUSH')}>
                    <Bell size={16} /> In-App Push
                  </button>
                </div>
              </div>

              {/* Step 2: Target Audience */}
              <div className="comm-form-section">
                <label className="comm-form-label">2. Target Audience</label>
                <div className="comm-audience-selector">
                  <label className="comm-radio-label">
                    <input type="radio" name="targetType" checked={targetType === 'ALL'} onChange={() => setTargetType('ALL')} /> All Members ({members.length})
                  </label>
                  <label className="comm-radio-label">
                    <input type="radio" name="targetType" checked={targetType === 'GROUP'} onChange={() => setTargetType('GROUP')} /> Filter by Group
                  </label>
                  <label className="comm-radio-label">
                    <input type="radio" name="targetType" checked={targetType === 'INDIVIDUAL'} onChange={() => setTargetType('INDIVIDUAL')} /> Select Individuals
                  </label>
                </div>

                {targetType === 'GROUP' && (
                  <div style={{ marginTop: '12px' }}>
                    <select className="comm-select" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)}>
                      <option value="">Select Target Group...</option>
                      {groups.map(g => <option key={g.groupId} value={g.groupId}>{g.name} ({g.category})</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 3: Message Body */}
              <div className="comm-form-section">
                <label className="comm-form-label">3. Message Details</label>
                {(selectedChannels.includes('EMAIL') || selectedChannels.includes('PUSH')) && (
                  <input type="text" className="comm-input" placeholder="Subject / Title" value={broadcastSubject} onChange={e => setBroadcastSubject(e.target.value)} required={selectedChannels.includes('EMAIL')} style={{ marginBottom: '12px' }} />
                )}
                <textarea className="comm-textarea" rows="6" placeholder="Write your announcement or message here..." value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} required />
              </div>

              <button type="submit" className="comm-btn-submit" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Send Broadcast Notification'}
              </button>
            </form>

            {/* Individual Members Checklist Panel */}
            {targetType === 'INDIVIDUAL' && (
              <div className="comm-members-checklist-card">
                <div className="comm-checklist-header">
                  <h4>Select Recipients</h4>
                  <span>{selectedMemberIds.length} selected</span>
                </div>
                <div className="comm-checklist-scroll">
                  {members.map(m => {
                    const isChecked = selectedMemberIds.includes(m.memberId);
                    return (
                      <div key={m.memberId} className={`comm-checklist-item ${isChecked ? 'selected' : ''}`} onClick={() => handleToggleMember(m.memberId)}>
                        <div className="comm-chk-box">{isChecked && <Check size={12} />}</div>
                        <div>
                          <p className="comm-member-name">{m.firstName} {m.lastName}</p>
                          <p className="comm-member-info">📞 {m.contactNumber || 'No phone'} | ✉️ {m.email || 'No email'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SENT LOGS PANEL ==================== */}
        {activeTab === 'logs' && (
          <div>
            <div className="comm-panel-header">
              <h3>Outbox History</h3>
              <p className="comm-panel-desc">A complete log of outgoing text broadcasts, emails, and SMS alerts.</p>
            </div>

            {logs.length === 0 ? (
              <div className="comm-empty-state">
                <History size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                <h4>No broadcast history found</h4>
                <p>Once you dispatch a broadcast message, tracking logs will appear here.</p>
              </div>
            ) : (
              <>
                <div className="comm-table-container desktop-only">
                  <table className="comm-table">
                    <thead>
                      <tr>
                        <th>Sent Date</th>
                        <th>Channel</th>
                        <th>Recipient</th>
                        <th>Subject</th>
                        <th>Message</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map(log => (
                        <tr key={log.id}>
                          <td className="comm-td-date">{new Date(log.sentDate).toLocaleString()}</td>
                          <td>
                            <span className={`comm-badge-channel ${log.channel.toLowerCase()}`}>
                              {log.channel}
                            </span>
                          </td>
                          <td className="comm-td-recipient" title={log.recipient}>{log.recipient}</td>
                          <td className="comm-td-subject" title={log.subject}>{log.subject || '—'}</td>
                          <td className="comm-td-message" title={log.message}>{log.message}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span className={`comm-status-badge ${log.status.toLowerCase()}`}>
                              {log.status === 'SENT' ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="comm-mobile-list mobile-only">
                  {logs.map(log => (
                    <div key={log.id} className="comm-mobile-card">
                      <div className="comm-mobile-card-header">
                        <div>
                          <h4 className="comm-mobile-card-title">{log.subject || '—'}</h4>
                          <p className="comm-mobile-card-subtitle">{new Date(log.sentDate).toLocaleString()}</p>
                        </div>
                        <span className={`comm-status-badge ${log.status.toLowerCase()}`}>
                          {log.status === 'SENT' ? 'Success' : 'Failed'}
                        </span>
                      </div>
                      <div className="comm-mobile-card-body">
                        <div className="comm-mobile-card-row">
                          <span className="comm-mobile-label">Channel</span>
                          <span className="comm-mobile-value">
                            <span className={`comm-badge-channel ${log.channel.toLowerCase()}`}>
                              {log.channel}
                            </span>
                          </span>
                        </div>
                        <div className="comm-mobile-card-row">
                          <span className="comm-mobile-label">Recipient</span>
                          <span className="comm-mobile-value">{log.recipient}</span>
                        </div>
                        <div className="comm-mobile-card-row">
                          <span className="comm-mobile-label">Message</span>
                          <span className="comm-mobile-value">{log.message}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ==================== ALERTS PANEL ==================== */}
        {activeTab === 'alerts' && (
          <Alerts />
        )}

      </div>

      {/* Announcement Create/Edit Modal */}
      {isAnnModalOpen && (
        <div className="comm-modal-overlay">
          <div className="comm-modal">
            <div className="comm-modal-header">
              <h3>{editingAnn ? 'Edit Announcement' : 'Post New Announcement'}</h3>
              <button onClick={() => setIsAnnModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveAnnouncement}>
              <div className="comm-modal-body">
                <div className="comm-form-group">
                  <label>Title</label>
                  <input type="text" className="comm-input" required value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} />
                </div>
                <div className="comm-form-group">
                  <label>Target Audience</label>
                  <select className="comm-select" value={annForm.targetAudience} onChange={e => setAnnForm({...annForm, targetAudience: e.target.value})}>
                    <option value="ALL">Everyone</option>
                    <option value="MEMBERS">All Members</option>
                    {groups.map(g => <option key={g.groupId} value={String(g.groupId)}>Group: {g.name}</option>)}
                  </select>
                </div>
                <div className="comm-form-group">
                  <label>Content Description</label>
                  <textarea className="comm-textarea" rows="5" required value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} />
                </div>
              </div>
              <div className="comm-modal-footer">
                <button type="button" className="comm-btn-sec" onClick={() => setIsAnnModalOpen(false)}>Cancel</button>
                <button type="submit" className="comm-btn-primary">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Communication;