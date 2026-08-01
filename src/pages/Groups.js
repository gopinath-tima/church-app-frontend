import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Groups.css';

// Component to retrieve and display member avatars with security credentials
const AuthenticatedAvatar = ({ memberId, firstName, lastName, photoUrl, photoContentType, getInitials, getAvatarColor, size = "36px" }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!photoUrl && !photoContentType) return;

        const fetchImage = async () => {
            try {
                const token = 
                    localStorage.getItem("token") || 
                    localStorage.getItem("jwt") || 
                    localStorage.getItem("jwtToken") || 
                    localStorage.getItem("authToken") || 
                    localStorage.getItem("accessToken");
                
                const url = photoUrl 
                    ? `http://localhost:8081${photoUrl}` 
                    : `http://localhost:8081/api/members/${memberId}/photo`;

                const response = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    responseType: 'blob'
                });

                const imageUrl = URL.createObjectURL(response.data);
                setImageSrc(imageUrl);
                setError(false);
            } catch (err) {
                console.error("Error fetching avatar:", err);
                setError(true);
            }
        };

        fetchImage();

        return () => {
            if (imageSrc) URL.revokeObjectURL(imageSrc);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId, photoUrl, photoContentType]);

    const initials = getInitials(firstName, lastName);
    const avatarColor = getAvatarColor(`${firstName}${lastName}`);

    if (error || (!photoUrl && !photoContentType)) {
        return (
            <div 
                style={{ width: size, height: size, borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}
            >
                {initials}
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div 
                style={{ width: size, height: size, borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: '700', color: '#fff' }}
            >
                {initials}
            </div>
        );
    }

    return (
        <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <img 
                src={imageSrc} 
                alt={firstName} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setError(true)}
            />
        </div>
    );
};

const getInitials = (firstName, lastName) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
};

