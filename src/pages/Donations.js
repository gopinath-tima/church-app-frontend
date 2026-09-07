import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Donations.css';

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
                    ? `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net${photoUrl}` 
                    : `https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/${memberId}/photo`;

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
                style={{ width: size, height: size, borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}
            >
                {initials}
            </div>
        );
    }

    if (!imageSrc) {
        return (
            <div 
                style={{ width: size, height: size, borderRadius: '50%', backgroundColor: avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: '#fff' }}
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
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

const Donations = () => {
    const [donations, setDonations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showInKindModal, setShowInKindModal] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({});
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isNonMember, setIsNonMember] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt") ||
            localStorage.getItem("jwtToken") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    const fetchDonations = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const [trxRes, inKindRes] = await Promise.all([
                axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', { headers }),
                axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/inkind', { headers })
            ]);
            
            const cashDonations = (trxRes.data || []).filter(t => t.type === 'Donation');
            
            const mappedInKind = (inKindRes.data || []).map(ik => {
                const qty = ik.quantity || 1;
                const unitStr = ik.unit ? ` ${ik.unit}` : '';
                return {
                    ...ik,
                    transactionId: `INK-${ik.id.toString().padStart(5, '0')}`,
                    description: `${ik.itemName} (${qty}${unitStr})`,
                    type: 'In-Kind',
                    method: 'In-Kind',
                    amount: ik.estimatedValue || 0,
                    status: 'Completed'
                };
            });

            const allDonations = [...cashDonations, ...mappedInKind].sort((a, b) => {
                if (!a.date || !b.date) return 0;
                return new Date(b.date) - new Date(a.date);
            });
            setDonations(allDonations);
        } catch (error) {
            console.error("Error fetching donations", error);
        }
    }, []);

    useEffect(() => {
        fetchDonations();
    }, [fetchDonations]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const searchMembers = async (term) => {
        if (!term || term.length < 2) {
            setMemberSearchResults([]);
            return;
        }
        setIsSearching(true);
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/search?type=all&value=${term}`, { headers });
            setMemberSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error searching members:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleMemberSelect = (member) => {
        setSelectedMember(member);
        setFormData(prev => ({
            ...prev,
            memberId: member.memberId,
            donorName: `${member.firstName} ${member.lastName}`
        }));
        setMemberSearchTerm('');
        setMemberSearchResults([]);
    };

    const toggleNonMember = (checked) => {
        setIsNonMember(checked);
        if (checked) {
            setSelectedMember(null);
            setFormData(prev => ({ ...prev, memberId: null, donorName: '' }));
        }
    };

    const resetForm = () => {
        setFormData({});
        setMemberSearchTerm('');
        setMemberSearchResults([]);
        setSelectedMember(null);
        setIsNonMember(false);
        setShowModal(false);
        setShowInKindModal(false);
    };

    const submitDonation = async () => {
        const headers = getAuthHeaders();
        if (!headers) return alert("Please log in.");
        
        let dName = formData.donorName;
        if (!isNonMember && !selectedMember && memberSearchTerm) {
            dName = memberSearchTerm;
        }

        const payload = { 
            ...formData, 
            donorName: dName,
            type: 'Donation', 
            status: 'Completed',
            amount: Number(formData.amount) || 0,
            description: formData.description || 'Donation Payment'
        };

        try {
            await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', payload, { headers });
            resetForm();
            fetchDonations();
        } catch (e) {
            console.error(e);
            alert("Failed to save donation.");
        }
    };

    const submitInKind = async () => {
        const headers = getAuthHeaders();
        if (!headers) return alert("Please log in.");

        let dName = formData.donorName;
        if (!isNonMember && !selectedMember && memberSearchTerm) {
            dName = memberSearchTerm;
        }

        const payload = { 
            ...formData,
            donorName: dName,
            quantity: Number(formData.quantity) || 1
        };
        if (payload.estimatedValue) payload.estimatedValue = Number(payload.estimatedValue);
        try {
            await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/inkind', payload, { headers });
            resetForm();
            fetchDonations();
        } catch (e) { console.error(e); }
    };

    // Calculate totals
    const totals = useMemo(() => {
        let allTime = 0;
        let thisYear = 0;
        let thisMonth = 0;
        let totalInKind = 0;

        const now = new Date();
        const curYear = now.getFullYear();
        const curMonth = now.getMonth();

        donations.forEach(d => {
            const amt = d.amount || 0;

            if (d.type === 'In-Kind') {
                totalInKind += amt;
                return;
            }

            allTime += amt;

            if (d.date) {
                const dDate = new Date(d.date);
                if (dDate.getFullYear() === curYear) {
                    thisYear += amt;
                    if (dDate.getMonth() === curMonth) {
                        thisMonth += amt;
                    }
                }
            }
        });

        return { allTime, thisYear, thisMonth, totalInKind };
    }, [donations]);

    const filteredDonations = donations.filter(d => 
        (d.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.donorName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (d.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="donations-page">
            <div className="donations-header">
                <div className="donations-header-left">
                    <h1>Donation Management</h1>
                    <p>Track off-the-books and standard donations separately from the main ledger.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-secondary" onClick={() => setShowInKindModal(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                        Add In-Kind
                    </button>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Donation
                    </button>
                </div>
            </div>

            <div className="donations-summary-grid">
                <div className="donation-card card-alltime">
                    <div className="donation-card-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        All-Time Total
                    </div>
                    <div className="donation-card-amount">₹ {totals.allTime.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="donation-card-sub">Total recorded donations</div>
                </div>
                
                <div className="donation-card card-year">
                    <div className="donation-card-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        This Year
                    </div>
                    <div className="donation-card-amount">₹ {totals.thisYear.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="donation-card-sub">{new Date().getFullYear()}</div>
                </div>

                <div className="donation-card card-month">
                    <div className="donation-card-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        This Month
                    </div>
                    <div className="donation-card-amount">₹ {totals.thisMonth.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="donation-card-sub">{new Date().toLocaleString('default', { month: 'long' })}</div>
                </div>

                <div className="donation-card card-inkind" style={{ borderColor: '#e2e8f0' }}>
                    <div className="donation-card-label" style={{ color: '#475569' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        In-Kind Value
                    </div>
                    <div className="donation-card-amount">₹ {totals.totalInKind.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="donation-card-sub">Estimated Goods Value</div>
                </div>
            </div>

            <div className="donations-content">
                <div className="donations-table-top">
                    <div className="donations-search-wrap">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input 
                            type="text" 
                            placeholder="Search by ID, Donor, or Description..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                {/* Desktop View */}
                <div className="donations-table-wrap desktop-only">
                    <table className="donations-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>ID</th>
                                <th>Donor</th>
                                <th>Description</th>
                                <th>Method</th>
                                <th style={{ textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDonations.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No donations found.</td>
                                </tr>
                            ) : (
                                filteredDonations.map(d => (
                                    <tr key={d.id}>
                                        <td>{d.date || '—'}</td>
                                        <td>{d.transactionId}</td>
                                        <td style={{ fontWeight: 600 }}>{d.donorName || 'Anonymous'}</td>
                                        <td>{d.description || 'Donation'}</td>
                                        <td>
                                            <span className={`badge ${
                                                d.method === 'Cash' ? 'badge-cash' :
                                                d.method === 'In-Kind' ? 'badge-inkind' : 'badge-bank'
                                            }`}>
                                                {d.method || 'Cash'}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                                            ₹ {(d.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="don-mobile-list mobile-only">
                    {filteredDonations.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No donations found.</div>
                    ) : (
                        filteredDonations.map(d => (
                            <div className="mobile-member-card" key={d.id}>
                                <div className="mobile-card-header">
                                    <div className="mobile-card-title">
                                        <h3>{d.donorName || 'Anonymous'}</h3>
                                        <span className="mobile-member-id">{d.transactionId} • {d.date || '—'}</span>
                                    </div>
                                    <span className={`badge ${
                                        d.method === 'Cash' ? 'badge-cash' :
                                        d.method === 'In-Kind' ? 'badge-inkind' : 'badge-bank'
                                    }`}>
                                        {d.method || 'Cash'}
                                    </span>
                                </div>
                                <div className="mobile-card-body">
                                    <div className="mobile-card-row">
                                        <span className="mobile-label">Description</span>
                                        <span className="mobile-value">{d.description || 'Donation'}</span>
                                    </div>
                                    <div className="mobile-card-row">
                                        <span className="mobile-label">Amount</span>
                                        <span className="mobile-value" style={{ fontWeight: 700, color: '#0f172a' }}>
                                            ₹ {(d.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Donation Modal */}
            {showModal && (
                <div className="don-modal-overlay">
                    <div className="don-modal">
                        <div className="don-modal-header">
                            <div>
                                <h2>Add Donation</h2>
                                <p>Record a new donation entry.</p>
                            </div>
                            <button className="don-modal-close" onClick={resetForm}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="don-modal-body">
                            <div className="don-form-group">
                                <label className="don-label">Description / Title</label>
                                <input type="text" className="don-input" name="description" onChange={handleInputChange} placeholder="e.g. Special Donation" />
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Amount</label>
                                <div className="don-amount-wrap">
                                    <span className="don-currency">₹</span>
                                    <input type="number" className="don-amount-input" name="amount" min="0" step="any" placeholder="Enter amount" onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Date</label>
                                <input type="date" className="don-input" name="date" onChange={handleInputChange} />
                            </div>

                            <div className="don-form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="don-label" style={{ marginBottom: 0 }}>Contributor</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                        <input 
                                            type="checkbox" 
                                            id="nonMemberToggleDon" 
                                            checked={isNonMember} 
                                            onChange={(e) => toggleNonMember(e.target.checked)} 
                                        />
                                        <label htmlFor="nonMemberToggleDon" style={{ cursor: 'pointer' }}>Not a member?</label>
                                    </div>
                                </div>

                                {!isNonMember ? (
                                    <div style={{ position: 'relative' }}>
                                        {selectedMember ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <AuthenticatedAvatar 
                                                        memberId={selectedMember.memberId}
                                                        firstName={selectedMember.firstName}
                                                        lastName={selectedMember.lastName}
                                                        photoUrl={selectedMember.photoUrl}
                                                        photoContentType={selectedMember.photoContentType}
                                                        getInitials={getInitials}
                                                        getAvatarColor={getAvatarColor}
                                                        size="32px"
                                                    />
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#064e3b' }}>{selectedMember.firstName} {selectedMember.lastName}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedMember(null)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                >Change</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="text" 
                                                        className="don-input" 
                                                        style={{ width: '100%', paddingLeft: '32px' }}
                                                        placeholder="Search by name or phone..." 
                                                        value={memberSearchTerm}
                                                        onChange={(e) => {
                                                            setMemberSearchTerm(e.target.value);
                                                            searchMembers(e.target.value);
                                                        }}
                                                    />
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '12px' }}>
                                                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    </svg>
                                                </div>
                                                {isSearching && <div style={{ padding: '8px', fontSize: '12px', color: '#64748b' }}>Searching...</div>}
                                                {memberSearchResults.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                                                        {memberSearchResults.map(m => (
                                                            <div 
                                                                key={m.memberId} 
                                                                style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                                onClick={() => handleMemberSelect(m)}
                                                            >
                                                                <AuthenticatedAvatar memberId={m.memberId} firstName={m.firstName} lastName={m.lastName} photoUrl={m.photoUrl} photoContentType={m.photoContentType} getInitials={getInitials} getAvatarColor={getAvatarColor} size="28px" />
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{m.firstName} {m.lastName}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{m.phone}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <input type="text" className="don-input" name="donorName" placeholder="Enter contributor's name" onChange={handleInputChange} />
                                )}
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Method</label>
                                <select className="don-input" name="method" onChange={handleInputChange}>
                                    <option value="">Select Method</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                        </div>
                        <div className="don-modal-footer">
                            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
                            <button className="btn-primary" onClick={submitDonation}>Save Donation</button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add In-Kind Modal */}
            {showInKindModal && (
                <div className="don-modal-overlay">
                    <div className="don-modal">
                        <div className="don-modal-header">
                            <div>
                                <h2>Add In-Kind Donation</h2>
                                <p>Record non-cash item donations (food, supplies, equipment, etc.)</p>
                            </div>
                            <button className="don-modal-close" onClick={resetForm}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="don-modal-body">
                            <div className="don-form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="don-label" style={{ marginBottom: 0 }}>Donor Name</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                        <input 
                                            type="checkbox" 
                                            id="nonMemberInKind" 
                                            checked={isNonMember} 
                                            onChange={(e) => toggleNonMember(e.target.checked)} 
                                        />
                                        <label htmlFor="nonMemberInKind" style={{ cursor: 'pointer' }}>Not a member?</label>
                                    </div>
                                </div>

                                {!isNonMember ? (
                                    <div style={{ position: 'relative' }}>
                                        {selectedMember ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <AuthenticatedAvatar 
                                                        memberId={selectedMember.memberId}
                                                        firstName={selectedMember.firstName}
                                                        lastName={selectedMember.lastName}
                                                        photoUrl={selectedMember.photoUrl}
                                                        photoContentType={selectedMember.photoContentType}
                                                        getInitials={getInitials}
                                                        getAvatarColor={getAvatarColor}
                                                        size="32px"
                                                    />
                                                    <div>
                                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#064e3b' }}>{selectedMember.firstName} {selectedMember.lastName}</div>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedMember(null)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                >Change</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="text" 
                                                        className="don-input" 
                                                        style={{ width: '100%', paddingLeft: '32px' }}
                                                        placeholder="Search by name or phone..." 
                                                        value={memberSearchTerm}
                                                        onChange={(e) => {
                                                            setMemberSearchTerm(e.target.value);
                                                            searchMembers(e.target.value);
                                                        }}
                                                    />
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '12px', top: '12px' }}>
                                                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    </svg>
                                                </div>
                                                {isSearching && <div style={{ padding: '8px', fontSize: '12px', color: '#64748b' }}>Searching...</div>}
                                                {memberSearchResults.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                                                        {memberSearchResults.map(m => (
                                                            <div 
                                                                key={m.memberId} 
                                                                style={{ padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                                onClick={() => handleMemberSelect(m)}
                                                            >
                                                                <AuthenticatedAvatar memberId={m.memberId} firstName={m.firstName} lastName={m.lastName} photoUrl={m.photoUrl} photoContentType={m.photoContentType} getInitials={getInitials} getAvatarColor={getAvatarColor} size="28px" />
                                                                <div>
                                                                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#0f172a' }}>{m.firstName} {m.lastName}</div>
                                                                    <div style={{ fontSize: '12px', color: '#64748b' }}>{m.phone}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <input type="text" className="don-input" name="donorName" placeholder="Enter contributor's name" onChange={handleInputChange} />
                                )}
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Item Name</label>
                                <input type="text" className="don-input" name="itemName" onChange={handleInputChange} placeholder="e.g. Rice, Folding chairs, Sound system" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="don-form-group" style={{ marginBottom: 0 }}>
                                    <label className="don-label">Quantity</label>
                                    <input type="number" className="don-input" name="quantity" defaultValue="1" onChange={handleInputChange} />
                                </div>
                                <div className="don-form-group" style={{ marginBottom: 0 }}>
                                    <label className="don-label">Unit</label>
                                    <input type="text" className="don-input" name="unit" onChange={handleInputChange} placeholder="pcs" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div className="don-form-group" style={{ marginBottom: 0 }}>
                                    <label className="don-label">Estimated Value (₹)</label>
                                    <input type="number" className="don-input" name="estimatedValue" onChange={handleInputChange} placeholder="Optional" />
                                </div>
                                <div className="don-form-group" style={{ marginBottom: 0 }}>
                                    <label className="don-label">Date</label>
                                    <input type="date" className="don-input" name="date" onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Purpose</label>
                                <select className="don-input" name="purpose" onChange={handleInputChange}>
                                    <option value="">Select Purpose</option>
                                    <option value="General">General</option>
                                    <option value="Youth Camp">Youth Camp</option>
                                    <option value="Food Drive">Food Drive</option>
                                </select>
                            </div>

                            <div className="don-form-group">
                                <label className="don-label">Notes</label>
                                <textarea className="don-input" name="notes" onChange={handleInputChange} placeholder="e.g. For Christmas feast" style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                            </div>
                        </div>
                        <div className="don-modal-footer">
                            <button className="btn-secondary" onClick={resetForm}>Cancel</button>
                            <button className="btn-primary" onClick={submitInKind}>Save In-Kind</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Donations;
