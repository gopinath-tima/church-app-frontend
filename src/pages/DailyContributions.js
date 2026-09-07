import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DailyContributions.css';

const DailyContributions = () => {
    // Default to today
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalCollection, setTotalCollection] = useState(0);

    const fetchTransactionsForDate = async (dateStr) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions/date?date=${dateStr}`, { headers });
            
            // Filter out expenses if we only want contributions/income.
            // The prompt says "contribution history" and "contributions", so let's only show income types.
            const incomeTransactions = res.data.filter(t => t.type !== 'Expense');
            
            setTransactions(incomeTransactions);
            
            const total = incomeTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
            setTotalCollection(total);
            
        } catch (error) {
            console.error("Error fetching daily transactions:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactionsForDate(selectedDate);
    }, [selectedDate]);

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    return (
        <div className="daily-contributions-container">
            <div className="daily-contributions-header">
                <div>
                    <h1>Daily Contributions</h1>
                    <p>Select a date to view all income collected on that day</p>
                </div>
                <div className="date-picker-wrap">
                    <label>Select Date:</label>
                    <input 
                        type="date" 
                        className="date-picker-input"
                        value={selectedDate} 
                        onChange={handleDateChange} 
                        max={new Date().toISOString().split('T')[0]} // Optional: Prevent future dates if needed
                    />
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="summary-card-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div className="summary-card-content">
                        <h3>Date</h3>
                        <p>{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                
                <div className="summary-card">
                    <div className="summary-card-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                    </div>
                    <div className="summary-card-content">
                        <h3>Total Collection</h3>
                        <p>₹{totalCollection.toFixed(2)}</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-card-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div className="summary-card-content">
                        <h3>Total Entries</h3>
                        <p>{transactions.length}</p>
                    </div>
                </div>
            </div>

            <div className="daily-table-wrap">
                <table className="daily-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Method</th>
                            <th>Notes</th>
                            <th style={{ textAlign: 'right' }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                                    <div style={{ color: '#64748b' }}>Loading contributions...</div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan="5">
                                    <div className="empty-state">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                        <p>No contributions found for this date.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.id || tx.transactionId}>
                                    <td>
                                        <span className={`type-badge type-${tx.type.replace(/\s+/g, '')}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: '500' }}>{tx.description}</td>
                                    <td>{tx.method || '-'}</td>
                                    <td style={{ color: '#64748b', fontSize: '0.9rem' }}>{tx.notes || '-'}</td>
                                    <td style={{ textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>
                                        ₹{tx.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DailyContributions;
