import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Families.css';

const Families = () => {
    const [households, setHouseholds] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- CREATE MODAL STATE ---
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1); // 1 = Select Head, 2 = Details & Members
    const [createSearchTerm, setCreateSearchTerm] = useState('');
    const [createSearchResults, setCreateSearchResults] = useState([]);
    const [createIsSearching, setCreateIsSearching] = useState(false);
    
    const [newFamilyData, setNewFamilyData] = useState({
        headMember: null,
        familyName: '',
        address: '',
        additionalMembers: []
    });

    // --- EDIT MODAL STATE ---
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState(null);
    const [editFormData, setEditFormData] = useState({ familyName: '', address: '', headMemberId: null });
    const [editSearchTerm, setEditSearchTerm] = useState('');
    const [editSearchResults, setEditSearchResults] = useState([]);
    const [editIsSearching, setEditIsSearching] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || 
                     localStorage.getItem("jwt") || 
                     localStorage.getItem("jwtToken") || 
                     localStorage.getItem("authToken") || 
                     localStorage.getItem("accessToken");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    };

    const fetchFamilies = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get('http://localhost:8081/api/families', { headers: headers || {} });
            setHouseholds(res.data || []);
        } catch (err) {
            console.error("Error fetching families:", err);
            setHouseholds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFamilies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---------------------------------------------------------
    // Create Household Flow
    // ---------------------------------------------------------
    const openCreateModal = () => {
        setCreateStep(1);
        setCreateSearchTerm('');
        setCreateSearchResults([]);
        setNewFamilyData({
            headMember: null,
            familyName: '',
            address: '',
            additionalMembers: []
        });
        setShowCreateModal(true);
    };

    const selectHeadMember = (member) => {
        setNewFamilyData({
            ...newFamilyData,
            headMember: member,
            familyName: `The ${member.lastName || ''} Family`.trim(),
            address: member.address || '',
            additionalMembers: []
        });
        setCreateSearchTerm('');
        setCreateSearchResults([]);
        setCreateStep(2);
    };

    const handleCreateFamilySubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = getAuthHeaders();
            
            // 1. Create the Family
            const payload = {
                familyName: newFamilyData.familyName,
                address: newFamilyData.address,
                headMemberId: newFamilyData.headMember ? newFamilyData.headMember.memberId : null
            };
            const createRes = await axios.post('http://localhost:8081/api/families', payload, { headers: headers || {} });
            const newFamilyId = createRes.data.familyId;

            // 2. Add all additional members
            for (const member of newFamilyData.additionalMembers) {
                await axios.post(`http://localhost:8081/api/families/${newFamilyId}/members/${member.memberId}`, {}, { headers: headers || {} });
            }

            setShowCreateModal(false);
            fetchFamilies();
        } catch (err) {
            console.error("Error creating family:", err);
            const errMsg = err.response && err.response.data && err.response.data.message 
                ? err.response.data.message 
                : err.message;
            
            if (errMsg.includes("violates unique constraint") && errMsg.includes("head_member_id")) {
                alert("This member is already the head of a household. This can happen if a previous attempt partially succeeded. Please refresh the page, find their existing household, and delete it before trying again. (Make sure you have restarted your backend!)");
            } else {
                alert("Failed to create family. " + errMsg);
            }
        }
    };

    const addAdditionalMemberToNewFamily = (member) => {
        // Prevent adding head as additional member, or adding duplicates
        if (newFamilyData.headMember && newFamilyData.headMember.memberId === member.memberId) return;
        if (newFamilyData.additionalMembers.some(m => m.memberId === member.memberId)) return;

        setNewFamilyData({
            ...newFamilyData,
            additionalMembers: [...newFamilyData.additionalMembers, member]
        });
    };

    const removeAdditionalMemberFromNewFamily = (memberId) => {
        setNewFamilyData({
            ...newFamilyData,
            additionalMembers: newFamilyData.additionalMembers.filter(m => m.memberId !== memberId)
        });
    };

    // ---------------------------------------------------------
    // Edit Household Flow
    // ---------------------------------------------------------
    const openEditModal = (family) => {
        setSelectedFamily(family);
        setEditFormData({
            familyName: family.familyName || '',
            address: family.address || '',
            headMemberId: family.headMember ? family.headMember.memberId : null
        });
        setShowEditModal(true);
    };

    const handleUpdateFamily = async (e) => {
        e.preventDefault();
        try {
            const headers = getAuthHeaders();
            await axios.put(`http://localhost:8081/api/families/${selectedFamily.familyId}`, editFormData, { headers: headers || {} });
            setShowEditModal(false);
            setSelectedFamily(null);
            fetchFamilies();
        } catch (err) {
            console.error("Error updating family:", err);
            alert("Failed to update family.");
        }
    };

    const handleDeleteFamily = async (id) => {
        if (!window.confirm("Are you sure you want to delete this household? The members will not be deleted, just unlinked.")) return;
        try {
            const headers = getAuthHeaders();
            await axios.delete(`http://localhost:8081/api/families/${id}`, { headers: headers || {} });
            fetchFamilies();
        } catch (err) {
            console.error("Error deleting family:", err);
            const errMsg = err.response && err.response.data && err.response.data.message 
                ? err.response.data.message 
                : err.message;
            alert("Failed to delete family. " + errMsg);
        }
    };

    const handleRemoveMember = async (familyId, memberId) => {
        if (!window.confirm("Remove this member from the household?")) return;
        try {
            const headers = getAuthHeaders();
            await axios.delete(`http://localhost:8081/api/families/${familyId}/members/${memberId}`, { headers: headers || {} });
            fetchFamilies();
        } catch (err) {
            console.error("Error removing member:", err);
            alert("Failed to remove member.");
        }
    };

    const handleAddMember = async (familyId, memberId) => {
        try {
            const headers = getAuthHeaders();
            await axios.post(`http://localhost:8081/api/families/${familyId}/members/${memberId}`, {}, { headers: headers || {} });
            setEditSearchTerm('');
            setEditSearchResults([]);
            fetchFamilies();
        } catch (err) {
            console.error("Error adding member:", err);
            alert("Failed to add member to household.");
        }
    };

    // ---------------------------------------------------------
    // Generic Search 
    // ---------------------------------------------------------
    const searchMembers = async (term, setterCallback, loaderCallback) => {
        if (!term || term.length < 2) {
            setterCallback([]);
            return;
        }
        loaderCallback(true);
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`http://localhost:8081/api/members/search?type=all&value=${term}`, { headers: headers || {} });
            setterCallback(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error searching members:", err);
        } finally {
            loaderCallback(false);
        }
    };

    // ---------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------
    const getInitials = (firstName, lastName) => {
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];
        let hash = 0;
        for (let i = 0; i < (name || '').length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const HouseIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
    );

    if (loading) return (
        <div className="families-loading-wrapper">
            <div className="spinner"></div>
            <p>Loading Households...</p>
        </div>
    );

    return (
        <div className="families-container">
            <div className="families-header-row">
                <div className="families-header-info">
                    <h1>Households</h1>
                    <p>{households.length} registered family units</p>
                </div>
                <button className="btn-create-family" onClick={openCreateModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    New Household
                </button>
            </div>

            {households.length === 0 ? (
                <div className="families-empty-state">
                    <HouseIcon />
                    <h2>No Households Found</h2>
                    <p>Start organizing your members into family units.</p>
                    <button onClick={openCreateModal}>Create First Household</button>
                </div>
            ) : (
                <div className="households-masonry">
                    {households.map((household) => (
                        <div key={household.familyId} className="household-premium-card">
                            <div className="hh-card-header">
                                <div className="hh-icon-wrap">
                                    <HouseIcon />
                                </div>
                                <div className="hh-title-wrap">
                                    <h3>{household.familyName}</h3>
                                    <span className="hh-address">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {household.address || 'No address provided'}
                                    </span>
                                </div>
                                <div className="hh-actions">
                                    <button className="icon-btn edit" onClick={() => openEditModal(household)} title="Manage Household">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                    <button className="icon-btn delete" onClick={() => handleDeleteFamily(household.familyId)} title="Delete Household">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="hh-card-body">
                                {household.headMember && (
                                    <div className="hh-head-section">
                                        <div className="hh-head-badge">Head of Household</div>
                                        <div className="hh-member-row">
                                            <div className="hh-avatar" style={{ backgroundColor: getAvatarColor(household.headMember.firstName) }}>
                                                {getInitials(household.headMember.firstName, household.headMember.lastName)}
                                            </div>
                                            <div className="hh-member-details">
                                                <span className="hh-member-name">{household.headMember.firstName} {household.headMember.lastName}</span>
                                                <span className="hh-member-id">{household.headMember.customMemberId || `ID: ${household.headMember.memberId}`}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="hh-members-list">
                                    <div className="hh-list-title">
                                        Other Members ({household.members.filter(m => !household.headMember || m.memberId !== household.headMember.memberId).length})
                                    </div>
                                    <div className="hh-members-grid">
                                        {household.members
                                            .filter(m => !household.headMember || m.memberId !== household.headMember.memberId)
                                            .map(member => (
                                                <div key={member.memberId} className="hh-member-chip">
                                                    <div className="hh-chip-avatar" style={{ backgroundColor: getAvatarColor(member.firstName) }}>
                                                        {getInitials(member.firstName, member.lastName)}
                                                    </div>
                                                    <span className="hh-chip-name">{member.firstName} {member.lastName}</span>
                                                    <button className="hh-chip-remove" onClick={() => handleRemoveMember(household.familyId, member.memberId)} title="Remove from family">
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* CREATE HOUSEHOLD BUILDER MODAL */}
            {showCreateModal && (
                <div className="fam-modal-overlay">
                    <div className="fam-modal fam-modal-large">
                        <div className="fam-modal-header">
                            <h2>Create New Household</h2>
                            <button className="fam-close-btn" onClick={() => setShowCreateModal(false)}>&times;</button>
                        </div>
                        
                        <div className="fam-builder-progress">
                            <div className={`builder-step ${createStep >= 1 ? 'active' : ''}`}>1. Select Head</div>
                            <div className="builder-line"></div>
                            <div className={`builder-step ${createStep >= 2 ? 'active' : ''}`}>2. Review & Add Members</div>
                        </div>

                        {createStep === 1 && (
                            <div className="fam-builder-step1">
                                <div className="fam-search-box-large">
                                    <label>Search for the Head of Household</label>
                                    <input 
                                        type="text" 
                                        placeholder="Start typing a name or ID..." 
                                        value={createSearchTerm}
                                        onChange={e => {
                                            setCreateSearchTerm(e.target.value);
                                            searchMembers(e.target.value, setCreateSearchResults, setCreateIsSearching);
                                        }}
                                        autoFocus
                                    />
                                    <p className="fam-search-help">Selecting a head of household will automatically generate the family name.</p>
                                </div>
                                <div className="fam-search-results-large">
                                    {createIsSearching && <div className="mini-spinner">Searching...</div>}
                                    {!createIsSearching && createSearchResults.length === 0 && createSearchTerm.length >= 2 && (
                                        <div className="no-results-mini">No members found.</div>
                                    )}
                                    {createSearchResults.map(member => (
                                        <div key={member.memberId} className="fam-search-item-large" onClick={() => selectHeadMember(member)}>
                                            <div className="hh-avatar" style={{ backgroundColor: getAvatarColor(member.firstName) }}>
                                                {getInitials(member.firstName, member.lastName)}
                                            </div>
                                            <div className="fam-search-info">
                                                <div className="fam-search-name">{member.firstName} {member.lastName}</div>
                                                <div className="fam-search-id">{member.customMemberId || `ID: ${member.memberId}`}</div>
                                            </div>
                                            <div className="fam-search-action">
                                                Select Head
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div className="skip-head-container">
                                        <button className="fam-btn-text" onClick={() => setCreateStep(2)}>
                                            Skip selecting a head for now &rarr;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {createStep === 2 && (
                            <form onSubmit={handleCreateFamilySubmit} className="fam-builder-step2">
                                <div className="fam-modal-body-split">
                                    {/* Left Side: Family Details */}
                                    <div className="fam-modal-col">
                                        <h3>Household Details</h3>
                                        
                                        {newFamilyData.headMember && (
                                            <div className="selected-head-banner">
                                                <span className="badge">Selected Head</span>
                                                <div className="banner-info">
                                                    <strong>{newFamilyData.headMember.firstName} {newFamilyData.headMember.lastName}</strong>
                                                </div>
                                                <button type="button" className="btn-change" onClick={() => setCreateStep(1)}>Change</button>
                                            </div>
                                        )}

                                        <div className="fam-form-group">
                                            <label>Family Name</label>
                                            <input required type="text" value={newFamilyData.familyName} onChange={e => setNewFamilyData({...newFamilyData, familyName: e.target.value})} placeholder="e.g., The Smith Family" />
                                        </div>
                                        <div className="fam-form-group">
                                            <label>Primary Address</label>
                                            <textarea value={newFamilyData.address} onChange={e => setNewFamilyData({...newFamilyData, address: e.target.value})} rows="3" placeholder="Enter complete address" />
                                        </div>
                                    </div>
                                    
                                    {/* Right Side: Additional Members */}
                                    <div className="fam-modal-col fam-col-border">
                                        <h3>Add Additional Members</h3>
                                        <div className="fam-search-box">
                                            <input 
                                                type="text" 
                                                placeholder="Search to add spouse, children, etc..." 
                                                value={createSearchTerm}
                                                onChange={e => {
                                                    setCreateSearchTerm(e.target.value);
                                                    searchMembers(e.target.value, setCreateSearchResults, setCreateIsSearching);
                                                }}
                                            />
                                        </div>
                                        <div className="fam-search-results">
                                            {createIsSearching && <div className="mini-spinner">Searching...</div>}
                                            {createSearchResults.map(member => {
                                                const isHead = newFamilyData.headMember?.memberId === member.memberId;
                                                const isAdded = newFamilyData.additionalMembers.some(m => m.memberId === member.memberId);
                                                return (
                                                    <div key={member.memberId} className="fam-search-item">
                                                        <div className="fam-search-info">
                                                            <div className="fam-search-name">{member.firstName} {member.lastName}</div>
                                                            <div className="fam-search-id">{member.customMemberId || member.memberId}</div>
                                                        </div>
                                                        <button 
                                                            type="button"
                                                            className="btn-add-mini"
                                                            onClick={() => addAdditionalMemberToNewFamily(member)}
                                                            disabled={isHead || isAdded}
                                                        >
                                                            {isHead ? 'Head' : isAdded ? 'Added' : '+ Add'}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Added Members List */}
                                        {newFamilyData.additionalMembers.length > 0 && (
                                            <div className="staged-members-list">
                                                <h4>Members to be added:</h4>
                                                <div className="hh-members-grid">
                                                    {newFamilyData.additionalMembers.map(member => (
                                                        <div key={member.memberId} className="hh-member-chip">
                                                            <div className="hh-chip-avatar" style={{ backgroundColor: getAvatarColor(member.firstName) }}>
                                                                {getInitials(member.firstName, member.lastName)}
                                                            </div>
                                                            <span className="hh-chip-name">{member.firstName}</span>
                                                            <button type="button" className="hh-chip-remove" onClick={() => removeAdditionalMemberFromNewFamily(member.memberId)}>&times;</button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="fam-modal-footer">
                                    <button type="button" className="fam-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                    <button type="submit" className="fam-btn-primary">Create Household & Link Members</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* EDIT / MANAGE MODAL */}
            {showEditModal && selectedFamily && (
                <div className="fam-modal-overlay">
                    <div className="fam-modal fam-modal-large">
                        <div className="fam-modal-header">
                            <h2>Manage Household: {selectedFamily.familyName}</h2>
                            <button className="fam-close-btn" onClick={() => {setShowEditModal(false); setSelectedFamily(null);}}>&times;</button>
                        </div>
                        <div className="fam-modal-body-split">
                            {/* Left Side: Details */}
                            <div className="fam-modal-col">
                                <h3>Household Details</h3>
                                <form id="editFamilyForm" onSubmit={handleUpdateFamily}>
                                    <div className="fam-form-group">
                                        <label>Family Name</label>
                                        <input required type="text" value={editFormData.familyName} onChange={e => setEditFormData({...editFormData, familyName: e.target.value})} />
                                    </div>
                                    <div className="fam-form-group">
                                        <label>Address</label>
                                        <textarea value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} rows="3" />
                                    </div>
                                    <div className="fam-form-group">
                                        <label>Head of Household</label>
                                        <select 
                                            value={editFormData.headMemberId || ''} 
                                            onChange={e => setEditFormData({...editFormData, headMemberId: e.target.value ? Number(e.target.value) : null})}
                                        >
                                            <option value="">-- None Selected --</option>
                                            {selectedFamily.members.map(m => (
                                                <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </form>
                            </div>
                            
                            {/* Right Side: Add Members */}
                            <div className="fam-modal-col fam-col-border">
                                <h3>Add Members</h3>
                                <div className="fam-search-box">
                                    <input 
                                        type="text" 
                                        placeholder="Search members by name or ID..." 
                                        value={editSearchTerm}
                                        onChange={e => {
                                            setEditSearchTerm(e.target.value);
                                            searchMembers(e.target.value, setEditSearchResults, setEditIsSearching);
                                        }}
                                    />
                                </div>
                                <div className="fam-search-results">
                                    {editIsSearching && <div className="mini-spinner">Searching...</div>}
                                    {!editIsSearching && editSearchResults.length === 0 && editSearchTerm.length >= 2 && (
                                        <div className="no-results-mini">No members found.</div>
                                    )}
                                    {editSearchResults.map(member => (
                                        <div key={member.memberId} className="fam-search-item">
                                            <div className="fam-search-info">
                                                <div className="fam-search-name">{member.firstName} {member.lastName}</div>
                                                <div className="fam-search-id">{member.customMemberId || member.memberId}</div>
                                            </div>
                                            <button 
                                                className="btn-add-mini"
                                                onClick={() => {
                                                    handleAddMember(selectedFamily.familyId, member.memberId);
                                                    setSelectedFamily({
                                                        ...selectedFamily,
                                                        members: [...selectedFamily.members, member]
                                                    });
                                                }}
                                                disabled={selectedFamily.members.some(m => m.memberId === member.memberId)}
                                            >
                                                {selectedFamily.members.some(m => m.memberId === member.memberId) ? 'Added' : '+ Add'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="fam-modal-footer">
                            <button type="button" className="fam-btn-secondary" onClick={() => setShowEditModal(false)}>Close</button>
                            <button type="submit" form="editFamilyForm" className="fam-btn-primary">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Families;