const getAvatarColor = (name) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    // Member connections mapping: cache group member lists by groupId
    const [groupMembersCache, setGroupMembersCache] = useState({});

    // Modals visibility states
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    
    // Group Form State (Create/Edit)
    const [isEditing, setIsEditing] = useState(false);
    const [currentGroupId, setCurrentGroupId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Cell Group',
        meetingTime: '',
        location: '',
        status: 'Active'
    });

    // Details Modal / Connections Panel State
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [isSearchingMember, setIsSearchingMember] = useState(false);
    const [linkingMember, setLinkingMember] = useState(null);
    const [linkingRole, setLinkingRole] = useState('Member');
    const [linkingJoinDate, setLinkingJoinDate] = useState(new Date().toISOString().split('T')[0]);

    // Retrieve security headers
    const getAuthHeaders = () => {
        const token = 
            localStorage.getItem("token") || 
            localStorage.getItem("jwt") || 
            localStorage.getItem("jwtToken") || 
            localStorage.getItem("authToken") || 
            localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Retrieve all groups from REST API
    const fetchGroups = useCallback(async () => {
        try {
            const res = await axios.get('http://localhost:8081/api/groups', {
                headers: getAuthHeaders()
            });
            setGroups(res.data || []);
            
            // For each group, pre-fetch its connected members to calculate totals
            (res.data || []).forEach(g => {
                fetchGroupMembers(g.groupId);
            });
        } catch (err) {
            console.error("Error fetching groups:", err);
        }
    }, []);

    // Retrieve group member connections list
    const fetchGroupMembers = async (groupId) => {
        try {
            const res = await axios.get(`http://localhost:8081/api/groups/${groupId}/members`, {
                headers: getAuthHeaders()
            });
            setGroupMembersCache(prev => ({
                ...prev,
                [groupId]: res.data || []
            }));
        } catch (err) {
            console.error(`Error fetching members for group ${groupId}:`, err);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    // Handle form value changes
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Open uploader/editor modal
    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentGroupId(null);
        setFormData({
            name: '',
            description: '',
            category: 'Cell Group',
            meetingTime: '',
            location: '',
            status: 'Active'
        });
        setShowFormModal(true);
    };

    const openEditModal = (e, group) => {
        e.stopPropagation(); // Avoid triggering openDetailsModal
        setIsEditing(true);
        setCurrentGroupId(group.groupId);
        setFormData({
            name: group.name || '',
            description: group.description || '',
            category: group.category || 'Cell Group',
            meetingTime: group.meetingTime || '',
            location: group.location || '',
            status: group.status || 'Active'
        });
        setShowFormModal(true);
    };

    // Submit Group Form (POST / PUT)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        try {
            if (isEditing) {
                await axios.put(`http://localhost:8081/api/groups/${currentGroupId}`, formData, { headers });
            } else {
                await axios.post('http://localhost:8081/api/groups', formData, { headers });
            }
            setShowFormModal(false);
            fetchGroups();
        } catch (err) {
            console.error("Error saving group:", err);
            alert("Error: Could not save group. Please verify data inputs.");
        }
    };

    // Delete group
    const handleDeleteGroup = async (e, groupId) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this group? All member connections will be removed permanently.")) return;
        try {
            await axios.delete(`http://localhost:8081/api/groups/${groupId}`, {
                headers: getAuthHeaders()
            });
            fetchGroups();
            if (selectedGroup && selectedGroup.groupId === groupId) {
                setShowDetailsModal(false);
            }
        } catch (err) {
            console.error("Error deleting group:", err);
            alert("Error: Could not delete group.");
        }
    };

    // Open connection panel modal
    const openDetailsModal = (group) => {
        setSelectedGroup(group);
        setMemberSearchTerm('');
        setMemberSearchResults([]);
        setLinkingMember(null);
        setLinkingRole('Member');
        setLinkingJoinDate(new Date().toISOString().split('T')[0]);
        fetchGroupMembers(group.groupId);
        setShowDetailsModal(true);
    };

    // Autocomplete Search for Members
    const searchMembers = async (term) => {
        if (!term || term.length < 2) {
            setMemberSearchResults([]);
            return;
        }
        setIsSearchingMember(true);
        try {
            const res = await axios.get(`http://localhost:8081/api/members/search?type=all&value=${term}`, {
                headers: getAuthHeaders()
            });
            setMemberSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error searching members:", err);
        } finally {
            setIsSearchingMember(false);
        }
    };

    const handleSelectLinkingMember = (member) => {
        setLinkingMember(member);
        setMemberSearchTerm(`${member.firstName} ${member.lastName}`);
        setMemberSearchResults([]);
    };

    // Add member connection
    const handleAddMemberConnection = async (e) => {
        e.preventDefault();
        if (!linkingMember) return alert("Please search and select a valid church member first.");
        
        const payload = {
            memberId: linkingMember.memberId,
            memberName: `${linkingMember.firstName} ${linkingMember.lastName}`,
            role: linkingRole,
            joinDate: linkingJoinDate
        };

        try {
            await axios.post(`http://localhost:8081/api/groups/${selectedGroup.groupId}/members`, payload, {
                headers: getAuthHeaders()
            });
            
            // Reset autocompletion inputs
            setLinkingMember(null);
            setMemberSearchTerm('');
            
            // Refresh connections list
            fetchGroupMembers(selectedGroup.groupId);
            fetchGroups(); // Refresh main total counts
        } catch (err) {
            console.error("Error adding connection:", err);
            const errMsg = err.response?.data?.message || err.response?.data || "Member may already exist in this group.";
            alert(`Error: ${errMsg}`);
        }
    };

    // Remove member connection
    const handleRemoveMemberConnection = async (memberId) => {
        if (!window.confirm("Are you sure you want to remove this member connection from the group?")) return;
        try {
            await axios.delete(`http://localhost:8081/api/groups/${selectedGroup.groupId}/members/${memberId}`, {
                headers: getAuthHeaders()
            });
            fetchGroupMembers(selectedGroup.groupId);
            fetchGroups(); // Refresh main total counts
        } catch (err) {
            console.error("Error removing connection:", err);
            alert("Error: Could not remove connection.");
        }
    };

    // Category Tags Mapper
    const getCategoryTagClass = (category) => {
        switch (category) {
            case 'Cell Group': return 'tag-cell';
            case 'Ministry Team': return 'tag-ministry';
            case 'Bible Study': return 'tag-study';
            case 'Fellowship': return 'tag-fellowship';
            default: return 'tag-default';
        }
    };

    // Total counts computations
    const stats = useMemo(() => {
        const totalGroups = groups.length;
        
        // Sum up sizes of all distinct cached member lists
        let totalLinkedMembers = 0;
        let activeGroups = 0;
        let inactiveGroups = 0;

        groups.forEach(g => {
            const count = (groupMembersCache[g.groupId] || []).length;
            totalLinkedMembers += count;
            if (g.status === 'Active') {
                activeGroups++;
            } else {
                inactiveGroups++;
            }
        });

        return { totalGroups, totalLinkedMembers, activeGroups, inactiveGroups };
    }, [groups, groupMembersCache]);

    // Live search & category filters
    const filteredGroups = useMemo(() => {
        return groups.filter(g => {
            const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
            const term = searchTerm.toLowerCase();
            const matchesSearch = 
                (g.name && g.name.toLowerCase().includes(term)) ||
                (g.description && g.description.toLowerCase().includes(term)) ||
                (g.location && g.location.toLowerCase().includes(term));
            return matchesCategory && matchesSearch;
        });
    }, [groups, selectedCategory, searchTerm]);

    return (
        <div className="groups-page">
            {/* Header Area */}
            <div className="groups-header">
                <div className="groups-header-left">
                    <h1>Groups & Ministries</h1>
                    <p>Organize, locate, and connect church members to home cells, study groups, and active serving ministries.</p>
                </div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Create Group
                </button>
            </div>

            {/* Dashboard Cards */}
            <div className="groups-summary-grid">
                <div className="groups-summary-card">
                    <div className="groups-summary-card-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Total Groups
                    </div>
                    <div className="groups-summary-card-number">{stats.totalGroups}</div>
                    <div className="groups-summary-card-sub">Active small groups & serve teams</div>
                </div>

                <div className="groups-summary-card">
                    <div className="groups-summary-card-label" style={{ color: '#6366f1' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Linked Connections
                    </div>
                    <div className="groups-summary-card-number">{stats.totalLinkedMembers}</div>
                    <div className="groups-summary-card-sub">Active connected group members</div>
                </div>

                <div className="groups-summary-card">
                    <div className="groups-summary-card-label" style={{ color: '#10b981' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                        Status Summary
                    </div>
                    <div className="groups-summary-card-number" style={{ fontSize: '1.8rem', paddingBottom: '8px', paddingTop: '4px' }}>
                        {stats.activeGroups} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Active</span> • {stats.inactiveGroups} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>Inactive</span>
                    </div>
                    <div className="groups-summary-card-sub">Operational status of all groups</div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="groups-nav-bar">
                <div className="groups-categories-pills">
                    {['All', 'Cell Group', 'Ministry Team', 'Bible Study', 'Fellowship'].map(cat => (
                        <button
                            key={cat}
                            className={`groups-category-pill ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat === 'All' ? 'All Groups' : cat + 's'}
                        </button>
                    ))}
                </div>

                <div className="groups-search-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                        type="text" 
                        placeholder="Search by name, category, or location..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Group Cards Grid */}
            {filteredGroups.length === 0 ? (
                <div className="groups-empty-state">
                    <div className="empty-state-icon-large">👥</div>
                    <h2>No Groups Found</h2>
                    <p>Try searching with another keyword or click 'Create Group' to initialize a new one.</p>
                </div>
            ) : (
                <div className="groups-cards-grid">
                    {filteredGroups.map(group => {
                        const membersCount = (groupMembersCache[group.groupId] || []).length;
                        return (
                            <div key={group.groupId} className="group-card" onClick={() => openDetailsModal(group)}>
                                <div className="group-card-header">
                                    <span className={`group-category-tag ${getCategoryTagClass(group.category)}`}>
                                        {group.category}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                                        <button 
                                            className="btn-action btn-add-people" 
                                            onClick={(e) => { e.stopPropagation(); openDetailsModal(group); }} 
                                            title="Add People to Group" 
                                            style={{ 
                                                background: '#ecfdf5', 
                                                border: '1px solid #10b981', 
                                                color: '#047857', 
                                                padding: '4px 10px', 
                                                borderRadius: '6px', 
                                                fontSize: '0.8rem', 
                                                cursor: 'pointer', 
                                                fontWeight: '700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}
                                        >
                                            ＋ Add People
                                        </button>
                                        <button className="btn-action btn-view" onClick={(e) => openEditModal(e, group)} title="Edit Group">
                                            ✏️
                                        </button>
                                        <button className="btn-action btn-del" onClick={(e) => handleDeleteGroup(e, group.groupId)} title="Delete Group">
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                                <div className="group-card-body">
                                    <h4 className="group-card-title">{group.name}</h4>
                                    <p className="group-card-desc">{group.description || 'No description provided.'}</p>
                                    
                                    <div className="group-card-info-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                        <span>{group.location || 'Location unspecified'}</span>
                                    </div>

                                    <div className="group-card-info-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
                                        <span>{group.meetingTime || 'Schedule unspecified'}</span>
                                    </div>
                                </div>
                                <div className="group-card-footer">
                                    <div className="group-card-members-badge">
                                        👥 {membersCount} {membersCount === 1 ? 'member' : 'members'}
                                    </div>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: group.status === 'Active' ? '#10b981' : '#ef4444' }}>
                                        ● {group.status}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Group Modal */}
            {showFormModal && (
                <div className="groups-modal-overlay">
                    <div className="groups-modal-content">
                        <div className="groups-modal-header">
                            <h2>{isEditing ? 'Edit Group Settings' : 'Create New Group'}</h2>
                            <button className="groups-modal-close-btn" onClick={() => setShowFormModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleFormSubmit}>
                            <div className="groups-modal-body">
                                <div className="group-form-group">
                                    <label className="group-form-label">Group / Ministry Name</label>
                                    <input 
                                        type="text" 
                                        className="group-form-input" 
                                        name="name" 
                                        value={formData.name} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. Youth Cell A, Worship Choir" 
                                        required 
                                    />
                                </div>

                                <div className="group-form-group">
                                    <label className="group-form-label">Category</label>
                                    <select className="group-form-input" name="category" value={formData.category} onChange={handleInputChange} required>
                                        <option value="Cell Group">Cell Group</option>
                                        <option value="Ministry Team">Ministry Team</option>
                                        <option value="Bible Study">Bible Study</option>
                                        <option value="Fellowship">Fellowship</option>
                                    </select>
                                </div>

                                <div className="group-form-group">
                                    <label className="group-form-label">Location / Platform</label>
                                    <input 
                                        type="text" 
                                        className="group-form-input" 
                                        name="location" 
                                        value={formData.location} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. Church Hall B, Pastor's House, Zoom Link" 
                                    />
                                </div>

                                <div className="group-form-group">
                                    <label className="group-form-label">Meeting Schedule</label>
                                    <input 
                                        type="text" 
                                        className="group-form-input" 
                                        name="meetingTime" 
                                        value={formData.meetingTime} 
                                        onChange={handleInputChange} 
                                        placeholder="e.g. Sundays 4:00 PM, Bi-weekly Fridays" 
                                    />
                                </div>

                                <div className="group-form-group">
                                    <label className="group-form-label">Operational Status</label>
                                    <select className="group-form-input" name="status" value={formData.status} onChange={handleInputChange} required>
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="group-form-group">
                                    <label className="group-form-label">Description & Remarks</label>
                                    <textarea 
                                        className="group-form-input" 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleInputChange} 
                                        placeholder="Describe the group purpose, targets, and leaders..." 
                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="groups-modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowFormModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Group</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Details / Linked Member Connections Panel Modal */}
            {showDetailsModal && selectedGroup && (
                <div className="groups-modal-overlay">
                    <div className="groups-modal-content" style={{ maxWidth: '820px', width: '90%', height: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div className="groups-modal-header" style={{ flexShrink: 0 }}>
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    👥 {selectedGroup.name}
                                </h2>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
                                    Category: {selectedGroup.category} • Location: {selectedGroup.location || 'Unspecified'}
                                </p>
                            </div>
                            <button className="groups-modal-close-btn" onClick={() => setShowDetailsModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        
                        <div className="group-details-layout" style={{ flex: 1 }}>
                            {/* Left Panel: Group Meta */}
                            <div className="group-details-left-panel">
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="group-form-label" style={{ color: '#64748b' }}>Description</label>
                                    <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', margin: '4px 0 0 0', whiteSpace: 'pre-wrap' }}>
                                        {selectedGroup.description || 'No description provided.'}
                                    </p>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="group-form-label" style={{ color: '#64748b' }}>Location</label>
                                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                                        📍 {selectedGroup.location || 'Unspecified'}
                                    </span>
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label className="group-form-label" style={{ color: '#64748b' }}>Meeting Schedule</label>
                                    <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: '500' }}>
                                        ⏰ {selectedGroup.meetingTime || 'Unspecified'}
                                    </span>
                                </div>
                                <div>
                                    <label className="group-form-label" style={{ color: '#64748b' }}>Operational Status</label>
                                    <span className="active-member-badge" style={{ 
                                        background: selectedGroup.status === 'Active' ? '#f0fdf4' : '#fef2f2', 
                                        color: selectedGroup.status === 'Active' ? '#10b981' : '#ef4444', 
                                        border: `1px solid ${selectedGroup.status === 'Active' ? '#86efac' : '#fca5a5'}`
                                    }}>
                                        {selectedGroup.status}
                                    </span>
                                </div>
                            </div>

                            {/* Right Panel: Linked Members Connection Dashboard */}
                            <div className="group-details-right-panel">
                                <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0' }}>
                                    Group Connections ({(groupMembersCache[selectedGroup.groupId] || []).length})
                                </h3>

                                {/* Real-time Linking Form */}
                                <form onSubmit={handleAddMemberConnection} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div className="group-form-group" style={{ marginBottom: '10px' }}>
                                        <label className="group-form-label" style={{ fontSize: '0.8rem' }}>Link Church Member</label>
                                        <div className="autocomplete-search-container">
                                            <input 
                                                type="text" 
                                                className="group-form-input" 
                                                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
                                                placeholder="Search member by name..." 
                                                value={memberSearchTerm}
                                                onChange={(e) => {
                                                    setMemberSearchTerm(e.target.value);
                                                    searchMembers(e.target.value);
                                                }}
                                            />
                                            {isSearchingMember && <div style={{ fontSize: '11px', color: '#64748b', padding: '4px' }}>Searching...</div>}
                                            
                                            {memberSearchResults.length > 0 && (
                                                <div className="autocomplete-dropdown">
                                                    {memberSearchResults.map(m => (
                                                        <div 
                                                            key={m.memberId} 
                                                            className="autocomplete-item"
                                                            onClick={() => handleSelectLinkingMember(m)}
                                                        >
                                                            <AuthenticatedAvatar 
                                                                memberId={m.memberId} 
                                                                firstName={m.firstName} 
                                                                lastName={m.lastName} 
                                                                photoUrl={m.photoUrl} 
                                                                photoContentType={m.photoContentType} 
                                                                getInitials={getInitials} 
                                                                getAvatarColor={getAvatarColor} 
                                                                size="24px" 
                                                            />
                                                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{m.firstName} {m.lastName}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                                        <div>
                                            <label className="group-form-label" style={{ fontSize: '0.8rem' }}>Role in Group</label>
                                            <select 
                                                className="group-form-input" 
                                                style={{ fontSize: '0.85rem', padding: '8px 12px' }} 
                                                value={linkingRole} 
                                                onChange={(e) => setLinkingRole(e.target.value)}
                                            >
                                                <option value="Leader">Leader</option>
                                                <option value="Co-Leader">Co-Leader</option>
                                                <option value="Member">Member</option>
                                                <option value="Volunteer">Volunteer</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="group-form-label" style={{ fontSize: '0.8rem' }}>Join Date</label>
                                            <input 
                                                type="date" 
                                                className="group-form-input" 
                                                style={{ fontSize: '0.85rem', padding: '8px 12px' }} 
                                                value={linkingJoinDate} 
                                                onChange={(e) => setLinkingJoinDate(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.85rem', borderRadius: '8px' }}>
                                        Link Member Connection
                                    </button>
                                </form>

                                {/* Connections List */}
                                <div className="linked-members-list-wrapper">
                                    {!(groupMembersCache[selectedGroup.groupId]) || (groupMembersCache[selectedGroup.groupId]).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            No members linked to this group yet.
                                        </div>
                                    ) : (
                                        (groupMembersCache[selectedGroup.groupId]).map(connection => (
                                            <div key={connection.groupMemberId} className="linked-member-row">
                                                <div className="member-row-left">
                                                    <AuthenticatedAvatar 
                                                        memberId={connection.memberId} 
                                                        firstName={connection.memberName?.split(' ')[0]} 
                                                        lastName={connection.memberName?.split(' ')[1] || ''} 
                                                        getInitials={getInitials} 
                                                        getAvatarColor={getAvatarColor} 
                                                        size="32px" 
                                                    />
                                                    <div className="member-row-name-role">
                                                        <span className="member-row-name">{connection.memberName}</span>
                                                        <span className="member-row-role-tag">{connection.role}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <span className="member-row-join-date">Joined {connection.joinDate}</span>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleRemoveMemberConnection(connection.memberId)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '4px' }}
                                                        title="Remove Connection"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="groups-modal-footer" style={{ flexShrink: 0 }}>
                            <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
