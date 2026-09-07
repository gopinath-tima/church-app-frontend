import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './VisitorProfile.css';

// SVG Icons Component
const Icon = ({ name, size = 18, className = "" }) => {
  const icons = {
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
    gender: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" />
      </svg>
    ),
    address: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    notes: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    arrowLeft: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    home: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    alertCircle: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    award: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    )
  };

  return (
    <span className={`svg-icon ${className}`} style={{ display: 'inline-flex', width: size, height: size }}>
      {icons[name] || null}
    </span>
  );
};

const VisitorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visitor, setVisitor] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(null);
  const [followUpForm, setFollowUpForm] = useState({
    followUpDate: new Date().toISOString().substring(0, 10),
    followUpType: 'Phone Call',
    status: 'Pending',
    notes: '',
    assignee: ''
  });

  useEffect(() => {
    fetchVisitorDetails();
    fetchFollowUps();
  }, [id]);

  const fetchVisitorDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisitor(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching visitor details", err);
      setError("Failed to load visitor profile details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowUps = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/${id}/follow-ups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFollowUps(response.data);
    } catch (err) {
      console.error("Error fetching follow-ups", err);
    }
  };

  const handleUpdateVisitorStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const updated = { ...visitor, status: newStatus };
      await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/${id}`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVisitor(updated);
    } catch (err) {
      console.error("Error updating status", err);
      alert("Failed to update status.");
    }
  };

  const handleConvertToMember = async () => {
    if (!window.confirm("Are you sure you want to convert this visitor to an active member?")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/${id}/convert`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data) {
        setConversionSuccess(`Successfully converted to Member: ${response.data.customMemberId}`);
        setVisitor(prev => prev ? { ...prev, status: 'Convert' } : prev);
        setTimeout(() => setConversionSuccess(null), 8000);
      }
    } catch (err) {
      console.error("Conversion failed", err);
      alert("Conversion failed. Please verify user details (email and mobile must be unique).");
    }
  };

  const handleFollowUpChange = (e) => {
    const { name, value } = e.target;
    setFollowUpForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/${id}/follow-ups`, followUpForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsAddingFollowUp(false);
      setFollowUpForm({
        followUpDate: new Date().toISOString().substring(0, 10),
        followUpType: 'Phone Call',
        status: 'Pending',
        notes: '',
        assignee: ''
      });
      fetchFollowUps();
      // If visitor status was Registered, adding follow-up shifts it to "In Progress"
      if (visitor && visitor.status === 'Registered') {
        setVisitor(prev => prev ? { ...prev, status: 'In Progress' } : prev);
      }
    } catch (err) {
      console.error("Error adding follow-up", err);
      alert("Failed to save follow-up.");
    }
  };

  const handleCompleteFollowUp = async (followUp) => {
    try {
      const token = localStorage.getItem("token");
      const updated = { ...followUp, status: 'Completed' };
      await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors/follow-ups/${followUp.id}`, updated, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFollowUps();
    } catch (err) {
      console.error("Error completing follow-up", err);
    }
  };

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
      'linear-gradient(135deg, #f97316, #ea580c)'
    ];
    let hash = 0;
    const str = name || '';
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const getTimelineIcon = (type) => {
    switch (type) {
      case 'Phone Call': return 'phone';
      case 'Email': return 'email';
      case 'Home Visit': return 'home';
      case 'In-Person Chat': return 'chat';
      default: return 'chat';
    }
  };

  const isConvertedStatus = (status) => {
    return status === 'Convert' || status === 'Converted';
  };

  if (loading) {
    return (
      <div className="visitor-profile-loading">
        <div className="spinner"></div>
        <p>Loading visitor profile...</p>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="visitor-profile-error glass-card">
        <Icon name="alertCircle" size={48} className="error-icon" />
        <h2>Profile Not Found</h2>
        <p>{error || "We couldn't retrieve the details for this visitor profile."}</p>
        <button className="btn btn-primary" onClick={() => navigate('/visitors-list')}>
          Back to Directory
        </button>
      </div>
    );
  }

  const fullName = `${visitor.firstName || ''} ${visitor.lastName || ''}`;
  const initials = getInitials(visitor.firstName, visitor.lastName);
  const avatarColor = getAvatarColor(fullName);

  return (
    <div className="visitor-profile-container fade-in">
      {/* Back Navigation Bar */}
      <div className="details-navigation-bar">
        <button className="btn btn-secondary back-btn" onClick={() => navigate('/visitors-list')}>
          <Icon name="arrowLeft" size={16} className="btn-icon" />
          Back to Directory
        </button>
      </div>

      {conversionSuccess && (
        <div className="alert alert-success slide-up">
          <Icon name="check" size={20} className="alert-icon" />
          <span>{conversionSuccess}</span>
        </div>
      )}

      {/* Main Details Glass Card */}
      <div className="visitor-details glass-card">
        {/* Profile Header */}
        <div className="details-header">
          <div className="profile-identity-section">
            <div className="profile-large-avatar" style={{ background: avatarColor }}>
              {initials}
            </div>
            <div className="profile-text">
              <h2>{fullName}</h2>
              <div className="profile-sub-details">
                <span className={`status-badge status-${(visitor.status || 'registered').toLowerCase().replace(' ', '-')}`}>
                  {visitor.status}
                </span>
                <span className="first-visit-tag">
                  <Icon name="calendar" size={12} className="tag-icon" />
                  First Visit: {visitor.visitDate}
                </span>
              </div>
            </div>
          </div>
          
          <div className="details-actions">
            {!isConvertedStatus(visitor.status) && (
              <button className="btn btn-success convert-btn" onClick={handleConvertToMember}>
                <Icon name="award" size={16} className="btn-icon" />
                Convert to Member
              </button>
            )}
            {visitor.status !== 'Archived' && !isConvertedStatus(visitor.status) && (
              <button className="btn btn-secondary archive-btn" onClick={() => handleUpdateVisitorStatus('Archived')}>
                <Icon name="alertCircle" size={16} className="btn-icon" />
                Archive
              </button>
            )}
          </div>
        </div>

        {/* Profile Cards Grid */}
        <div className="profile-cards-grid">
          {/* Contact Info Card */}
          <div className="profile-card-item">
            <div className="card-item-header">
              <span className="card-item-title">Contact Information</span>
            </div>
            <div className="card-item-body">
              <div className="info-detail-row">
                <div className="info-icon-wrapper">
                  <Icon name="email" size={16} />
                </div>
                <div className="info-text-wrapper">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{visitor.email || 'Not Provided'}</span>
                </div>
              </div>
              <div className="info-detail-row">
                <div className="info-icon-wrapper">
                  <Icon name="phone" size={16} />
                </div>
                <div className="info-text-wrapper">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{visitor.phoneNumber || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visit & Personal Details Card */}
          <div className="profile-card-item">
            <div className="card-item-header">
              <span className="card-item-title">Personal & Visit Details</span>
            </div>
            <div className="card-item-body">
              <div className="info-detail-row">
                <div className="info-icon-wrapper">
                  <Icon name="gender" size={16} />
                </div>
                <div className="info-text-wrapper">
                  <span className="info-label">Gender Info</span>
                  <span className="info-value">{visitor.gender || 'N/A'}</span>
                </div>
              </div>
              <div className="info-detail-row">
                <div className="info-icon-wrapper">
                  <Icon name="address" size={16} />
                </div>
                <div className="info-text-wrapper">
                  <span className="info-label">Address</span>
                  <span className="info-value">{visitor.address || 'Not Provided'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Details Card */}
          <div className="profile-card-item full-width-card">
            <div className="card-item-header">
              <span className="card-item-title">Pastoral & First Visit Notes</span>
            </div>
            <div className="card-item-body notes-body">
              <Icon name="notes" size={20} className="notes-bg-icon" />
              <p className="visitor-notes-text">
                {visitor.firstVisitNotes || "No notes recorded for this visitor."}
              </p>
            </div>
          </div>
        </div>

        {/* Follow-up Section */}
        <div className="follow-up-section">
          <div className="section-header">
            <div className="section-title-wrapper">
              <h3>Follow-up Interactions</h3>
              <p>View and manage follow-up interactions with this visitor.</p>
            </div>
            <button className={`btn btn-sm ${isAddingFollowUp ? 'btn-secondary' : 'btn-outline'}`} onClick={() => setIsAddingFollowUp(!isAddingFollowUp)}>
              {isAddingFollowUp ? 'Cancel' : '+ Record Interaction'}
            </button>
          </div>

          {isAddingFollowUp && (
            <form onSubmit={handleAddFollowUp} className="follow-up-form slide-down">
              <h4>Record New Interaction</h4>
              <div className="form-grid">
                <div className="form-group">
                  <label>Date of Interaction</label>
                  <input type="date" name="followUpDate" value={followUpForm.followUpDate} onChange={handleFollowUpChange} />
                </div>
                <div className="form-group">
                  <label>Interaction Type</label>
                  <select name="followUpType" value={followUpForm.followUpType} onChange={handleFollowUpChange}>
                    <option value="Phone Call">Phone Call</option>
                    <option value="Email">Email</option>
                    <option value="Home Visit">Home Visit</option>
                    <option value="In-Person Chat">In-Person Chat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Assigned Staff/Leader</label>
                  <input type="text" name="assignee" value={followUpForm.assignee} onChange={handleFollowUpChange} placeholder="Staff member name" />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={followUpForm.status} onChange={handleFollowUpChange}>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Discussion Notes & Outcomming</label>
                  <textarea name="notes" rows="2" value={followUpForm.notes} onChange={handleFollowUpChange} required placeholder="What did you discuss? What are the next steps?"></textarea>
                </div>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                <Icon name="check" size={14} className="btn-icon" />
                Save Interaction
              </button>
            </form>
          )}

          <div className="timeline">
            {followUps.length === 0 ? (
              <div className="empty-timeline-state">
                <Icon name="chat" size={24} />
                <p>No follow-ups recorded yet for this visitor.</p>
              </div>
            ) : (
              followUps.map(f => (
                <div key={f.id} className={`timeline-item ${f.status.toLowerCase()}`}>
                  <div className="timeline-marker-wrapper">
                    <div className="timeline-marker">
                      <Icon name={getTimelineIcon(f.followUpType)} size={12} className="timeline-marker-icon" />
                    </div>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-type">{f.followUpType}</span>
                      <span className="timeline-date">{f.followUpDate}</span>
                    </div>
                    <p className="timeline-notes">{f.notes}</p>
                    <div className="timeline-footer">
                      <span className="timeline-assignee">Assigned to: <strong>{f.assignee || 'Unassigned'}</strong></span>
                      {f.status === 'Pending' && (
                        <button className="btn btn-sm btn-success-light complete-action-btn" onClick={() => handleCompleteFollowUp(f)}>
                          Mark Completed
                        </button>
                      )}
                      {f.status === 'Completed' && (
                        <span className="completed-label">
                          <Icon name="check" size={12} className="completed-icon" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorProfile;
