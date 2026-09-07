import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leases.css';

const Leases = () => {
    const [activeTab, setActiveTab] = useState('Agreements');
    const [leases, setLeases] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedLease, setSelectedLease] = useState(null);
    const [paymentLeaseId, setPaymentLeaseId] = useState('');
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        tenantName: '',
        propertyName: '',
        startDate: '',
        durationMonths: '',
        monthlyRent: '',
        status: 'Active'
    });

    const [paymentData, setPaymentData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Cash',
        notes: ''
    });

    const fetchLeases = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/leases', { headers });
            setLeases(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leases", error);
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', { headers });
            setTransactions(res.data.filter(t => t.type === 'Property Rent' && t.leaseId != null));
        } catch (error) {
            console.error("Error fetching transactions", error);
        }
    };

    useEffect(() => {
        fetchLeases();
        fetchTransactions();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        setPaymentData({ ...paymentData, [name]: value });
    };

    const saveLease = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            if (selectedLease && selectedLease.id) {
                await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/leases/${selectedLease.id}`, formData, { headers });
            } else {
                await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/leases', formData, { headers });
            }
            setShowModal(false);
            setSelectedLease(null);
            fetchLeases();
        } catch (error) {
            console.error("Error saving lease", error);
        }
    };

    const recordPayment = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            
            const targetLeaseId = selectedLease ? selectedLease.id : paymentLeaseId;
            const leaseForPayment = leases.find(l => l.id.toString() === targetLeaseId.toString());
            if (!leaseForPayment) {
                alert("Please select a lease.");
                return;
            }

            const payload = {
                date: paymentData.date,
                description: `Rent payment for ${leaseForPayment.propertyName} by ${leaseForPayment.tenantName}`,
                type: 'Property Rent',
                method: paymentData.method,
                amount: parseFloat(paymentData.amount),
                notes: paymentData.notes,
                leaseId: leaseForPayment.id
            };

            await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', payload, { headers });
            setShowPaymentModal(false);
            setPaymentData({
                amount: '',
                date: new Date().toISOString().split('T')[0],
                method: 'Cash',
                notes: ''
            });
            fetchTransactions();
        } catch (error) {
            console.error("Error saving payment", error);
        }
    };

    const openNewLeaseModal = () => {
        setFormData({
            tenantName: '',
            propertyName: '',
            startDate: '',
            durationMonths: '',
            monthlyRent: '',
            status: 'Active'
        });
        setSelectedLease(null);
        setShowModal(true);
    };

    const leaseTransactions = selectedLease 
        ? transactions.filter(t => t.leaseId === selectedLease.id) 
        : [];

    return (
        <div className="leases-container">
            <div className="leases-header">
                <div>
                    <h1>Property Leases</h1>
                    <p>Manage rental agreements and track rent payments</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-secondary" onClick={() => { setShowPaymentModal(true); setPaymentLeaseId(''); }}>
                        Record Rent
                    </button>
                    <button className="btn-primary" onClick={openNewLeaseModal}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Lease
                    </button>
                </div>
            </div>

            <div className="leases-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '0' }}>
                <button 
                    onClick={() => { setActiveTab('Agreements'); setSelectedLease(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', fontWeight: activeTab === 'Agreements' ? '600' : '500', color: activeTab === 'Agreements' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'Agreements' ? '3px solid #4f46e5' : '3px solid transparent', paddingBottom: '10px', transition: 'all 0.2s' }}
                >
                    Lease Agreements
                </button>
                <button 
                    onClick={() => { setActiveTab('Payments'); setSelectedLease(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.05rem', fontWeight: activeTab === 'Payments' ? '600' : '500', color: activeTab === 'Payments' ? '#4f46e5' : '#64748b', borderBottom: activeTab === 'Payments' ? '3px solid #4f46e5' : '3px solid transparent', paddingBottom: '10px', transition: 'all 0.2s' }}
                >
                    All Rent Payments
                </button>
            </div>

            {activeTab === 'Agreements' && selectedLease && !showModal && !showPaymentModal && (
                <div style={{ marginBottom: '24px' }}>
                    <button className="btn-secondary" onClick={() => setSelectedLease(null)} style={{ marginBottom: '16px' }}>
                        &larr; Back to Leases
                    </button>
                    
                    <div className="details-panel">
                        <div className="detail-item">
                            <label>Tenant Name</label>
                            <p>{selectedLease.tenantName}</p>
                        </div>
                        <div className="detail-item">
                            <label>Property</label>
                            <p>{selectedLease.propertyName}</p>
                        </div>
                        <div className="detail-item">
                            <label>Duration & Start Date</label>
                            <p>{selectedLease.durationMonths} Months (Started: {selectedLease.startDate})</p>
                        </div>
                        <div className="detail-item">
                            <label>Monthly Rent</label>
                            <p>₹{selectedLease.monthlyRent}</p>
                        </div>
                    </div>

                    <div className="payment-history-header">
                        <h3>Payment History</h3>
                        <button className="btn-primary" onClick={() => setShowPaymentModal(true)}>
                            Record Rent Payment
                        </button>
                    </div>
                    
                    <div className="leases-table-wrap">
                        <table className="leases-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Method</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaseTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No payments recorded yet.</td>
                                    </tr>
                                ) : (
                                    leaseTransactions.map(tx => (
                                        <tr key={tx.id}>
                                            <td>{tx.date}</td>
                                            <td>{tx.description}</td>
                                            <td>{tx.method}</td>
                                            <td style={{ fontWeight: '600', color: '#16a34a' }}>₹{tx.amount}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'Agreements' && !selectedLease && (
                <div className="leases-table-wrap">
                    <table className="leases-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Property</th>
                                <th>Start Date</th>
                                <th>Duration</th>
                                <th>Monthly Rent</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading leases...</td>
                                </tr>
                            ) : leases.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No leases found. Create a new lease to get started.</td>
                                </tr>
                            ) : (
                                leases.map(lease => (
                                    <tr key={lease.id} onClick={() => setSelectedLease(lease)}>
                                        <td style={{ fontWeight: '500' }}>{lease.tenantName}</td>
                                        <td>{lease.propertyName}</td>
                                        <td>{lease.startDate}</td>
                                        <td>{lease.durationMonths} Months</td>
                                        <td>₹{lease.monthlyRent}</td>
                                        <td>
                                            <span className={`status-badge status-${lease.status}`}>
                                                {lease.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'Payments' && (
                <div className="leases-table-wrap">
                    <table className="leases-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Method</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No rent payments recorded yet.</td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{tx.date}</td>
                                        <td>{tx.description}</td>
                                        <td>{tx.method}</td>
                                        <td style={{ fontWeight: '600', color: '#16a34a' }}>₹{tx.amount}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Lease Modal */}
            {showModal && (
                <div className="lease-modal-overlay">
                    <div className="lease-modal">
                        <div className="lease-modal-header">
                            <h2>{selectedLease ? 'Edit Lease' : 'Add New Lease'}</h2>
                            <button className="lease-modal-close" onClick={() => setShowModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="lease-modal-body">
                            <div className="form-group">
                                <label>Tenant Name</label>
                                <input type="text" name="tenantName" value={formData.tenantName} onChange={handleInputChange} placeholder="e.g. John Doe" />
                            </div>
                            <div className="form-group">
                                <label>Property Name / Purpose</label>
                                <input type="text" name="propertyName" value={formData.propertyName} onChange={handleInputChange} placeholder="e.g. Main Hall" />
                            </div>
                            <div className="form-group">
                                <label>Start Date</label>
                                <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label>Duration (Months)</label>
                                    <input type="number" name="durationMonths" value={formData.durationMonths} onChange={handleInputChange} placeholder="e.g. 12" />
                                </div>
                                <div className="form-group">
                                    <label>Monthly Rent (₹)</label>
                                    <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleInputChange} placeholder="Amount" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleInputChange}>
                                    <option value="Active">Active</option>
                                    <option value="Expired">Expired</option>
                                    <option value="Terminated">Terminated</option>
                                </select>
                            </div>
                        </div>
                        <div className="lease-modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={saveLease}>Save Lease</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="lease-modal-overlay">
                    <div className="lease-modal">
                        <div className="lease-modal-header">
                            <h2>Record Rent Payment</h2>
                            <button className="lease-modal-close" onClick={() => setShowPaymentModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="lease-modal-body">
                            {!selectedLease && (
                                <div className="form-group">
                                    <label>Select Lease</label>
                                    <select value={paymentLeaseId} onChange={(e) => setPaymentLeaseId(e.target.value)}>
                                        <option value="">-- Choose Lease --</option>
                                        {leases.map(l => (
                                            <option key={l.id} value={l.id}>{l.tenantName} - {l.propertyName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" name="amount" value={paymentData.amount} onChange={handlePaymentChange} placeholder="Enter rent amount" />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={paymentData.date} onChange={handlePaymentChange} />
                            </div>
                            <div className="form-group">
                                <label>Payment Method</label>
                                <select name="method" value={paymentData.method} onChange={handlePaymentChange}>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notes (Optional)</label>
                                <input type="text" name="notes" value={paymentData.notes} onChange={handlePaymentChange} placeholder="Any extra details..." />
                            </div>
                        </div>
                        <div className="lease-modal-footer">
                            <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={recordPayment}>Save Payment</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Leases;
