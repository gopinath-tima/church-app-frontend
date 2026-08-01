import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import './Documents.css';

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

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    
    // Modal state
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [formData, setFormData] = useState({
        category: 'Member Certificate',
        notes: '',
        uploadDate: new Date().toISOString().split('T')[0]
    });
    const [selectedFile, setSelectedFile] = useState(null);

    // Linked member autocomplete search state
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isSearchingMember, setIsSearchingMember] = useState(false);

    // Preview state
    const [previewDoc, setPreviewDoc] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt") ||
            localStorage.getItem("jwtToken") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    const fetchDocuments = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) return;
        try {
            const res = await axios.get('http://localhost:8081/api/documents', { headers });
            setDocuments(res.data || []);
        } catch (err) {
            console.error("Error fetching documents:", err);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const searchMembers = async (term) => {
        if (!term || term.length < 2) {
            setMemberSearchResults([]);
            return;
        }
        setIsSearchingMember(true);
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`http://localhost:8081/api/members/search?type=all&value=${term}`, { headers });
            setMemberSearchResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error searching members:", err);
        } finally {
            setIsSearchingMember(false);
        }
    };

    const handleMemberSelect = (member) => {
        setSelectedMember(member);
        setMemberSearchTerm('');
        setMemberSearchResults([]);
    };

    const resetForm = () => {
        setFormData({
            category: 'Member Certificate',
            notes: '',
            uploadDate: new Date().toISOString().split('T')[0]
        });
        setSelectedFile(null);
        setMemberSearchTerm('');
        setMemberSearchResults([]);
        setSelectedMember(null);
        setShowUploadModal(false);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        const headers = getAuthHeaders();
        if (!headers) return alert("Please log in.");
        if (!selectedFile) return alert("Please select a file to upload.");

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);
        uploadData.append('category', formData.category);
        uploadData.append('notes', formData.notes || '');
        uploadData.append('uploadDate', formData.uploadDate);
        if (selectedMember) {
            uploadData.append('memberId', selectedMember.memberId);
            uploadData.append('memberName', `${selectedMember.firstName} ${selectedMember.lastName}`);
        }

        try {
            await axios.post('http://localhost:8081/api/documents/upload', uploadData, {
                headers: {
                    ...headers,
                    'Content-Type': 'multipart/form-data'
                }
            });
            resetForm();
            fetchDocuments();
        } catch (err) {
            console.error("Error uploading document:", err);
            const errMsg = err.response?.data?.message || err.response?.data || err.message || "Unknown error";
            alert(`Upload failed: ${errMsg}. Please verify format and size.`);
        }
    };

    const handleOpenPreview = async (doc) => {
        setPreviewDoc(doc);
        setIsLoadingPreview(true);
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`http://localhost:8081/api/documents/${doc.id}/download`, {
                headers,
                responseType: 'blob'
            });
            const url = URL.createObjectURL(res.data);
            setPreviewUrl(url);
        } catch (err) {
            console.error("Error loading preview:", err);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleClosePreview = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewDoc(null);
        setPreviewUrl(null);
    };

    const handleDownload = async (doc) => {
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`http://localhost:8081/api/documents/${doc.id}/download`, {
                headers,
                responseType: 'blob'
            });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Error downloading file:", err);
            alert("Download failed.");
        }
    };

    const handleDelete = async (docId) => {
        if (!window.confirm("Are you sure you want to delete this document permanently?")) return;
        const headers = getAuthHeaders();
        try {
            await axios.delete(`http://localhost:8081/api/documents/${docId}`, { headers });
            if (previewDoc && previewDoc.id === docId) {
                handleClosePreview();
            }
            fetchDocuments();
        } catch (err) {
            console.error("Error deleting document:", err);
            alert("Delete failed.");
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    // Filter and search computation
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
            const term = searchTerm.toLowerCase();
            const matchesSearch = 
                (doc.fileName && doc.fileName.toLowerCase().includes(term)) ||
                (doc.notes && doc.notes.toLowerCase().includes(term)) ||
                (doc.memberName && doc.memberName.toLowerCase().includes(term));
            return matchesCat && matchesSearch;
        });
    }, [documents, selectedCategory, searchTerm]);

    // Dashboard totals
    const totals = useMemo(() => {
        let total = documents.length;
        let spiritual = 0;
        let financial = 0;

        documents.forEach(d => {
            if (['Member Certificate', 'Baptism Certificate', 'Marriage Certificate'].includes(d.category)) {
                spiritual++;
            } else if (['Financial Document', 'Vendor Bill'].includes(d.category)) {
                financial++;
            }
        });

        return { total, spiritual, financial };
    }, [documents]);

    const getFileIcon = (fileType) => {
        if (!fileType) return '📁';
        if (fileType.includes('pdf')) return '📕';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word') || fileType.includes('officedocument')) return '📘';
        if (fileType.includes('sheet') || fileType.includes('excel')) return '📗';
        return '📄';
    };

    return (
        <div className="docs-page">
            {/* Header Section */}
            <div className="docs-header">
                <div className="docs-header-left">
                    <h1>Document Storage</h1>
                    <p>Securely store, upload, preview, and link church records and financial bills.</p>
                </div>
                <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Upload Document
                </button>
            </div>

            {/* Dashboard Overview Cards */}
            <div className="docs-summary-grid">
                <div className="docs-card docs-card-all">
                    <div className="docs-card-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        Total Documents
                    </div>
                    <div className="docs-card-number">{totals.total}</div>
                    <div className="docs-card-sub">All active storage documents</div>
                </div>

                <div className="docs-card docs-card-spiritual">
                    <div className="docs-card-label" style={{ color: '#8b5cf6' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        Spiritual Certificates
                    </div>
                    <div className="docs-card-number">{totals.spiritual}</div>
                    <div className="docs-card-sub">Member, Baptism & Marriages</div>
                </div>

                <div className="docs-card docs-card-financial">
                    <div className="docs-card-label" style={{ color: '#10b981' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        Bills & Financials
                    </div>
                    <div className="docs-card-number">{totals.financial}</div>
                    <div className="docs-card-sub">Vendor bills & finance docs</div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="docs-content-container">
                {/* Search & Category Navigation */}
                <div className="docs-nav-bar">
                    <div className="docs-categories-pills">
                        {['All', 'Member Certificate', 'Baptism Certificate', 'Marriage Certificate', 'Financial Document', 'Vendor Bill'].map(cat => (
                            <button
                                key={cat}
                                className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat === 'All' ? 'All Files' : cat + 's'}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="docs-search-wrapper">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input 
                                type="text" 
                                placeholder="Search by name, member, or notes..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* View Mode Toggles */}
                        <div className="view-mode-toggle">
                            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Document Display Grid or Table */}
                {filteredDocs.length === 0 ? (
                    <div className="docs-empty-state">
                        <div className="empty-state-icon">📂</div>
                        <h2>No documents found</h2>
                        <p>Try searching for a different keyword or upload a new record to get started.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="docs-cards-grid">
                        {filteredDocs.map(doc => (
                            <div key={doc.id} className="file-card" onClick={() => handleOpenPreview(doc)}>
                                <div className="file-card-top">
                                    <div className="file-icon-large">{getFileIcon(doc.fileType)}</div>
                                    <div className="file-meta-cat">{doc.category}</div>
                                </div>
                                <div className="file-card-details">
                                    <h4 className="file-title" title={doc.fileName}>{doc.fileName}</h4>
                                    <div className="file-size-info">{formatBytes(doc.fileSize)} • {doc.uploadDate}</div>
                                    {doc.memberName && (
                                        <div className="file-linked-member">
                                            <span>👤 Link: {doc.memberName}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="docs-table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                        <table className="donations-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Linked Member</th>
                                    <th>Size</th>
                                    <th>Upload Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenPreview(doc)}>
                                        <td style={{ fontWeight: 600 }}>
                                            <span style={{ marginRight: '8px', fontSize: '1.1rem' }}>{getFileIcon(doc.fileType)}</span>
                                            {doc.fileName}
                                        </td>
                                        <td>{doc.category}</td>
                                        <td>{doc.memberName || '—'}</td>
                                        <td>{formatBytes(doc.fileSize)}</td>
                                        <td>{doc.uploadDate}</td>
                                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                <button className="btn-action btn-view" onClick={() => handleOpenPreview(doc)} title="View">
                                                    👁️
                                                </button>
                                                <button className="btn-action btn-down" onClick={() => handleDownload(doc)} title="Download">
                                                    📥
                                                </button>
                                                <button className="btn-action btn-del" onClick={() => handleDelete(doc.id)} title="Delete">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Document Upload Modal */}
            {showUploadModal && (
                <div className="don-modal-overlay">
                    <div className="don-modal">
                        <div className="don-modal-header">
                            <div>
                                <h2>Upload New Document</h2>
                                <p>Support file uploads up to 50MB (PDF, JPG, PNG, DOCX, XLSX)</p>
                            </div>
                            <button className="don-modal-close" onClick={resetForm}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="don-modal-body">
                                <div className="don-form-group">
                                    <label className="don-label">File to Upload</label>
                                    <input 
                                        type="file" 
                                        className="don-input" 
                                        onChange={handleFileChange} 
                                        required 
                                        style={{ background: '#f8fafc', padding: '12px' }}
                                    />
                                    {selectedFile && (
                                        <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Size: {formatBytes(selectedFile.size)}
                                        </span>
                                    )}
                                </div>

                                <div className="don-form-group">
                                    <label className="don-label">Category</label>
                                    <select className="don-input" name="category" value={formData.category} onChange={handleInputChange} required>
                                        <option value="Member Certificate">Member Certificate</option>
                                        <option value="Baptism Certificate">Baptism Certificate</option>
                                        <option value="Marriage Certificate">Marriage Certificate</option>
                                        <option value="Financial Document">Financial Document</option>
                                        <option value="Vendor Bill">Vendor Bill</option>
                                    </select>
                                </div>

                                <div className="don-form-group">
                                    <label className="don-label">Link to Church Member (Optional)</label>
                                    <div style={{ position: 'relative' }}>
                                        {selectedMember ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <AuthenticatedAvatar 
                                                        memberId={selectedMember.memberId}
                                                        firstName={selectedMember.firstName}
                                                        lastName={selectedMember.lastName}
                                                        photoUrl={selectedMember.photoUrl}
                                                        photoContentType={selectedMember.photoContentType}
                                                        getInitials={getInitials}
                                                        getAvatarColor={getAvatarColor}
                                                        size="28px"
                                                    />
                                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#064e3b' }}>
                                                        {selectedMember.firstName} {selectedMember.lastName}
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setSelectedMember(null)}
                                                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                                >Remove</button>
                                            </div>
                                        ) : (
                                            <>
                                                <div style={{ position: 'relative' }}>
                                                    <input 
                                                        type="text" 
                                                        className="don-input" 
                                                        style={{ width: '100%', paddingLeft: '32px' }}
                                                        placeholder="Search member by name..." 
                                                        value={memberSearchTerm}
                                                        onChange={(e) => {
                                                            setMemberSearchTerm(e.target.value);
                                                            searchMembers(e.target.value);
                                                        }}
                                                    />
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ position: 'absolute', left: '10px', top: '12px' }}>
                                                        <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                                    </svg>
                                                </div>
                                                {isSearchingMember && <div style={{ padding: '8px', fontSize: '12px', color: '#64748b' }}>Searching...</div>}
                                                {memberSearchResults.length > 0 && (
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '180px', overflowY: 'auto' }}>
                                                        {memberSearchResults.map(m => (
                                                            <div 
                                                                key={m.memberId} 
                                                                style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                                                onClick={() => handleMemberSelect(m)}
                                                            >
                                                                <AuthenticatedAvatar memberId={m.memberId} firstName={m.firstName} lastName={m.lastName} photoUrl={m.photoUrl} photoContentType={m.photoContentType} getInitials={getInitials} getAvatarColor={getAvatarColor} size="24px" />
                                                                <div>
                                                                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#0f172a' }}>{m.firstName} {m.lastName}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="don-form-group">
                                    <label className="don-label">Upload Date</label>
                                    <input type="date" className="don-input" name="uploadDate" value={formData.uploadDate} onChange={handleInputChange} required />
                                </div>

                                <div className="don-form-group">
                                    <label className="don-label">Notes & Remarks</label>
                                    <textarea className="don-input" name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Describe the document purpose..." style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                                </div>
                            </div>
                            <div className="don-modal-footer">
                                <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                <button type="submit" className="btn-primary">Save Document</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Document Details & Real-Time Review Modal */}
            {previewDoc && (
                <div className="don-modal-overlay">
                    <div className="don-modal" style={{ maxWidth: '800px', width: '90%', height: '85vh' }}>
                        <div className="don-modal-header" style={{ flexShrink: 0 }}>
                            <div>
                                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontSize: '1.4rem' }}>{getFileIcon(previewDoc.fileType)}</span>
                                    {previewDoc.fileName}
                                </h2>
                                <p>{previewDoc.category} • uploaded {previewDoc.uploadDate}</p>
                            </div>
                            <button className="don-modal-close" onClick={handleClosePreview}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="don-modal-body" style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'hidden' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '20px', flex: 1, height: '100%', overflowY: 'hidden' }}>
                                
                                {/* Document Real-Time Preview Container */}
                                <div className="doc-preview-viewport" style={{ background: '#f1f5f9', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', height: '100%', position: 'relative' }}>
                                    {isLoadingPreview ? (
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>Loading preview...</div>
                                    ) : previewUrl ? (
                                        previewDoc.fileType.includes('pdf') ? (
                                            <object data={previewUrl} type="application/pdf" width="100%" height="100%">
                                                <iframe src={previewUrl} width="100%" height="100%" style={{ border: 'none' }} title="pdf-previewer" />
                                            </object>
                                        ) : previewDoc.fileType.includes('image') ? (
                                            <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '24px' }}>
                                                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                                                <p style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Preview unavailable for {previewDoc.fileType}</p>
                                                <p style={{ fontSize: '12px', color: '#64748b' }}>Download the file to review it on your device.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div style={{ fontSize: '14px', color: '#ef4444' }}>Failed to load document preview.</div>
                                    )}
                                </div>

                                {/* Sidebar Details inside Preview Modal */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
                                    <div className="preview-meta-section">
                                        <label className="don-label">File Size</label>
                                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{formatBytes(previewDoc.fileSize)}</div>
                                    </div>

                                    {previewDoc.memberName && (
                                        <div className="preview-meta-section">
                                            <label className="don-label">Linked Member</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                                    {getInitials(previewDoc.memberName.split(' ')[0], previewDoc.memberName.split(' ')[1] || '')}
                                                </div>
                                                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{previewDoc.memberName}</span>
                                            </div>
                                        </div>
                                    )}

                                    {previewDoc.notes && (
                                        <div className="preview-meta-section">
                                            <label className="don-label">Notes</label>
                                            <p style={{ fontSize: '13px', color: '#475569', margin: 0, whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{previewDoc.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="don-modal-footer" style={{ flexShrink: 0, justifyContent: 'space-between', alignItems: 'center' }}>
                            <button className="btn-secondary" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleDelete(previewDoc.id)}>
                                Delete Document
                            </button>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button className="btn-secondary" onClick={handleClosePreview}>Close</button>
                                <button className="btn-primary" onClick={() => handleDownload(previewDoc)}>
                                    Download File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
