import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import './AddMember.css';

const AuthenticatedAvatar = ({ memberId, firstName, lastName, photoUrl, style = {} }) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!photoUrl && !memberId) return;

        const fetchImage = async () => {
            try {
                const token = localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('jwtToken') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
                const url = photoUrl ? `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net${photoUrl}` : `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/${memberId}/photo`;
                const response = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    responseType: 'blob'
                });
                const blobUrl = URL.createObjectURL(response.data);
                setImageSrc(blobUrl);
                setError(false);
            } catch (err) {
                setError(true);
            }
        };
        fetchImage();
        return () => { if (imageSrc) URL.revokeObjectURL(imageSrc); };
    }, [memberId, photoUrl]);

    if (error || (!photoUrl && !imageSrc)) {
        return <div style={{ ...style, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", color: "#94a3b8" }}>👤</div>;
    }
    return <img src={imageSrc} alt="Avatar" style={style} />;
};

const AddMember = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const [activeTab, setActiveTab] = useState('identity');

    const initialFormState = {
        memberId: '', firstName: '', lastName: '', gender: '', dob: '', profilePhoto: null,
        mobileNumber: '', altContactNumber: '', email: '', whatsappNumber: '', emergencyContactName: '', emergencyContactNumber: '',
        addressLine1: '', addressLine2: '', city: '', district: '', state: '', pincode: '', country: 'India',
        familyId: '', familyHeadName: '', relationship: '', maritalStatus: '', anniversaryDate: '', spouseMemberId: '', spouseName: '', partnerNotMember: false, numberOfChildren: '0',
        dateJoined: '', membershipStatus: 'Active', baptismStatus: 'No', baptismDate: '', confirmationStatus: 'No', communionStatus: 'No', previousChurch: '',
        ministryGroups: [], ministryGroupOther: '', ministryRole: '', volunteerStatus: 'Not Currently Available', skills: [], currentSkillInput: '',
        titheMember: 'No', preferredGivingMethod: 'Cash',
        occupation: '', education: '', bloodGroup: '', languagesKnown: '', pastoralNotes: '', prayerRequests: '', specialRemarks: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState(null);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [partnerSearchType, setPartnerSearchType] = useState('name');
    const [partnerSearchValue, setPartnerSearchValue] = useState('');
    const [partnerSearchResults, setPartnerSearchResults] = useState([]);
    
    const [cropImage, setCropImage] = useState(null);
    const [cropScale, setCropScale] = useState(1);
    const editorRef = useRef(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || localStorage.getItem('jwt') || localStorage.getItem('jwtToken') || localStorage.getItem('authToken') || localStorage.getItem('accessToken');
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    useEffect(() => {
        if (isEditMode) loadMemberForEdit();
    }, [editId]);

    const loadMemberForEdit = async () => {
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/${editId}`, { headers });
            const data = res.data;
            setFormData({
                ...initialFormState,
                ...data,
                memberId: data.customMemberId || '',
                dob: data.dateOfBirth || data.dob || '',
                mobileNumber: data.contactNumber || data.mobileNumber || '',
                altContactNumber: data.alternateContact || '',
                addressLine1: data.address || '',
                spouseMemberId: data.spouseMemberId ? String(data.spouseMemberId) : '',
                ministryGroups: data.ministries
                    ? (Array.isArray(data.ministries) && typeof data.ministries[0] === 'object'
                        ? data.ministries.map(m => m.ministryName)
                        : (typeof data.members === 'string' ? data.ministries.split(', ') : data.ministries))
                    : [],
                skills: data.skills ? (Array.isArray(data.skills) ? data.skills : data.skills.split(', ')) : []
            });
            if (data.photoUrl) setPhotoPreviewUrl(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net${data.photoUrl}`);
        } catch (err) {
            console.error("Error loading member:", err);
            alert("Failed to load member data.");
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCheckboxChange = (e, field) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentList = prev[field] || [];
            if (checked) return { ...prev, [field]: [...currentList, value] };
            else return { ...prev, [field]: currentList.filter(item => item !== value) };
        });
    };

    const addSkillTag = (suggestedSkill = null) => {
        const skillToAdd = (suggestedSkill || formData.currentSkillInput).trim();
        if (!skillToAdd) return;
        if (formData.skills.includes(skillToAdd)) return;
        setFormData(prev => ({
            ...prev,
            skills: [...prev.skills, skillToAdd],
            currentSkillInput: suggestedSkill ? prev.currentSkillInput : ''
        }));
    };

    const removeSkillTag = (skill) => {
        setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
    };

    const calculateAge = (dob) => {
        if (!dob) return 0;
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        return age;
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCropImage(file);
            setIsCropModalOpen(true);
        }
    };

    const handleSaveCrop = () => {
        if (editorRef.current) {
            const canvas = editorRef.current.getImageScaledToCanvas();
            canvas.toBlob(blob => {
                const file = new File([blob], 'profile.png', { type: 'image/png' });
                setFormData(prev => ({ ...prev, profilePhoto: file }));
                setPhotoPreviewUrl(URL.createObjectURL(blob));
                setIsCropModalOpen(false);
            }, 'image/png');
        }
    };

    const handlePartnerSearch = async () => {
        if (!partnerSearchValue.trim()) return alert("Please enter search text");
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/search?type=${partnerSearchType}&value=${partnerSearchValue}`, { headers });
            const results = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            setPartnerSearchResults(results.filter(m => String(m.memberId) !== String(editId)));
        } catch (err) {
            setPartnerSearchResults([]);
        }
    };

    const linkSelectedPartner = (m) => {
        setFormData(prev => ({
            ...prev,
            spouseMemberId: m.memberId,
            spouseName: `${m.firstName} ${m.lastName}`,
            familyId: m.familyId || '',
            familyHeadName: m.familyHeadName || '',
            partnerNotMember: false
        }));
        setIsPartnerModalOpen(false);
    };

    const tabs = ['identity', 'contact', 'family', 'spiritual', 'ministry', 'notes'];

    const handleNext = () => {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex < tabs.length - 1) {
            setActiveTab(tabs[currentIndex + 1]);
            // Scroll to top of content body
            const body = document.querySelector('.content-body');
            if (body) body.scrollTop = 0;
        }
    };

    const handlePrevious = () => {
        const currentIndex = tabs.indexOf(activeTab);
        if (currentIndex > 0) {
            setActiveTab(tabs[currentIndex - 1]);
            const body = document.querySelector('.content-body');
            if (body) body.scrollTop = 0;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        const submissionData = new FormData();
        
        let finalMinistryGroup = formData.ministryGroups.filter(g => g !== 'Other').join(', ');
        if (formData.ministryGroups.includes('Other') && formData.ministryGroupOther.trim() !== '') {
            finalMinistryGroup += (finalMinistryGroup ? ', ' : '') + formData.ministryGroupOther.trim();
        }

        const payload = {
            ...formData,
            contactNumber: formData.mobileNumber,
            dateOfBirth: formData.dob,
            address: formData.addressLine1,
            ministryGroups: finalMinistryGroup,
            skills: formData.skills.join(', '),
            spouseMemberId: formData.maritalStatus === 'Married' && formData.spouseMemberId ? Number(formData.spouseMemberId) : null,
            spouseName: formData.maritalStatus === 'Married' ? formData.spouseName : '',
            anniversaryDate: formData.maritalStatus === 'Married' ? formData.anniversaryDate : ''
        };
        
        // Match reference code's FormData structure exactly
        submissionData.append("memberData", JSON.stringify(payload));
        if (formData.profilePhoto) submissionData.append("photo", formData.profilePhoto);

        try {
            const url = isEditMode ? `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/update/${editId}` : `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/add`;
            const method = isEditMode ? 'PUT' : 'POST';

            await axios({ method, url, data: submissionData, headers });
            alert(isEditMode ? "Profile Updated Successfully!" : "Member Registered Successfully!");
            navigate('/people');
        } catch (err) {
            console.error("Submission error:", err);
            const errorMsg = err.response?.data?.message || err.response?.data || err.message;
            alert(`Error ${err.response?.status || ''}: ${errorMsg}\n\nThis might be due to an expired session or insufficient permissions.`);
        }
    };

    const TabButton = ({ id, label, icon }) => (
        <div className={`sidebar-tab ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>
            {icon}
            {label}
        </div>
    );

    return (
        <div className="portal-wrapper">
            <div className="portal-container">
                <aside className="portal-sidebar">
                    <div style={{ padding: "0 32px 30px", borderBottom: "1px solid #f1f5f9", marginBottom: "20px" }}>
                        <h1 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>{isEditMode ? "Edit Profile" : "New Member"}</h1>
                        <p style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>Digital Church Directory</p>
                    </div>
                    
                    <TabButton id="identity" label="Identity" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>} />
                    <TabButton id="contact" label="Contact" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.19-2.19a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>} />
                    <TabButton id="family" label="Family" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} />
                    <TabButton id="spiritual" label="Spiritual" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>} />
                    <TabButton id="ministry" label="Ministry" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>} />
                    <TabButton id="notes" label="Notes" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>} />
                </aside>

                <main className="portal-main">
                    <form onSubmit={handleSubmit} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        <div className="content-body">
                            
                            {activeTab === 'identity' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Personal Identity</h2>
                                        <span className="badge">Primary Verification</span>
                                    </div>

                                    <div className="avatar-hero">
                                        <div style={{ position: "relative" }}>
                                            {photoPreviewUrl ? (
                                                <img src={photoPreviewUrl} alt="Preview" className="avatar-preview-lg" />
                                            ) : (
                                                <AuthenticatedAvatar 
                                                    memberId={editId}
                                                    firstName={formData.firstName}
                                                    lastName={formData.lastName}
                                                    photoUrl={formData.photoUrl}
                                                    style={{ width: "120px", height: "120px", borderRadius: "30px", objectFit: "cover", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", border: "4px solid white" }}
                                                />
                                            )}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>Profile Photo</h4>
                                            <p style={{ margin: "0 0 15px", fontSize: "13px", color: "#64748b" }}>Max size 2MB. Square ratio recommended.</p>
                                            <input type="file" onChange={handleFileChange} style={{ fontSize: "12px", background: "white", padding: "8px 12px", borderRadius: "8px", border: "1px solid #e2e8f0" }} />
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Basic Details</div>
                                        <div className="field-grid">
                                            <div className="form-field">
                                                <label>ID Number</label>
                                                <input type="text" name="memberId" value={formData.memberId} onChange={handleChange} placeholder="Enter ID manually" />
                                            </div>
                                            <div className="form-field"><label>First Name *</label><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required /></div>
                                            <div className="form-field"><label>Last Name *</label><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required /></div>
                                            <div className="form-field"><label>Gender</label><select name="gender" value={formData.gender} onChange={handleChange}><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option></select></div>
                                            <div className="form-field">
                                                <label>Date of Birth <span className="age-badge">{calculateAge(formData.dob)} yrs old</span></label>
                                                <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Professional & Demographics</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Education</label><input type="text" name="education" value={formData.education} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Occupation</label><input type="text" name="occupation" value={formData.occupation} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Languages Known</label><input type="text" name="languagesKnown" value={formData.languagesKnown} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Blood Group</label><select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}><option value="">Select...</option><option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="O+">O+</option><option value="O-">O-</option><option value="AB+">AB+</option><option value="AB-">AB-</option></select></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Connectivity</h2>
                                        <span className="badge">Communication Hub</span>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Direct Contact</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Mobile Number *</label><input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required /></div>
                                            <div className="form-field"><label>WhatsApp Number</label><input type="tel" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Alternate Number</label><input type="tel" name="altContactNumber" value={formData.altContactNumber} onChange={handleChange} /></div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Emergency Protocols</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Emergency Contact Name</label><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Emergency Contact Phone</label><input type="tel" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} /></div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Residential Location</div>
                                        <div className="field-grid">
                                            <div className="form-field" style={{ gridColumn: "1 / -1" }}><label>Street Address</label><input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="House No, Street name..." /></div>
                                            <div className="form-field"><label>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} /></div>
                                            <div className="form-field"><label>District</label><input type="text" name="district" value={formData.district} onChange={handleChange} /></div>
                                            <div className="form-field"><label>State</label><input type="text" name="state" value={formData.state} onChange={handleChange} /></div>
                                            <div className="form-field"><label>Pincode</label><input type="text" name="pincode" value={formData.pincode} onChange={handleChange} /></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'family' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Family Ties</h2>
                                        <span className="badge">Household Tree</span>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Maritial Status</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Current Status</label><select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}><option value="">Select...</option><option value="Single">Single</option><option value="Married">Married</option><option value="Widowed">Widowed</option></select></div>
                                            <div className="form-field"><label>Number of Children</label><input type="number" name="numberOfChildren" value={formData.numberOfChildren} onChange={handleChange} /></div>
                                        </div>
                                    </div>

                                    {formData.maritalStatus === 'Married' && (
                                        <div className="form-section" style={{ padding: "30px", background: "#f8fafc", borderRadius: "20px", border: "2px solid #e2e8f0" }}>
                                            <div className="section-header">Spouse / Partner Verification</div>
                                            <div className="field-grid">
                                                <div className="form-field">
                                                    <label>Select From Directory</label>
                                                    <div style={{ display: "flex", gap: "10px" }}>
                                                        <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} readOnly={!formData.partnerNotMember} style={{ flex: 1, background: formData.partnerNotMember ? "white" : "#e2e8f0" }} placeholder={formData.partnerNotMember ? "Type name..." : "Database ID: " + (formData.spouseMemberId || "Unlinked")} />
                                                        {!formData.partnerNotMember && (
                                                            <button type="button" onClick={() => setIsPartnerModalOpen(true)} className="btn btn-primary" style={{ padding: "0 20px" }}>Link</button>
                                                        )}
                                                    </div>
                                                    <label className="check-label" style={{ marginTop: "15px", fontSize: "13px", color: "#64748b" }}>
                                                        <input type="checkbox" name="partnerNotMember" checked={formData.partnerNotMember} onChange={handleChange} /> Spouse is not a church member
                                                    </label>
                                                </div>
                                                <div className="form-field"><label>Wedding Anniversary</label><input type="date" name="anniversaryDate" value={formData.anniversaryDate} onChange={handleChange} /></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'spiritual' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Spiritual Journey</h2>
                                        <span className="badge">Faith Records</span>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Church Onboarding</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Membership Status</label><select name="membershipStatus" value={formData.membershipStatus} onChange={handleChange}><option value="Active">Active</option><option value="Inactive">Inactive</option><option value="Transferred">Transferred</option></select></div>
                                            <div className="form-field"><label>Onboarding Date</label><input type="date" name="dateJoined" value={formData.dateJoined} onChange={handleChange} /></div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Milestones & Sacraments</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Baptism</label><select name="baptismStatus" value={formData.baptismStatus} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                            <div className="form-field"><label>Baptism Date</label><input type="date" name="baptismDate" value={formData.baptismDate} onChange={handleChange} disabled={formData.baptismStatus !== 'Yes'} /></div>
                                            <div className="form-field"><label>Confirmation</label><select name="confirmationStatus" value={formData.confirmationStatus} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                            <div className="form-field"><label>Holy Communion</label><select name="communionStatus" value={formData.communionStatus} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Tithing & Financials</div>
                                        <div className="field-grid">
                                            <div className="form-field"><label>Tithe Contributor</label><select name="titheMember" value={formData.titheMember} onChange={handleChange}><option value="No">No</option><option value="Yes">Yes</option></select></div>
                                            <div className="form-field"><label>Preferred Mode</label><select name="preferredGivingMethod" value={formData.preferredGivingMethod} onChange={handleChange}><option value="Cash">Cash</option><option value="UPI">UPI</option><option value="Bank">Bank Transfer</option></select></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'ministry' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Ministry & Service</h2>
                                        <span className="badge">Church Engagement</span>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Primary Assignment</div>
                                        <div className="field-grid">
                                            <div className="form-field">
                                                <label>Assigned Role</label>
                                                <select name="ministryRole" value={formData.ministryRole} onChange={handleChange}>
                                                    <option value="">Select Role...</option><option value="Member">Member</option><option value="Management">Management</option><option value="Coordinator">Coordinator</option><option value="Volunteer">Volunteer</option><option value="Trainer">Trainer</option>
                                                </select>
                                            </div>
                                            <div className="form-field"><label>Commitment Level</label><select name="volunteerStatus" value={formData.volunteerStatus} onChange={handleChange}><option value="Active">Active</option><option value="Interested">Interested</option><option value="Not Currently Available">Not Currently Available</option></select></div>
                                        </div>
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Ministry Groups</div>
                                        <div className="checkbox-grid" style={{ marginBottom: "20px" }}>
                                            {["Choir", "Youth", "Media", "Outreach", "Prayer", "Children Ministry", "Ushering", "Welfare", "Other"].map(opt => (
                                                <label key={opt} className="check-label">
                                                    <input type="checkbox" value={opt} checked={formData.ministryGroups.includes(opt)} onChange={(e) => handleCheckboxChange(e, 'ministryGroups')} /> {opt}
                                                </label>
                                            ))}
                                        </div>
                                        {formData.ministryGroups.includes('Other') && (
                                            <div className="form-field" style={{ animation: "fadeIn 0.3s ease" }}><label>Specify Other Group</label><input type="text" name="ministryGroupOther" value={formData.ministryGroupOther} onChange={handleChange} placeholder="Type custom group name..." /></div>
                                        )}
                                    </div>

                                    <div className="form-section">
                                        <div className="section-header">Skills & Talents</div>
                                        <div className="tags-container">
                                            {formData.skills.map(s => <span key={s} className="tag-chip">{s}<span className="tag-close" onClick={() => removeSkillTag(s)}>&times;</span></span>)}
                                        </div>
                                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                                            <input type="text" name="currentSkillInput" value={formData.currentSkillInput} onChange={handleChange} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkillTag())} placeholder="Add a new skill..." style={{ flex: 1 }} />
                                            <button type="button" onClick={() => addSkillTag()} className="btn btn-primary">Add Tag</button>
                                        </div>
                                        <div style={{ marginTop: "15px", fontSize: "12px" }}>
                                            <span style={{ color: "#64748b", marginRight: "10px" }}>Hot Picks:</span>
                                            {["Singing", "Piano", "Editing", "Hosting", "Cookery"].map(sk => <button key={sk} type="button" className="tag-chip" style={{ display: "inline-flex", fontSize: "11px", padding: "4px 10px", border: "1px dashed #cbd5e1", marginRight: "8px", background: "none", cursor: "pointer", color: "#64748b" }} onClick={() => addSkillTag(sk)}>{sk}</button>)}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="tab-content">
                                    <div className="tab-title">
                                        <h2>Observations</h2>
                                        <span className="badge">Confidential Records</span>
                                    </div>
                                    <div className="form-section">
                                        <div className="form-field" style={{ marginBottom: "25px" }}><label>Pastoral Reflections</label><textarea name="pastoralNotes" value={formData.pastoralNotes} onChange={handleChange} placeholder="Confidential spiritual observations..." /></div>
                                        <div className="form-field" style={{ marginBottom: "25px" }}><label>Family Prayer Petitions</label><textarea name="prayerRequests" value={formData.prayerRequests} onChange={handleChange} placeholder="Active prayer needs..." /></div>
                                        <div className="form-field"><label>Internal Administrative Meta</label><textarea name="specialRemarks" value={formData.specialRemarks} onChange={handleChange} placeholder="Internal office notes only..." /></div>
                                    </div>
                                </div>
                            )}

                        </div>

                        <footer className="portal-footer">
                            <div style={{ marginRight: "auto" }}>
                                {activeTab !== 'identity' && (
                                    <button type="button" onClick={handlePrevious} className="btn btn-secondary">← Previous Section</button>
                                )}
                            </div>
                            <button type="button" onClick={() => navigate('/people')} className="btn btn-secondary">Discard Changes</button>
                            {activeTab === 'notes' ? (
                                <button type="submit" className="btn btn-primary" style={{ padding: "12px 40px" }}>{isEditMode ? "💾 Commit Updates" : "✅ Finalize Registration"}</button>
                            ) : (
                                <button type="button" onClick={handleNext} className="btn btn-primary" style={{ padding: "12px 40px" }}>Next Section →</button>
                            )}
                        </footer>
                    </form>
                </main>
            </div>

            {isCropModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: "450px", textAlign: "center" }}>
                        <div className="modal-header">
                            <h3 style={{ marginBottom: "10px" }}>Visual Optimization</h3>
                            <p style={{ color: "#64748b", fontSize: "14px" }}>Perfect your profile presentation.</p>
                        </div>
                        
                        <div style={{ margin: "30px 0" }}>
                            <AvatarEditor ref={editorRef} image={cropImage} width={250} height={250} border={30} borderRadius={125} scale={cropScale} />
                            <div style={{ marginTop: "20px" }}>
                                <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 700, display: "block", marginBottom: "10px" }}>ZOOM SCALE</label>
                                <input type="range" min="1" max="2" step="0.01" value={cropScale} onChange={e => setCropScale(parseFloat(e.target.value))} style={{ width: "100%" }} />
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "15px" }}>
                            <button onClick={() => setIsCropModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                            <button onClick={handleSaveCrop} className="btn btn-primary" style={{ flex: 1 }}>Apply Crop</button>
                        </div>
                    </div>
                </div>
            )}

            {isPartnerModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Link Household Member</h3>
                            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>Select an existing record from the church directory.</p>
                        </div>

                        <div className="search-bar-premium">
                            <select value={partnerSearchType} onChange={e => setPartnerSearchType(e.target.value)} style={{ width: "120px", fontWeight: 600 }}>
                                <option value="name">Name</option>
                                <option value="id">Member ID</option>
                                <option value="phone">Phone</option>
                            </select>
                            <div style={{ width: "1px", background: "#e2e8f0", margin: "8px 0" }}></div>
                            <input type="text" value={partnerSearchValue} onChange={e => setPartnerSearchValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePartnerSearch()} placeholder="Enter name, ID or phone..." />
                            <button onClick={handlePartnerSearch} className="btn btn-primary" style={{ borderRadius: "14px" }}>Search</button>
                        </div>

                        <div className="results-list-premium">
                            {partnerSearchResults.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
                                    <div>No directory matches found.</div>
                                </div>
                            ) : (
                                partnerSearchResults.map(m => (
                                    <div key={m.memberId} className="result-card">
                                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                                            <AuthenticatedAvatar 
                                                memberId={m.memberId}
                                                firstName={m.firstName}
                                                lastName={m.lastName}
                                                photoUrl={m.photoUrl}
                                                style={{ width: "45px", height: "45px", borderRadius: "12px", objectFit: "cover", border: "2px solid white", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                                            />
                                            <div className="result-info">
                                                <div className="name">{m.firstName} {m.lastName}</div>
                                                <div className="sub">ID: {m.customMemberId || m.memberId} • {m.contactNumber || 'No Phone'}</div>
                                            </div>
                                        </div>
                                        <button onClick={() => linkSelectedPartner(m)} className="btn btn-primary" style={{ padding: "8px 20px", borderRadius: "12px", fontSize: "13px" }}>Link Spouse</button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button onClick={() => setIsPartnerModalOpen(false)} className="btn btn-secondary" style={{ width: "100%", marginTop: "30px", padding: "14px", borderRadius: "16px" }}>Close Linker</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AddMember;