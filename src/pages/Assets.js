import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Assets.css';

const Assets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAssetId, setCurrentAssetId] = useState(null);
    const [customCategory, setCustomCategory] = useState('');

    // Detail Modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);

    // History Modal state
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [assetHistory, setAssetHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [, setSelectedHistoryAsset] = useState(null);

    const initialFormState = {
        name: '',
        category: 'Speakers',
        purchaseDate: '',
        purchasePrice: '',
        warrantyExpirationDate: '',
        nextMaintenanceDate: '',
        maintenanceFrequencyMonths: '',
        depreciationRate: '',
        status: 'Active',
        notes: ''
    };
    
    const [formData, setFormData] = useState(initialFormState);

    const categories = ['Chairs', 'Speakers', 'Musical Instruments', 'Cameras', 'Fans', 'Lights', 'Vehicles', 'Other'];

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || 
                      localStorage.getItem("jwt") || 
                      localStorage.getItem("authToken");
        if (!token) return null;
        return { Authorization: `Bearer ${token}` };
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const headers = getAuthHeaders();
            const res = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/assets', { headers: headers || {} });
            setAssets(res.data || []);
        } catch (err) {
            console.error("Error fetching assets:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData(initialFormState);
        setCustomCategory('');
        setShowModal(true);
    };

    const openEditModal = (asset, e) => {
        if (e) e.stopPropagation();
        setIsEditing(true);
        setCurrentAssetId(asset.assetId);
        
        let isPredefined = categories.includes(asset.category);
        
        setFormData({
            name: asset.name || '',
            category: isPredefined ? asset.category : 'Other',
            purchaseDate: asset.purchaseDate || '',
            purchasePrice: asset.purchasePrice || '',
            warrantyExpirationDate: asset.warrantyExpirationDate || '',
            nextMaintenanceDate: asset.nextMaintenanceDate || '',
            maintenanceFrequencyMonths: asset.maintenanceFrequencyMonths || '',
            depreciationRate: asset.depreciationRate || '',
            status: asset.status || 'Active',
            notes: asset.notes || ''
        });
        setCustomCategory(isPredefined ? '' : asset.category);
        setShowModal(true);
    };

    const openDetailModal = (asset) => {
        setSelectedAsset(asset);
        setShowDetailModal(true);
    };

    const openHistoryModal = async (asset, e) => {
        if (e) e.stopPropagation();
        setSelectedHistoryAsset(asset);
        setShowHistoryModal(true);
        setHistoryLoading(true);
        try {
            const headers = getAuthHeaders();
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/assets/${asset.assetId}/history`, { headers: headers || {} });
            setAssetHistory(res.data || []);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const headers = getAuthHeaders();
            
            // Format numeric values
            const payload = {
                ...formData,
                category: formData.category === 'Other' ? customCategory : formData.category,
                purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
                maintenanceFrequencyMonths: formData.maintenanceFrequencyMonths ? parseInt(formData.maintenanceFrequencyMonths) : null,
                depreciationRate: formData.depreciationRate ? parseFloat(formData.depreciationRate) : null,
            };

            if (isEditing) {
                await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/assets/${currentAssetId}`, payload, { headers: headers || {} });
            } else {
                await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/assets', payload, { headers: headers || {} });
            }
            setShowModal(false);
            fetchAssets();
        } catch (err) {
            console.error("Error saving asset:", err);
            alert("Failed to save asset.");
        }
    };

    const handleDelete = async (id, e) => {
        if (e) e.stopPropagation();
        if (!window.confirm("Are you sure you want to permanently delete this asset?")) return;
        try {
            const headers = getAuthHeaders();
            await axios.delete(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/assets/${id}`, { headers: headers || {} });
            fetchAssets();
        } catch (err) {
            console.error("Error deleting asset:", err);
            alert("Failed to delete asset.");
        }
    };

    const filteredAssets = filterCategory === 'All' 
        ? assets 
        : assets.filter(a => a.category === filterCategory);

    // Format currency
    const formatCurrency = (val) => {
        if (val === null || val === undefined) return '-';
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const AssetIcon = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
    );

    return (
        <div className="assets-container">
            <div className="assets-header-row">
                <div className="assets-header-info">
                    <h1>Asset Management</h1>
                    <p>Track inventory, maintenance, warranty, and depreciation</p>
                </div>
                <button className="btn-create-asset" onClick={openCreateModal}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Asset
                </button>
            </div>

            <div className="assets-filter-bar">
                <button className={`filter-chip ${filterCategory === 'All' ? 'active' : ''}`} onClick={() => setFilterCategory('All')}>All</button>
                {categories.map(cat => (
                    <button key={cat} className={`filter-chip ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="assets-loading-wrapper">
                    <div className="spinner"></div>
                    <p>Loading Inventory...</p>
                </div>
            ) : filteredAssets.length === 0 ? (
                <div className="assets-empty-state">
                    <AssetIcon />
                    <h2>No Assets Found</h2>
                    <p>{filterCategory === 'All' ? 'Your inventory is currently empty.' : `No assets found in category: ${filterCategory}`}</p>
                    <button onClick={openCreateModal}>Add First Asset</button>
                </div>
            ) : (
                <div className="assets-grid">
                    {filteredAssets.map(asset => {
                        const isWarrantyValid = asset.warrantyExpirationDate && new Date(asset.warrantyExpirationDate) >= new Date();
                        const needsMaintenance = asset.nextMaintenanceDate && new Date(asset.nextMaintenanceDate) <= new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // within 7 days
                        
                        return (
                            <div key={asset.assetId} className="asset-premium-card clickable-card" onClick={() => openDetailModal(asset)}>
                                <div className="asset-card-header">
                                    <div className="asset-icon-wrap">
                                        <AssetIcon />
                                    </div>
                                    <div className="asset-title-wrap">
                                        <h3>{asset.name}</h3>
                                        <span className="asset-category">{asset.category}</span>
                                    </div>
                                    <div className="asset-status-badge" data-status={asset.status}>
                                        {asset.status}
                                    </div>
                                </div>
                                
                                <div className="asset-card-body">
                                    <div className="asset-detail-row">
                                        <span className="detail-label">Purchased</span>
                                        <span className="detail-value">{asset.purchaseDate || '-'}</span>
                                    </div>
                                    <div className="asset-detail-row">
                                        <span className="detail-label">Purchase Price</span>
                                        <span className="detail-value">{formatCurrency(asset.purchasePrice)}</span>
                                    </div>
                                    <div className="asset-detail-row highlight-value">
                                        <span className="detail-label">Current Value</span>
                                        <span className="detail-value">{formatCurrency(asset.currentValue)}</span>
                                    </div>
                                </div>
                                
                                <div className="asset-card-footer" onClick={(e) => e.stopPropagation()}>
                                    <div className="asset-badges">
                                        {asset.warrantyExpirationDate && (
                                            <span className={`status-icon ${isWarrantyValid ? 'valid' : 'expired'}`} title={`Warranty: ${asset.warrantyExpirationDate}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                                {isWarrantyValid ? 'Under Warranty' : 'Expired'}
                                            </span>
                                        )}
                                        {asset.nextMaintenanceDate && (
                                            <span className={`status-icon ${needsMaintenance ? 'warning' : 'info'}`} title={`Next Maintenance: ${asset.nextMaintenanceDate}`}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>
                                                {needsMaintenance ? 'Maintenance Due' : 'Maintained'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="asset-actions">
                                        <button className="icon-btn history" onClick={(e) => openHistoryModal(asset, e)} title="View History">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            History
                                        </button>
                                        <button className="icon-btn edit" onClick={(e) => openEditModal(asset, e)} title="Edit Asset">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button className="icon-btn delete" onClick={(e) => handleDelete(asset.assetId, e)} title="Delete Asset">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Asset Detail Modal */}
            {showDetailModal && selectedAsset && (
                <div className="asset-modal-overlay">
                    <div className="asset-modal detail-modal">
                        <div className="asset-modal-header">
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div className="asset-icon-wrap" style={{margin: 0}}><AssetIcon /></div>
                                <div>
                                    <h2 style={{fontSize: '22px', marginBottom: '2px'}}>{selectedAsset.name}</h2>
                                    <span className="asset-category">{selectedAsset.category}</span>
                                </div>
                            </div>
                            <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                                <div className="asset-status-badge" data-status={selectedAsset.status}>{selectedAsset.status}</div>
                                <button className="asset-close-btn" onClick={() => setShowDetailModal(false)}>&times;</button>
                            </div>
                        </div>
                        
                        <div className="asset-detail-content">
                            <div className="detail-section">
                                <h4 className="detail-section-title">Financial Details</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Purchase Date</span>
                                        <span className="detail-value">{selectedAsset.purchaseDate || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Purchase Price</span>
                                        <span className="detail-value">{formatCurrency(selectedAsset.purchasePrice)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Depreciation Rate</span>
                                        <span className="detail-value">{selectedAsset.depreciationRate ? `${selectedAsset.depreciationRate}% / yr` : '-'}</span>
                                    </div>
                                    <div className="detail-item highlight">
                                        <span className="detail-label">Current Value</span>
                                        <span className="detail-value">{formatCurrency(selectedAsset.currentValue)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="detail-section-title">Warranty & Maintenance</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Warranty Expiration</span>
                                        <span className="detail-value">{selectedAsset.warrantyExpirationDate || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Next Maintenance</span>
                                        <span className="detail-value">{selectedAsset.nextMaintenanceDate || '-'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Maintenance Frequency</span>
                                        <span className="detail-value">{selectedAsset.maintenanceFrequencyMonths ? `Every ${selectedAsset.maintenanceFrequencyMonths} months` : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedAsset.notes && (
                                <div className="detail-section">
                                    <h4 className="detail-section-title">Notes & Details</h4>
                                    <div className="detail-notes-box">
                                        {selectedAsset.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="asset-modal-footer">
                            <button type="button" className="asset-btn-secondary" onClick={(e) => {setShowDetailModal(false); openHistoryModal(selectedAsset, e);}}>View History</button>
                            <button type="button" className="asset-btn-primary" onClick={(e) => {setShowDetailModal(false); openEditModal(selectedAsset, e);}}>Edit Asset</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Asset Create/Edit Modal */}
            {showModal && (
                <div className="asset-modal-overlay">
                    <div className="asset-modal">
                        <div className="asset-modal-header">
                            <h2>{isEditing ? 'Edit Asset' : 'Register New Asset'}</h2>
                            <button className="asset-close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="asset-form">
                            <div className="asset-form-grid compact-grid">
                                {/* Basic Info */}
                                <div className="form-section-title">Basic Information</div>
                                
                                <div className="asset-form-group span-3">
                                    <label>Asset Name *</label>
                                    <input required type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. Yamaha TF5 Digital Mixer" />
                                </div>
                                
                                <div className="asset-form-group span-2">
                                    <label>Category *</label>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <select required name="category" value={formData.category} onChange={handleInputChange} style={{flex: 1}}>
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        {formData.category === 'Other' && (
                                            <input 
                                                type="text" 
                                                placeholder="Specify..." 
                                                value={customCategory} 
                                                onChange={(e) => setCustomCategory(e.target.value)} 
                                                required 
                                                style={{flex: 1}}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="asset-form-group">
                                    <label>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange}>
                                        <option value="Active">Active</option>
                                        <option value="In Maintenance">In Maintenance</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                </div>

                                {/* Financials & Warranty side-by-side */}
                                <div className="form-section-title" style={{ marginTop: '4px' }}>Tracking & Financials</div>
                                
                                <div className="asset-form-group">
                                    <label>Purchase Date</label>
                                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleInputChange} />
                                </div>
                                
                                <div className="asset-form-group">
                                    <label>Purchase Price (₹)</label>
                                    <input type="number" step="0.01" min="0" name="purchasePrice" value={formData.purchasePrice} onChange={handleInputChange} placeholder="0.00" />
                                </div>

                                <div className="asset-form-group">
                                    <label>Depreciation (%/yr)</label>
                                    <input type="number" step="0.1" min="0" max="100" name="depreciationRate" value={formData.depreciationRate} onChange={handleInputChange} placeholder="e.g. 10" />
                                </div>
                                
                                <div className="asset-form-group">
                                    <label>Warranty Exp</label>
                                    <input type="date" name="warrantyExpirationDate" value={formData.warrantyExpirationDate} onChange={handleInputChange} />
                                </div>
                                
                                <div className="asset-form-group">
                                    <label>Next Maintenance</label>
                                    <input type="date" name="nextMaintenanceDate" value={formData.nextMaintenanceDate} onChange={handleInputChange} />
                                </div>

                                <div className="asset-form-group">
                                    <label>Maint. Freq (Mo.)</label>
                                    <input type="number" min="1" name="maintenanceFrequencyMonths" value={formData.maintenanceFrequencyMonths} onChange={handleInputChange} placeholder="e.g. 6" />
                                </div>

                                <div className="asset-form-group span-3">
                                    <label>Notes & Details</label>
                                    <textarea name="notes" rows="2" value={formData.notes} onChange={handleInputChange} placeholder="Serial numbers, location, conditions..."></textarea>
                                </div>
                            </div>
                            
                            <div className="asset-modal-footer">
                                <button type="button" className="asset-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="asset-btn-primary">{isEditing ? 'Save Changes' : 'Register Asset'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && (
                <div className="asset-modal-overlay">
                    <div className="asset-modal">
                        <div className="asset-modal-header">
                            <h2>Asset History Timeline</h2>
                            <button className="asset-close-btn" onClick={() => setShowHistoryModal(false)}>&times;</button>
                        </div>
                        <div className="history-timeline">
                            {historyLoading ? (
                                <div className="spinner" style={{ margin: '40px auto' }}></div>
                            ) : assetHistory.length === 0 ? (
                                <div className="history-timeline-empty">
                                    No history recorded for this asset.
                                </div>
                            ) : (
                                assetHistory.map(record => {
                                    let actionIcon = <polyline points="20 6 9 17 4 12"></polyline>; // Check
                                    let iconClass = "timeline-icon created";
                                    
                                    if (record.action === "Updated") {
                                        actionIcon = <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>;
                                        iconClass = "timeline-icon updated";
                                    } else if (record.action === "Status Changed") {
                                        actionIcon = <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>;
                                        iconClass = "timeline-icon updated";
                                    }

                                    return (
                                        <div key={record.historyId} className="timeline-item">
                                            <div className={iconClass}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    {actionIcon}
                                                </svg>
                                            </div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <span className="timeline-action">{record.action}</span>
                                                    <span className="timeline-date">{formatDate(record.actionDate)}</span>
                                                </div>
                                                <p className="timeline-desc">{record.description}</p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assets;
