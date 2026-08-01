import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Forms.css';

const initialForms = [
  { id: 1, title: 'Visitor Connect Card', category: 'Connection', submissions: 0, status: 'Active', lastUpdated: 'Just now' },
  { id: 2, title: 'Baptism Registration', category: 'Sacraments', submissions: 0, status: 'Active', lastUpdated: 'Just now' },
  { id: 3, title: 'Volunteer Sign-up (Youth)', category: 'Ministry', submissions: 0, status: 'Active', lastUpdated: 'Just now' },
  { id: 4, title: 'Prayer Request', category: 'Care', submissions: 0, status: 'Active', lastUpdated: 'Just now' },
  { id: 5, title: 'Summer Camp 2026', category: 'Events', submissions: 0, status: 'Draft', lastUpdated: 'Just now' }
];

const Forms = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  
  // Persistent State
  const [forms, setForms] = useState(() => {
    const saved = localStorage.getItem('church_forms');
    return saved ? JSON.parse(saved) : initialForms;
  });
  const [submissions, setSubmissions] = useState(() => {
    const saved = localStorage.getItem('church_form_submissions');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Modal State
  const [selectedForm, setSelectedForm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // View Submissions State
  const [viewingForm, setViewingForm] = useState(null);
  
  // Form submission state
  const [submitterType, setSubmitterType] = useState('member'); // 'member' or 'guest'
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [guestFirstName, setGuestFirstName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchMembers();
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('church_forms', JSON.stringify(forms));
  }, [forms]);

  useEffect(() => {
    localStorage.setItem('church_form_submissions', JSON.stringify(submissions));
  }, [submissions]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("jwt");
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get('http://localhost:8081/api/members', config);
      const mData = response.data.content ? response.data.content : response.data;
      setMembers(Array.isArray(mData) ? mData : []);
    } catch (error) {
      console.error("Failed to load members:", error);
    }
  };

  const filteredForms = forms.filter(form => 
    form.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    form.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Computed Stats
  const activeFormsCount = forms.filter(f => f.status === 'Active').length;
  const newSubmissionsCount = submissions.length;

  const openFormModal = (form) => {
    setSelectedForm(form);
    setSubmitterType('member');
    setSelectedMemberId('');
    setGuestFirstName('');
    setGuestLastName('');
    setFormData({});
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setSelectedForm(null);
  };

  const openViewSubmissions = (form, e) => {
    e.stopPropagation();
    setViewingForm(form);
  };

  const closeViewSubmissions = () => {
    setViewingForm(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitterType === 'member' && !selectedMemberId) {
      alert("Please select a church member.");
      return;
    }
    if (submitterType === 'guest' && (!guestFirstName || !guestLastName)) {
      alert("Please enter the guest's first and last name.");
      return;
    }

    let submitterName = '';
    if (submitterType === 'member') {
      const member = members.find(m => m.memberId.toString() === selectedMemberId);
      submitterName = member ? `${member.firstName} ${member.lastName}` : 'Unknown Member';
    } else {
      submitterName = `${guestFirstName} ${guestLastName}`;
    }

    const newSubmission = {
      id: Date.now(),
      formId: selectedForm.id,
      submitterType,
      submitterId: selectedMemberId,
      submitterName,
      date: new Date().toISOString(),
      data: formData
    };

    setSubmissions([newSubmission, ...submissions]);
    
    // Update the form's submission count
    setForms(forms.map(f => 
      f.id === selectedForm.id 
      ? { ...f, submissions: f.submissions + 1, lastUpdated: 'Just now' } 
      : f
    ));

    alert(`Successfully submitted ${selectedForm.title}!`);
    closeFormModal();
  };

  const renderSpecificFields = () => {
    if (!selectedForm) return null;

    switch (selectedForm.id) {
      case 1: // Connect Card
        return (
          <>
            <div className="custom-form-group">
              <label>Phone Number</label>
              <input type="tel" name="phone" onChange={handleFormChange} required />
            </div>
            <div className="custom-form-group">
              <label>Email Address</label>
              <input type="email" name="email" onChange={handleFormChange} required />
            </div>
            <div className="custom-form-group full-width">
              <label>Home Address</label>
              <input type="text" name="address" onChange={handleFormChange} />
            </div>
            <div className="custom-form-group full-width">
              <label>How did you hear about us?</label>
              <select name="source" onChange={handleFormChange}>
                <option value="">Select an option</option>
                <option value="friend">Friend / Family</option>
                <option value="social">Social Media</option>
                <option value="website">Church Website</option>
                <option value="driveby">Drove by</option>
              </select>
            </div>
          </>
        );
      case 2: // Baptism
        return (
          <>
            <div className="custom-form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" onChange={handleFormChange} required />
            </div>
            <div className="custom-form-group">
              <label>Preferred Baptism Date</label>
              <input type="date" name="preferredDate" onChange={handleFormChange} required />
            </div>
            <div className="custom-form-group full-width">
              <label>Have you attended the baptism class?</label>
              <select name="attendedClass" onChange={handleFormChange} required>
                <option value="">Select...</option>
                <option value="yes">Yes</option>
                <option value="no">No, I need to register for it.</option>
              </select>
            </div>
          </>
        );
      case 3: // Volunteer
        return (
          <>
            <div className="custom-form-group full-width">
              <label>Area of Interest</label>
              <select name="interest" onChange={handleFormChange} required>
                <option value="">Select an area...</option>
                <option value="youth">Youth Ministry</option>
                <option value="worship">Worship Team</option>
                <option value="tech">Tech / AV</option>
                <option value="hospitality">Hospitality / Greeters</option>
                <option value="children">Children's Ministry</option>
              </select>
            </div>
            <div className="custom-form-group full-width">
              <label>Availability</label>
              <input type="text" name="availability" placeholder="e.g. Sunday mornings, Wednesday evenings" onChange={handleFormChange} required />
            </div>
          </>
        );
      case 4: // Prayer Request
        return (
          <>
            <div className="custom-form-group full-width">
              <label>Prayer Request Details</label>
              <textarea name="prayerDetails" rows="4" onChange={handleFormChange} required placeholder="How can we pray for you?"></textarea>
            </div>
            <div className="custom-form-group checkbox-group full-width">
              <label className="checkbox-label">
                <input type="checkbox" name="confidential" onChange={handleFormChange} />
                Keep this request confidential (Pastors only)
              </label>
            </div>
          </>
        );
      case 5: // Summer Camp
        return (
          <>
             <div className="custom-form-group">
              <label>Camper Name</label>
              <input type="text" name="camperName" onChange={handleFormChange} required />
            </div>
             <div className="custom-form-group">
              <label>Camper Age</label>
              <input type="number" name="camperAge" onChange={handleFormChange} required />
            </div>
            <div className="custom-form-group full-width">
              <label>Medical Conditions / Allergies</label>
              <textarea name="medical" rows="2" onChange={handleFormChange} placeholder="List any allergies or medical conditions..."></textarea>
            </div>
          </>
        );
      default:
        return <p>Form details are currently unavailable.</p>;
    }
  };

  return (
    <div className="forms-dashboard fade-in">
      <div className="forms-header">
        <div className="forms-title-section">
          <h1>Forms & Registrations</h1>
          <p>Create and manage custom forms for your congregation.</p>
        </div>
        <button className="btn-primary create-form-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create New Form
        </button>
      </div>

      <div className="forms-stats-row">
        <div className="stat-card">
          <div className="stat-icon pulse-soft">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div className="stat-details">
            <h3>Total Active Forms</h3>
            <p className="stat-number">{activeFormsCount}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div className="stat-details">
            <h3>Total Submissions</h3>
            <p className="stat-number">{newSubmissionsCount}</p>
            <span className="stat-subtext text-green">All time</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          </div>
          <div className="stat-details">
            <h3>Avg. Completion Time</h3>
            <p className="stat-number">--</p>
          </div>
        </div>
      </div>

      <div className="forms-content-panel glass-panel">
        <div className="panel-toolbar">
          <h2>Your Forms</h2>
          <div className="search-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search forms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="forms-grid">
          {filteredForms.map(form => (
            <div key={form.id} className="form-item-card slide-up" onClick={() => openFormModal(form)}>
              <div className="form-card-header">
                <span className={`status-badge ${form.status.toLowerCase()}`}>{form.status}</span>
                <span className="category-tag">{form.category}</span>
              </div>
              <h3 className="form-card-title">{form.title}</h3>
              <div className="form-card-metrics">
                <div className="metric">
                  <span className="metric-value">{form.submissions}</span>
                  <span className="metric-label">Submissions</span>
                </div>
              </div>
              <div className="form-card-footer" onClick={(e) => e.stopPropagation()}>
                <span className="last-updated">Updated {form.lastUpdated}</span>
                <div className="form-actions">
                  <button className="icon-btn" title="View Submissions" onClick={(e) => openViewSubmissions(form, e)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  </button>
                  <button className="icon-btn submit-now" title="Fill Form" onClick={() => openFormModal(form)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredForms.length === 0 && (
            <div className="no-results">
              <p>No forms found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
      </div>

      {/* View Submissions Modal */}
      {viewingForm && (
        <div className="form-modal-overlay" onClick={closeViewSubmissions}>
          <div className="form-modal-content view-submissions-modal" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>Submissions: {viewingForm.title}</h2>
              <button className="close-modal-btn" onClick={closeViewSubmissions}>&times;</button>
            </div>
            
            <div className="submissions-list">
              {submissions.filter(s => s.formId === viewingForm.id).length === 0 ? (
                <div className="no-results">
                  <p>No submissions yet for this form.</p>
                </div>
              ) : (
                submissions.filter(s => s.formId === viewingForm.id).map(sub => (
                  <div key={sub.id} className="submission-card">
                    <div className="submission-header">
                      <div className="submission-user">
                        <div className="submission-avatar">
                          {sub.submitterName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4>{sub.submitterName}</h4>
                          <span className="submission-badge">{sub.submitterType === 'member' ? 'Member' : 'Guest'}</span>
                        </div>
                      </div>
                      <span className="submission-date">{new Date(sub.date).toLocaleString()}</span>
                    </div>
                    <div className="submission-body">
                      {Object.keys(sub.data).length > 0 ? (
                        <ul className="submission-data-list">
                          {Object.entries(sub.data).map(([key, value]) => (
                            <li key={key}>
                              <strong>{key}: </strong> 
                              <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value.toString()}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-data">No data provided</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="form-modal-footer">
              <button type="button" className="btn-cancel" onClick={closeViewSubmissions}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Submission Modal */}
      {isModalOpen && selectedForm && (
        <div className="form-modal-overlay" onClick={closeFormModal}>
          <div className="form-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="form-modal-header">
              <h2>{selectedForm.title}</h2>
              <button className="close-modal-btn" onClick={closeFormModal}>&times;</button>
            </div>
            
            <form className="dynamic-form" onSubmit={handleSubmit}>
              {/* Submitter Section */}
              <div className="form-section">
                <h3>Submitter Information</h3>
                
                <div className="submitter-type-toggle">
                  <label className={`toggle-option ${submitterType === 'member' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="submitterType" 
                      value="member"
                      checked={submitterType === 'member'}
                      onChange={() => setSubmitterType('member')}
                    />
                    Existing Member
                  </label>
                  <label className={`toggle-option ${submitterType === 'guest' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="submitterType" 
                      value="guest"
                      checked={submitterType === 'guest'}
                      onChange={() => setSubmitterType('guest')}
                    />
                    Guest / Custom Name
                  </label>
                </div>

                <div className="submitter-inputs">
                  {submitterType === 'member' ? (
                    <div className="custom-form-group full-width">
                      <label>Select Church Member *</label>
                      <select 
                        value={selectedMemberId} 
                        onChange={(e) => setSelectedMemberId(e.target.value)} 
                        required
                      >
                        <option value="">-- Choose Member --</option>
                        {members.map(member => (
                          <option key={member.memberId} value={member.memberId}>
                            {member.firstName} {member.lastName} {member.contactNumber ? `(${member.contactNumber})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="name-inputs-row">
                      <div className="custom-form-group">
                        <label>First Name *</label>
                        <input 
                          type="text" 
                          value={guestFirstName}
                          onChange={(e) => setGuestFirstName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="custom-form-group">
                        <label>Last Name *</label>
                        <input 
                          type="text" 
                          value={guestLastName}
                          onChange={(e) => setGuestLastName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dynamic Specific Form Fields */}
              <div className="form-section specific-fields-section">
                <h3>Form Details</h3>
                <div className="dynamic-grid">
                  {renderSpecificFields()}
                </div>
              </div>

              <div className="form-modal-footer">
                <button type="button" className="btn-cancel" onClick={closeFormModal}>Cancel</button>
                <button type="submit" className="btn-submit">Submit Form</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Forms;
