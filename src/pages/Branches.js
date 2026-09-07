import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Branches.css';

const API_BASE_URL = 'https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api';

const Branches = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        branchCode: '',
        churchName: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        contactNumber: '',
        email: '',
        headPastorName: '',
        establishedDate: '',
        status: 'Active'
    });

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token");
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchBranches = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_BASE_URL}/branches`, getAuthHeaders());
            setBranches(response.data);
            setError(null);
        } catch (err) {
            console.error("Error fetching branches:", err);
            setError("Failed to load branches. Please check your connection.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    const handleOpenModal = (branch = null) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name || '',
                branchCode: branch.branchCode || '',
                churchName: branch.churchName || '',
                address: branch.address || '',
                city: branch.city || '',
                state: branch.state || '',
                country: branch.country || '',
                postalCode: branch.postalCode || '',
                contactNumber: branch.contactNumber || '',
                email: branch.email || '',
                headPastorName: branch.headPastorName || '',
                establishedDate: branch.establishedDate || '',
                status: branch.status || 'Active'
            });
        } else {
            setEditingBranch(null);
            setFormData({
                name: '',
                branchCode: '',
                churchName: '',
                address: '',
                city: '',
                state: '',
                country: '',
                postalCode: '',
                contactNumber: '',
                email: '',
                headPastorName: '',
                establishedDate: '',
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBranch(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        try {
            setIsSubmitting(true);
            if (editingBranch) {
                await axios.put(`${API_BASE_URL}/branches/${editingBranch.id}`, formData, getAuthHeaders());
            } else {
                await axios.post(`${API_BASE_URL}/branches`, formData, getAuthHeaders());
            }
            await fetchBranches();
            handleCloseModal();
        } catch (err) {
            console.error("Error saving branch:", err);
            alert("Failed to save branch. Ensure the branch name is unique.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredBranches = branches.filter(b => 
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        b.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.headPastorName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="branch-container">
            <div className="branch-header">
                <div className="branch-header-left">
                    <h1>Branch Management</h1>
                    <p>Manage church branches, locations, and pastors.</p>
                </div>
                <div className="branch-header-actions">
                    <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add New Branch
                    </button>
                </div>
            </div>

            {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontWeight: '500', fontSize: '0.9rem' }}>
                    {error}
                </div>
            )}

            <div className="branch-table-card">
                <div className="branch-table-top">
                    <div className="branch-search">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input 
                            type="text" 
                            placeholder="Search branches..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="branch-table-wrap">
                    <table className="branch-table">
                        <thead>
                            <tr>
                                <th>Branch Name</th>
                                <th>Head Pastor</th>
                                <th>Location</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading branches...</td></tr>
                            ) : filteredBranches.length === 0 ? (
                                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No branches found.</td></tr>
                            ) : (
                                filteredBranches.map(branch => (
                                    <tr key={branch.id}>
                                        <td>
                                            <div className="branch-name">
                                                <div className="branch-icon">
                                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                                </div>
                                                {branch.name}
                                            </div>
                                        </td>
                                        <td>{branch.headPastorName || '-'}</td>
                                        <td>{branch.address || '-'}</td>
                                        <td>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {branch.contactNumber && <span style={{ fontSize: '0.85rem' }}>{branch.contactNumber}</span>}
                                                {branch.email && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{branch.email}</span>}
                                                {!branch.contactNumber && !branch.email && '-'}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${branch.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                                                {branch.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button className="action-btn" onClick={() => handleOpenModal(branch)} title="Edit Branch">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="branch-modal-overlay">
                    <div className="branch-modal">
                        <div className="branch-modal-header">
                            <h2>{editingBranch ? 'Edit Branch' : 'Add New Branch'}</h2>
                            <button className="branch-modal-close" onClick={handleCloseModal}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="branch-modal-body">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Branch Name *</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Main Campus"
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Branch Code (Unique) *</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="branchCode"
                                            value={formData.branchCode}
                                            onChange={handleInputChange}
                                            placeholder="e.g. MAIN-01"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Church Name</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="churchName"
                                            value={formData.churchName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Grace Community Church"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Head Pastor / Leader</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="headPastorName"
                                            value={formData.headPastorName}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Pastor John Doe"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Contact Number</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            placeholder="+1 234 567 890"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input 
                                            type="email" 
                                            className="form-input" 
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="branch@church.com"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Location / Address</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Street Address"
                                    />
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            placeholder="e.g. New York"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State / Province</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="state"
                                            value={formData.state}
                                            onChange={handleInputChange}
                                            placeholder="e.g. NY"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="country"
                                            value={formData.country}
                                            onChange={handleInputChange}
                                            placeholder="e.g. USA"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Postal Code</label>
                                        <input 
                                            type="text" 
                                            className="form-input" 
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 10001"
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Established Date</label>
                                        <input 
                                            type="date" 
                                            className="form-input" 
                                            name="establishedDate"
                                            value={formData.establishedDate}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select 
                                            className="form-input form-select"
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="branch-modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Saving...' : 'Save Branch'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Branches;
