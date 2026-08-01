import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VisitorList.css';
import MemberDetailView from '../components/MemberDetailView';

// SVG Icons Component
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    filter: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    plus: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    email: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    arrowRight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    arrowLeft: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    people: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    trendingUp: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    status: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    award: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
    alertCircle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  };

  return (
    <span className={`svg-icon ${className}`} style={{ display: 'inline-flex', width: size, height: size }}>
      {icons[name] || null}
    </span>
  );
};

const VisitorList = () => {
  const navigate = useNavigate();

  const [visitors, setVisitors] = useState([]);
  const [members, setMembers] = useState([]);
  const [reports, setReports] = useState(null);
  const [activeTab, setActiveTab] = useState('converted'); // Set 'converted' (Converted List) as default active tab on page mount
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  
  const [conversionSuccess, setConversionSuccess] = useState(null);
  const [viewMember, setViewMember] = useState(null);

  // Visitor registration form state
  const [visitorForm, setVisitorForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    visitDate: new Date().toISOString().substring(0, 10),
    gender: 'Male',
    address: '',
    firstVisitNotes: '',
    status: 'Registered',
    convertedMemberId: null
  });

  useEffect(() => {
    fetchVisitors();
    fetchMembers();
    fetchReports();
  }, []);

  const fetchVisitors = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8081/api/visitors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisitors(response.data);
    } catch (err) {
      console.error("Error fetching visitors", err);
    }
  };

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8081/api/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let memberData = response.data;
      if (response.data && typeof response.data === 'object' && response.data.content) {
        memberData = response.data.content;
      }
      setMembers(Array.isArray(memberData) ? memberData : []);
    } catch (err) {
      console.error("Error fetching members, attempting fallback search...", err);
      try {
        const response = await axios.get("http://localhost:8081/api/members/search?type=name&value=");
        setMembers(Array.isArray(response.data) ? response.data : []);
      } catch (fallbackErr) {
        setMembers([]);
      }
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8081/api/visitors/reports", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
    } catch (err) {
      console.error("Error fetching reports", err);
    }
  };

  const handleUpdateVisitorStatus = async (visitorId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      const visitor = visitors.find(v => v.id === visitorId);
      const updated = { ...visitor, status: newStatus };
      await axios.put(`http://localhost:8081/api/visitors/${visitorId}`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchVisitors();
      fetchReports();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const handleConvertToMember = async (visitorId, firstName, lastName, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to convert ${firstName} ${lastName} to an active member?`)) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`http://localhost:8081/api/visitors/${visitorId}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setConversionSuccess(`Successfully converted ${firstName} to Member: ${response.data.customMemberId}`);
        fetchVisitors();
        fetchMembers();
        fetchReports();
        setTimeout(() => setConversionSuccess(null), 7000);
      }
    } catch (err) {
      console.error("Conversion failed", err);
      alert("Conversion failed. Please verify user details (email and mobile must be unique).");
    }
  };

  const handleVisitorChange = (e) => {
    const { name, value } = e.target;
    setVisitorForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegisterVisitor = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:8081/api/visitors", visitorForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setConversionSuccess(`Successfully registered visitor: ${visitorForm.firstName} ${visitorForm.lastName}!`);
      setTimeout(() => setConversionSuccess(null), 5000);
      setActiveTab('converted');
      setVisitorForm({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        visitDate: new Date().toISOString().substring(0, 10),
        gender: 'Male',
        address: '',
        firstVisitNotes: '',
        status: 'Registered',
        convertedMemberId: null
      });
      fetchVisitors();
      fetchReports();
    } catch (err) {
      console.error("Error registering visitor", err);
      alert("Failed to register visitor.");
    }
  };

  const handleViewClick = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:8081/api/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setViewMember(res.data);
    } catch (err) {
      alert(err.response?.data || "Unable to load member details.");
    }
  };

  const handleEditMember = (member) => {
    navigate(`/add-member?edit=${member.memberId}`);
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this member?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8081/api/members/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Member deleted successfully.");
      setViewMember(null);
      fetchMembers();
    } catch (err) {
      alert(err.response?.data || "Cannot delete this member.");
    }
  };

  const isConvertedStatus = (status) => {
    return status === 'Convert' || status === 'Converted';
  };

  const getCombinedMembersList = () => {
    const convertedVisitors = visitors.filter(v => isConvertedStatus(v.status));
    const pendingVisitors = visitors.filter(v => v.status === 'Registered' || v.status === 'In Progress');
    const registeredMembers = members.filter(m => {
      const isMatched = convertedVisitors.some(cv => cv.convertedMemberId === m.memberId || cv.email === m.email || cv.phoneNumber === m.contactNumber);
      return !isMatched;
    });

    const list = [];

    pendingVisitors.forEach(v => {
      list.push({
        id: v.id,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phoneNumber,
        visitDate: v.visitDate,
        status: v.status,
        type: 'registered_visitor'
      });
    });

    convertedVisitors.forEach(v => {
      const matchingMember = members.find(m => m.memberId === v.convertedMemberId || m.email === v.email);
      list.push({
        id: v.id,
        memberId: matchingMember?.memberId,
        customMemberId: matchingMember?.customMemberId || v.convertedMemberId,
        firstName: v.firstName,
        lastName: v.lastName,
        email: v.email,
        phoneNumber: v.phoneNumber,
        visitDate: v.visitDate,
        status: 'Convert',
        type: 'converted_member'
      });
    });

    registeredMembers.forEach(m => {
      list.push({
        memberId: m.memberId,
        customMemberId: m.customMemberId,
        firstName: m.firstName,
        lastName: m.lastName,
        email: m.email,
        phoneNumber: m.contactNumber,
        visitDate: m.joinDate || m.dateJoined || 'N/A',
        status: 'Active',
        type: 'registered_member'
      });
    });

    return list;
  };

  const getFilteredList = () => {
    if (activeTab === 'converted') {
      const list = getCombinedMembersList();
      return list.filter(item => {
        const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
        const queryMatch = fullName.includes(searchQuery.toLowerCase()) || 
                           (item.email && item.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           (item.phoneNumber && item.phoneNumber.includes(searchQuery)) ||
                           (item.customMemberId && String(item.customMemberId).toLowerCase().includes(searchQuery.toLowerCase()));
        return queryMatch;
      });
    }
    return [];
  };

  const filteredList = getFilteredList();

  const getInitials = (firstName, lastName) => {
    const f = firstName ? firstName.charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${f}${l}` || 'V';
  };

  const getAvatarColor = (name) => {
    const colors = [
      'linear-gradient(135deg, #6366f1, #4338ca)',
      'linear-gradient(135deg, #0ea5e9, #0284c7)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #f59e0b, #d97706)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #f97316, #ea580c)',
    ];
    let hash = 0;
    const str = name || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="visitor-container">
      <MemberDetailView 
        viewMember={viewMember} 
        onClose={() => setViewMember(null)} 
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      <div className="visitor-header">
        <div className="header-text-section">
          <h1>Visitor Directory</h1>
          <p>Search visitors, monitor follow-up metrics, convert to members, and view assimilation reports.</p>
        </div>
        <div className="tab-buttons">
          <button 
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <Icon name="plus" size={16} className="tab-icon" />
            New Visitor
          </button>
          <button 
            className={`tab-btn ${activeTab === 'converted' ? 'active' : ''}`}
            onClick={() => setActiveTab('converted')}
          >
            <Icon name="award" size={16} className="tab-icon" />
            Converted List
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <Icon name="trendingUp" size={16} className="tab-icon" />
            Reports & Stats
          </button>
        </div>
      </div>

      {conversionSuccess && (
        <div className="alert alert-success slide-up">
          <Icon name="check" size={20} className="alert-icon" />
          <span>{conversionSuccess}</span>
        </div>
      )}

      {activeTab === 'converted' && (
        <div className="visitor-directory-view fade-in">
          {/* Toolbar */}
          <div className="directory-toolbar glass-card">
            <div className="directory-header-row">
              <div className="directory-header-left">
                <h3>Converted Member Directory</h3>
                <p className="directory-desc-row">List of all visitor profiles registered or converted to active members.</p>
              </div>
              <button className="btn btn-primary add-visitor-btn-large" onClick={() => setActiveTab('register')}>
                <Icon name="plus" size={16} className="btn-icon" />
                Register New Visitor
              </button>
            </div>
            
            <div className="directory-search-filters">
              <div className="search-box-container">
                <Icon name="search" size={16} className="search-box-icon" />
                <input 
                  type="text" 
                  placeholder="Search registered/converted members by name, email or phone..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>

          {/* Grid of Results */}
          <div className="visitor-directory-grid">
            {filteredList.length === 0 ? (
              <div className="empty-directory-state glass-card">
                <Icon name="award" size={48} className="empty-state-icon" />
                <h4>No Members Found</h4>
                <p>Try refining your search query above.</p>
              </div>
            ) : (
              filteredList.map(item => {
                const fullName = `${item.firstName || ''} ${item.lastName || ''}`;
                const initials = getInitials(item.firstName, item.lastName);
                const avatarColor = getAvatarColor(fullName);
                
                const isRegisteredVisitor = item.type === 'registered_visitor';
                const isConvertedMember = item.type === 'converted_member';
                const isRegisteredMember = item.type === 'registered_member';
                
                return (
                  <div 
                    key={isRegisteredMember ? `member-${item.memberId}` : `visitor-${item.id}`} 
                    className="visitor-directory-card glass-card"
                    onClick={() => {
                      if (isRegisteredMember) {
                        handleViewClick(item.memberId);
                      } else {
                        navigate(`/visitor-profile/${item.id}`);
                      }
                    }}
                  >
                    <div className="directory-card-top">
                      <div className="visitor-avatar-large" style={{ background: avatarColor }}>
                        {initials}
                      </div>
                      <span className={`status-badge status-${(isRegisteredVisitor ? (item.status || 'registered').toLowerCase().replace(' ', '-') : 'converted')}`}>
                        {isRegisteredVisitor ? item.status : 'Member'}
                      </span>
                    </div>
                    
                    <div className="directory-card-info">
                      <h4 className="visitor-fullName">{fullName}</h4>
                      
                      <div className="directory-meta-list">
                        <div className="directory-meta-item">
                          <Icon name="check" size={13} className="meta-icon success-color" />
                          <span>
                            Type: <strong>{isRegisteredVisitor ? 'Visitor' : (isConvertedMember ? 'Converted Member' : 'Registered Member')}</strong>
                          </span>
                        </div>
                        <div className="directory-meta-item">
                          <Icon name="calendar" size={13} className="meta-icon" />
                          <span>
                            {isRegisteredVisitor ? 'First Visit: ' : 'Join Date: '} 
                            {item.visitDate || 'N/A'}
                          </span>
                        </div>
                        <div className="directory-meta-item">
                          <Icon name="phone" size={13} className="meta-icon" />
                          <span>{item.phoneNumber || 'N/A'}</span>
                        </div>
                        {item.email && (
                          <div className="directory-meta-item">
                            <Icon name="email" size={13} className="meta-icon" />
                            <span className="meta-email">{item.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="directory-card-footer card-actions-footer">
                      {isRegisteredVisitor ? (
                        <div className="inline-action-buttons">
                          <button 
                            className="btn-inline btn-convert-inline" 
                            onClick={(e) => handleConvertToMember(item.id, item.firstName, item.lastName, e)}
                            title="Convert to Member"
                          >
                            <Icon name="award" size={12} />
                            Convert
                          </button>
                          <button 
                            className="btn-inline btn-archive-inline" 
                            onClick={(e) => handleUpdateVisitorStatus(item.id, 'Archived', e)}
                            title="Archive Profile"
                          >
                            <Icon name="alertCircle" size={12} />
                            Archive
                          </button>
                        </div>
                      ) : (
                        <div></div>
                      )}
                      
                      <span className="view-profile-link">
                        {isRegisteredMember ? 'View Details' : 'Profile'}
                        <Icon name="arrowRight" size={14} className="arrow-icon" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && reports && (
        <div className="visitor-reports-dashboard fade-in">
          {/* Metrics Row */}
          <div className="reports-metrics-grid">
            <div className="metric-card glass-card">
              <div className="metric-header-layout">
                <span className="metric-title">Total Visitors</span>
                <div className="metric-icon-badge blue">
                  <Icon name="people" size={20} />
                </div>
              </div>
              <span className="metric-value">{reports.totalVisitors}</span>
              <span className="metric-desc">Recorded visitor profiles</span>
            </div>
            
            <div className="metric-card glass-card">
              <div className="metric-header-layout">
                <span className="metric-title">Conversion Rate</span>
                <div className="metric-icon-badge green">
                  <Icon name="trendingUp" size={20} />
                </div>
              </div>
              <span className="metric-value">{reports.conversionRate}%</span>
              <span className="metric-desc">Assimilated to active members</span>
            </div>
            
            <div className="metric-card glass-card">
              <div className="metric-header-layout">
                <span className="metric-title">Pending Follow-ups</span>
                <div className="metric-icon-badge amber">
                  <Icon name="status" size={20} />
                </div>
              </div>
              <span className="metric-value">{reports.pendingFollowUps}</span>
              <span className="metric-desc">Awaiting staff interactions</span>
            </div>
            
            <div className="metric-card glass-card">
              <div className="metric-header-layout">
                <span className="metric-title">Converted Members</span>
                <div className="metric-icon-badge fuchsia">
                  <Icon name="award" size={20} />
                </div>
              </div>
              <span className="metric-value">{reports.convertedCount}</span>
              <span className="metric-desc">Successfully joined church</span>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="reports-detailed-grid">
            <div className="reports-chart-card glass-card">
              <h3>Assimilation Progress</h3>
              <p className="chart-sub">Status distribution of all visitor profiles</p>
              
              <div className="progress-bars-container">
                <div className="progress-bar-group">
                  <div className="progress-labels">
                    <span>Registered</span>
                    <span>{reports.registeredCount} ({reports.totalVisitors > 0 ? Math.round((reports.registeredCount / reports.totalVisitors) * 100) : 0}%)</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner status-registered" style={{ width: `${reports.totalVisitors > 0 ? (reports.registeredCount / reports.totalVisitors) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="progress-bar-group">
                  <div className="progress-labels">
                    <span>In Progress (Active Follow-up)</span>
                    <span>{reports.inProgressCount} ({reports.totalVisitors > 0 ? Math.round((reports.inProgressCount / reports.totalVisitors) * 100) : 0}%)</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner status-in-progress" style={{ width: `${reports.totalVisitors > 0 ? (reports.inProgressCount / reports.totalVisitors) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="progress-bar-group">
                  <div className="progress-labels">
                    <span>Convert to Member</span>
                    <span>{reports.convertedCount} ({reports.totalVisitors > 0 ? Math.round((reports.convertedCount / reports.totalVisitors) * 100) : 0}%)</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner status-convert" style={{ width: `${reports.totalVisitors > 0 ? (reports.convertedCount / reports.totalVisitors) * 100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="progress-bar-group">
                  <div className="progress-labels">
                    <span>Archived</span>
                    <span>{reports.archivedCount} ({reports.totalVisitors > 0 ? Math.round((reports.archivedCount / reports.totalVisitors) * 100) : 0}%)</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner status-archived" style={{ width: `${reports.totalVisitors > 0 ? (reports.archivedCount / reports.totalVisitors) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="reports-chart-card glass-card">
              <h3>Follow-up Completion Rate</h3>
              <p className="chart-sub">Effectiveness and speed of member follow-up actions</p>
              
              <div className="efficiency-stats">
                <div className="efficiency-metric">
                  <div className="eff-left">
                    <Icon name="check" size={18} className="eff-icon success-icon" />
                    <span className="efficiency-label">Completed Interactions</span>
                  </div>
                  <span className="efficiency-value completed-color">{reports.completedFollowUps}</span>
                </div>
                <div className="efficiency-metric">
                  <div className="eff-left">
                    <Icon name="status" size={18} className="eff-icon pending-icon" />
                    <span className="efficiency-label">Pending Interactions</span>
                  </div>
                  <span className="efficiency-value pending-color">{reports.pendingFollowUps}</span>
                </div>
                
                <div className="efficiency-desc">
                  <strong>💡 Assimilation Tip:</strong> Maintaining a prompt follow-up cycle (within 48 hours of initial visit) significantly raises visitor retention rates and accelerates conversions to active membership.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'register' && (
        <div className="visitor-directory-view fade-in">
          <div className="visitor-register-form-view fade-in">
            <form onSubmit={handleRegisterVisitor} className="visitor-form glass-card">
              <div className="form-header-title">
                <h2>Register New Visitor</h2>
                <p>Fill out the profile fields below to create a new visitor profile record.</p>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>First Name*</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={visitorForm.firstName} 
                    onChange={handleVisitorChange} 
                    required 
                    placeholder="Enter first name" 
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={visitorForm.lastName} 
                    onChange={handleVisitorChange} 
                    placeholder="Enter last name" 
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={visitorForm.email} 
                    onChange={handleVisitorChange} 
                    placeholder="example@email.com" 
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number*</label>
                  <input 
                    type="text" 
                    name="phoneNumber" 
                    value={visitorForm.phoneNumber} 
                    onChange={handleVisitorChange} 
                    required 
                    placeholder="Enter phone number" 
                  />
                </div>
                <div className="form-group">
                  <label>First Visit Date</label>
                  <input 
                    type="date" 
                    name="visitDate" 
                    value={visitorForm.visitDate} 
                    onChange={handleVisitorChange} 
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={visitorForm.gender} onChange={handleVisitorChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Home Address</label>
                  <input 
                    type="text" 
                    name="address" 
                    value={visitorForm.address} 
                    onChange={handleVisitorChange} 
                    placeholder="Street address, City, Zip code" 
                  />
                </div>
                <div className="form-group full-width">
                  <label>First Visit Notes</label>
                  <textarea 
                    name="firstVisitNotes" 
                    rows="4" 
                    value={visitorForm.firstVisitNotes} 
                    onChange={handleVisitorChange} 
                    placeholder="Provide details about their first visit, how they found out about the church, family details, etc."
                  ></textarea>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  <Icon name="check" size={16} className="btn-icon" />
                  Register Visitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisitorList;
