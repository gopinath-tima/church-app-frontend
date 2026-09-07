import React, { useState, useEffect } from 'react';
import './MemberDetailView.css';

const MemberDetailView = ({ viewMember, onClose, onEdit, onDelete }) => {
    const [activeTab, setActiveTab] = useState('overview');

    // Handle Escape key to close modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (!viewMember) return null;

    const calculateAge = (dobString) => {
        if (!dobString) return '';
        const today = new Date();
        const birthDate = new Date(dobString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('member-detail-backdrop')) {
            onClose();
        }
    };

    const DataCard = ({ icon, title, children }) => (
        <div className="detail-card">
            <div className="card-header">
                {icon}
                <h4>{title}</h4>
            </div>
            <div className="card-body">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ label, value, icon }) => (
        <div className="info-row">
            <div className="info-label-group">
                {icon && <span className="row-icon">{icon}</span>}
                <span className="row-label">{label}</span>
            </div>
            <span className={`row-value ${!value ? 'none' : ''}`}>{value || '—'}</span>
        </div>
    );

    return (
        <div className="member-detail-backdrop" onClick={handleBackdropClick}>
            <div className="member-detail-container">
                {/* Close Button on Top Right of modal */}
                <button className="modal-close-icon" onClick={onClose} title="Close Profile">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* Left Profile Sidebar */}
                <aside className="member-detail-sidebar">
                    <div className="sidebar-header-glow"></div>
                    <div className="member-detail-photo-wrapper">
                        {viewMember.photoUrl ? (
                            <img src={`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net${viewMember.photoUrl}`} alt="Profile" className="member-detail-photo" />
                        ) : (
                            <div className="no-photo-placeholder">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                                <span>No Photo Available</span>
                            </div>
                        )}
                    </div>

                    <div className="member-identity">
                        <h2>{viewMember.firstName} {viewMember.lastName}</h2>
                        <div className="badge-container">
                            <span className="member-badge badge-role">
                                {viewMember.ministryRole || 'Member'}
                            </span>
                            <span className={`member-badge badge-status ${viewMember.membershipStatus?.toLowerCase() || 'active'}`}>
                                {viewMember.membershipStatus || 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="sidebar-quick-info">
                        <div className="quick-info-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>ID: {viewMember.customMemberId || viewMember.memberId}</span>
                        </div>
                        {viewMember.bloodGroup && (
                            <div className="quick-info-item blood-group">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-11-7-11S5 10.7 5 15a7 7 0 0 0 7 7z"></path>
                                </svg>
                                <span>Blood Group: {viewMember.bloodGroup}</span>
                            </div>
                        )}
                    </div>

                    <div className="sidebar-actions">
                        {onEdit && (
                            <button className="sidebar-btn edit" onClick={() => onEdit(viewMember)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4L18.5 2.5z"></path>
                                </svg>
                                Edit Profile
                            </button>
                        )}
                        {onDelete && (
                            <button className="sidebar-btn delete" onClick={() => onDelete(viewMember.memberId)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                                Delete Member
                            </button>
                        )}
                    </div>
                </aside>

                {/* Right Tabbed Details */}
                <main className="member-detail-main">
                    <nav className="detail-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                            onClick={() => setActiveTab('overview')}
                        >
                            Overview
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('personal')}
                        >
                            Personal & Family
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'spiritual' ? 'active' : ''}`}
                            onClick={() => setActiveTab('spiritual')}
                        >
                            Church & Ministry
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('notes')}
                        >
                            Pastoral Notes
                        </button>
                    </nav>

                    <div className="tab-content-container">
                        {/* OVERVIEW TAB */}
                        {activeTab === 'overview' && (
                            <div className="tab-pane fade-in">
                                <div className="overview-grid">
                                    <div className="overview-welcome">
                                        <h3>Welcome back to profile details</h3>
                                        <p>Comprehensive overview of member contact, key dates, and primary role assignment.</p>
                                    </div>

                                    <DataCard 
                                        title="Primary Contact Information" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-2.19a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>}
                                    >
                                        <InfoRow label="Mobile Phone" value={viewMember.contactNumber} icon={<span className="bullet-dot bg-indigo"></span>} />
                                        <InfoRow label="WhatsApp" value={viewMember.whatsappNumber} icon={<span className="bullet-dot bg-green"></span>} />
                                        <InfoRow label="Email Address" value={viewMember.email} icon={<span className="bullet-dot bg-blue"></span>} />
                                        <InfoRow label="Residential Address" value={viewMember.address} icon={<span className="bullet-dot bg-orange"></span>} />
                                    </DataCard>

                                    <DataCard 
                                        title="Key Milestones" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>}
                                    >
                                        <InfoRow label="Date Joined" value={viewMember.dateJoined} />
                                        <InfoRow label="Date of Birth" value={viewMember.dateOfBirth ? `${viewMember.dateOfBirth} (${calculateAge(viewMember.dateOfBirth)} yrs)` : null} />
                                        <InfoRow label="Gender" value={viewMember.gender} />
                                        <InfoRow label="Volunteer Status" value={viewMember.volunteerStatus} />
                                    </DataCard>
                                </div>
                            </div>
                        )}

                        {/* PERSONAL & FAMILY TAB */}
                        {activeTab === 'personal' && (
                            <div className="tab-pane fade-in">
                                <div className="overview-grid">
                                    <DataCard 
                                        title="Personal Background" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>}
                                    >
                                        <InfoRow label="Gender" value={viewMember.gender} />
                                        <InfoRow label="Date of Birth" value={viewMember.dateOfBirth ? `${viewMember.dateOfBirth} (${calculateAge(viewMember.dateOfBirth)} yrs)` : null} />
                                        <InfoRow label="Educational Qualification" value={viewMember.education} />
                                        <InfoRow label="Occupation / Job" value={viewMember.occupation} />
                                        <InfoRow label="Languages Known" value={viewMember.languagesKnown} />
                                        <InfoRow label="Blood Group" value={viewMember.bloodGroup} />
                                    </DataCard>

                                    <DataCard 
                                        title="Family Relations" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
                                    >
                                        <InfoRow label="Marital Status" value={viewMember.maritalStatus} />
                                        {viewMember.maritalStatus === 'Married' && (
                                            <>
                                                <InfoRow label="Anniversary" value={viewMember.anniversaryDate} />
                                                <InfoRow label="Spouse Name" value={viewMember.spouseName} />
                                            </>
                                        )}
                                        <InfoRow label="Number of Children" value={viewMember.numberOfChildren} />
                                        <InfoRow label="Family Group Name" value={viewMember.familyName ? `${viewMember.familyName} (ID: ${viewMember.familyId})` : null} />
                                        <InfoRow label="Emergency Contact" value={viewMember.emergencyContactName ? `${viewMember.emergencyContactName} (${viewMember.emergencyContactNumber || '—'})` : null} />
                                    </DataCard>
                                </div>
                            </div>
                        )}

                        {/* CHURCH & SPIRITUAL TAB */}
                        {activeTab === 'spiritual' && (
                            <div className="tab-pane fade-in">
                                <div className="overview-grid">
                                    <DataCard 
                                        title="Spiritual Sacraments" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>}
                                    >
                                        <InfoRow label="Baptism Status" value={viewMember.baptismStatus === 'Yes' ? `✅ Baptized (${viewMember.baptismDate || 'Date N/A'})` : '❌ Not Baptized'} />
                                        <InfoRow label="Confirmation Status" value={viewMember.confirmationStatus === 'Yes' ? '✅ Confirmed' : '❌ Not Confirmed'} />
                                        <InfoRow label="Holy Communion" value={viewMember.communionStatus === 'Yes' ? '✅ Receiving Holy Communion' : '❌ Not Active'} />
                                        <InfoRow label="Previous Church Affiliation" value={viewMember.previousChurch} />
                                    </DataCard>

                                    <DataCard 
                                        title="Involvement & Stewardship" 
                                        icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>}
                                    >
                                        <InfoRow label="Assigned Ministries" value={viewMember.ministries && viewMember.ministries.length > 0 ? viewMember.ministries.join(', ') : 'None'} />
                                        <InfoRow label="Volunteer Status" value={viewMember.volunteerStatus} />
                                        <InfoRow label="Special Talents / Skills" value={viewMember.skills} />
                                        <InfoRow label="Tithe Giver" value={viewMember.titheMember === 'Yes' ? `✅ Active (${viewMember.preferredGivingMethod || 'Cash'})` : '❌ Inactive'} />
                                    </DataCard>
                                </div>
                            </div>
                        )}

                        {/* NOTES TAB */}
                        {activeTab === 'notes' && (
                            <div className="tab-pane fade-in">
                                <div className="pastoral-notes-pane">
                                    <div className="notes-icon-banner">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="1.5">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                        </svg>
                                    </div>
                                    <h3>Pastoral & Administrative Remarks</h3>
                                    <p className="notes-subtitle">Strictly confidential, visible only to leaders and administrators.</p>
                                    
                                    <div className="notes-content-box">
                                        {viewMember.specialRemarks ? (
                                            <p>{viewMember.specialRemarks}</p>
                                        ) : (
                                            <p className="no-remarks">No specific pastoral observations or administrative remarks recorded for this member.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemberDetailView;

