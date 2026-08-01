import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './People.css';
import MemberDetailView from '../components/MemberDetailView';

const AuthenticatedAvatar = ({ memberId, firstName, lastName, photoUrl, photoContentType, getInitials, getAvatarColor }) => {
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

    if (error || (!photoUrl && !photoContentType)) {
        return (
            <div 
                className="avatar" 
                style={{ backgroundColor: getAvatarColor(`${firstName}${lastName}`) }}
            >
                {getInitials(firstName, lastName)}
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div 
                className="avatar" 
                style={{ backgroundColor: getAvatarColor(`${firstName}${lastName}`) }}
            >
                {getInitials(firstName, lastName)}
            </div>
        );
    }

    return (
        <div className="avatar" style={{ backgroundColor: 'transparent' }}>
            <img 
                src={imageSrc} 
                alt={firstName} 
                className="avatar-img"
                onError={() => setError(true)}
            />
        </div>
    );
};

const People = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [viewMember, setViewMember] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || 
                     localStorage.getItem("jwt") || 
                     localStorage.getItem("jwtToken") || 
                     localStorage.getItem("authToken") || 
                     localStorage.getItem("accessToken");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    };

    const fetchMembers = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            
            // If no token, we can still try, but the backend may reject it for the full list
            const res = await axios.get('http://localhost:8081/api/members', { headers: headers || {} });
            
            // Extract the actual list of members. Handle both direct list and paginated response.
            let memberData = res.data;
            if (res.data && typeof res.data === 'object' && res.data.content) {
                memberData = res.data.content;
            }
            setMembers(Array.isArray(memberData) ? memberData : []);
        } catch (err) {
            console.error("Error fetching members:", err);
            // If the main list fails (common if unauthorized), try the search endpoint with an empty string
            // as it has 'permitAll' in security config
            try {
                const res = await axios.get('http://localhost:8081/api/members/search?type=name&value=');
                setMembers(Array.isArray(res.data) ? res.data : []);
            } catch (searchErr) {
                setMembers([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleViewClick = async (id) => {
        try {
            const res = await axios.get(`http://localhost:8081/api/members/${id}`);
            setViewMember(res.data);
            // Scroll to view if needed, but it will be at the top anyway
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            alert(err.response?.data || "Unable to load member details.");
        }
    };

    const handleDeleteMember = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this member?")) return;

        const headers = getAuthHeaders();
        try {
            await axios.delete(`http://localhost:8081/api/members/delete/${id}`, { headers });
            alert("Member deleted successfully.");
            setMembers(prev => prev.filter(m => m.memberId !== id));
            if (viewMember?.memberId === id) setViewMember(null);
        } catch (err) {
            alert(err.response?.data || "Cannot delete this member.");
        }
    };

    const handleEditMember = (member) => {
        // Redirect to add-member page with edit search param
        navigate(`/add-member?edit=${member.memberId}`);
    };

    const getInitials = (firstName, lastName) => {
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
    };

    const getAvatarColor = (name) => {
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const filteredMembers = members.filter(member => {
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        const email = (member.email || '').toLowerCase();
        const phone = (member.contactNumber || '').toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                             email.includes(searchTerm.toLowerCase()) || 
                             phone.includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'All Status' || member.membershipStatus === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="people-loading">Loading members...</div>;

    return (
        <div className="people-container">
            <MemberDetailView 
                viewMember={viewMember} 
                onClose={() => setViewMember(null)} 
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
            />
            <div className="people-header">
                <div className="search-box">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search members..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <div className="filter-icon">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                        </svg>
                    </div>
                    <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                        <option>Transferred</option>
                    </select>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="people-table-wrapper desktop-only">
                <table className="people-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>NAME</th>
                            <th>PHONE</th>
                            <th>ROLE</th>
                            <th>STATUS</th>
                            <th>JOINED</th>
                            <th style={{ textAlign: "center" }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.memberId} onClick={() => handleViewClick(member.memberId)}>
                                <td data-label="ID"><span>{member.customMemberId || member.memberId}</span></td>
                                <td data-label="NAME" className="name-cell">
                                    <AuthenticatedAvatar 
                                        memberId={member.memberId}
                                        firstName={member.firstName}
                                        lastName={member.lastName}
                                        photoUrl={member.photoUrl}
                                        photoContentType={member.photoContentType}
                                        getInitials={getInitials}
                                        getAvatarColor={getAvatarColor}
                                    />
                                    <span className="member-name">{member.firstName} {member.lastName}</span>
                                </td>
                                <td data-label="PHONE"><span>{member.contactNumber || '—'}</span></td>
                                <td data-label="ROLE">
                                    <span className="role-badge">
                                        {member.ministryRole || 'Member'}
                                    </span>
                                </td>
                                <td data-label="STATUS">
                                    <span className={`status-badge ${member.membershipStatus?.toLowerCase() || 'active'}`}>
                                        {member.membershipStatus || 'Active'}
                                    </span>
                                </td>
                                <td data-label="JOINED"><span>{member.joinDate || member.dateJoined || '—'}</span></td>
                                <td data-label="ACTIONS" className="actions-cell" onClick={(e) => e.stopPropagation()} style={{ textAlign: "center" }}>
                                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                        <button onClick={() => handleViewClick(member.memberId)} className="action-btn view-btn" title="View Details" style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", color: "#64748b" }}>view</button>
                                        <button onClick={() => handleEditMember(member)} className="action-btn edit-btn" title="Edit Member" style={{ background: "none", border: "1px solid #3b82f6", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", color: "#3b82f6" }}>edit</button>
                                        <button onClick={() => handleDeleteMember(member.memberId)} className="action-btn delete-btn" title="Delete Member" style={{ background: "none", border: "1px solid #ef4444", borderRadius: "4px", padding: "4px 8px", cursor: "pointer", color: "#ef4444" }}>delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMembers.length === 0 && (
                    <div className="no-results">No members found matching your criteria.</div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="people-mobile-list mobile-only">
                {filteredMembers.map((member) => (
                    <div className="mobile-member-card" key={member.memberId} onClick={() => handleViewClick(member.memberId)}>
                        <div className="mobile-card-header">
                            <AuthenticatedAvatar 
                                memberId={member.memberId}
                                firstName={member.firstName}
                                lastName={member.lastName}
                                photoUrl={member.photoUrl}
                                photoContentType={member.photoContentType}
                                getInitials={getInitials}
                                getAvatarColor={getAvatarColor}
                            />
                            <div className="mobile-card-title">
                                <h3>{member.firstName} {member.lastName}</h3>
                                <span className="mobile-member-id">ID: {member.customMemberId || member.memberId}</span>
                            </div>
                        </div>
                        <div className="mobile-card-body">
                            <div className="mobile-card-row">
                                <span className="mobile-label">Phone</span>
                                <span className="mobile-value">{member.contactNumber || '—'}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-label">Role</span>
                                <span className="role-badge">{member.ministryRole || 'Member'}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-label">Status</span>
                                <span className={`status-badge ${member.membershipStatus?.toLowerCase() || 'active'}`}>{member.membershipStatus || 'Active'}</span>
                            </div>
                            <div className="mobile-card-row">
                                <span className="mobile-label">Joined</span>
                                <span className="mobile-value">{member.joinDate || member.dateJoined || '—'}</span>
                            </div>
                        </div>
                        <div className="mobile-card-actions" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => handleViewClick(member.memberId)} className="mobile-btn-view">View</button>
                            <button onClick={() => handleEditMember(member)} className="mobile-btn-edit">Edit</button>
                            <button onClick={() => handleDeleteMember(member.memberId)} className="mobile-btn-delete">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default People;
