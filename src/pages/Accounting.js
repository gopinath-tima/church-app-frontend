import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import './Accounting.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const Accounting = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'transactions';
    
    const [activeTab, setActiveTab] = useState(tabParam);
    const [showIncomeModal, setShowIncomeModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    // Sync state with URL
    useEffect(() => {
        if (tabParam !== activeTab) {
            setActiveTab(tabParam);
        }
    }, [tabParam, activeTab]);

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
        setActiveTab(tab);
    };

    // Data State
    const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
    const [transactions, setTransactions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [dateFilter, setDateFilter] = useState('All Time');
    const [methodFilter, setMethodFilter] = useState('All Methods');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Form States
    const [incomeType, setIncomeType] = useState('Subscription');
    const [formData, setFormData] = useState({});
    const [viewingTransaction, setViewingTransaction] = useState(null);
    
    // Dashboard Filter State
    const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());

    const incomeSubtypes = useMemo(() => ['Subscription', 'Offering', 'Sponsorship', 'Property Rent'], []);

    // Member Search State
    const [memberSearchTerm, setMemberSearchTerm] = useState('');
    const [memberSearchResults, setMemberSearchResults] = useState([]);
    // User Role Detection for SUPER_PLUS_ADMIN
    const tokenForDecode = localStorage.getItem("token") || localStorage.getItem("jwt");
    let isSuperPlusAdmin = false;
    if (tokenForDecode) {
        try {
            const decoded = jwtDecode(tokenForDecode);
            const roles = decoded.roles || [];
            isSuperPlusAdmin = roles.includes("SUPER_PLUS_ADMIN");
        } catch (err) {
            console.error("Invalid token decoding in Accounting");
        }
    }

    const [selectedMember, setSelectedMember] = useState(null);
    const [isNonMember, setIsNonMember] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    // Contribution History Specific State
    const [histSearchTerm, setHistSearchTerm] = useState('');
    const [histResults, setHistResults] = useState([]);
    const [histMember, setHistMember] = useState(null);
    const [histData, setHistData] = useState({ transactions: [] });
    const [histLoading, setHistLoading] = useState(false);
    
    // Subscription Management State
    const [subFrequency, setSubFrequency] = useState('Monthly'); // 'Weekly', 'Monthly', 'Yearly'
    const [subYear, setSubYear] = useState(new Date().getFullYear());
    const [subMonth, setSubMonth] = useState(new Date().getMonth() + 1);
    const [subWeek, setSubWeek] = useState(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    });
    const [subSearch, setSubSearch] = useState('');
    const [subStatusFilter, setSubStatusFilter] = useState('All'); // 'All', 'Paid', 'Pending'
    const [allMembers, setAllMembers] = useState([]);
    const [subLoading, setSubLoading] = useState(false);

    // Multi-period subscription picker state
    const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    const [subPayFrequency, setSubPayFrequency] = useState('Monthly'); // 'Weekly', 'Monthly', 'Yearly'
    const [subCheckedMonths, setSubCheckedMonths] = useState(new Set());
    const [subCheckedWeeks, setSubCheckedWeeks] = useState(new Set());
    const [subCheckedYears, setSubCheckedYears] = useState(new Set());
    const [subPayYear, setSubPayYear] = useState(new Date().getFullYear());

    const toggleSubMonth = (monthNum) => {
        setSubCheckedMonths(prev => {
            const next = new Set(prev);
            if (next.has(monthNum)) next.delete(monthNum);
            else next.add(monthNum);
            return next;
        });
    };

    const toggleSubWeek = (weekNum) => {
        setSubCheckedWeeks(prev => {
            const next = new Set(prev);
            if (next.has(weekNum)) next.delete(weekNum);
            else next.add(weekNum);
            return next;
        });
    };

    const toggleSubYear = (yearNum) => {
        setSubCheckedYears(prev => {
            const next = new Set(prev);
            if (next.has(yearNum)) next.delete(yearNum);
            else next.add(yearNum);
            return next;
        });
    };

    // Selected periods for submission
    const subSelectedMonths = Array.from(subCheckedMonths).sort((a,b)=>a-b).map(m => ({ month: m, year: subPayYear }));
    const subSelectedWeeks = Array.from(subCheckedWeeks).sort((a,b)=>a-b).map(w => ({ week: w, year: subPayYear }));
    const subSelectedYears = Array.from(subCheckedYears).sort((a,b)=>a-b).map(y => ({ year: y }));

    const fetchAllMembers = useCallback(async () => {
        setSubLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAllMembers(res.data || []);
        } catch (e) {
            console.error("Error fetching members:", e);
        } finally {
            setSubLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'subscriptions' && allMembers.length === 0) {
            fetchAllMembers();
        }
    }, [activeTab, allMembers.length, fetchAllMembers]);

    const subscriptionData = useMemo(() => {
        if (activeTab !== 'subscriptions') return [];
        
        return allMembers
            .filter(member => {
                // If SUPER_PLUS_ADMIN, show all members. Otherwise, filter out unapproved ones.
                if (isSuperPlusAdmin) return true;
                return member.subscriptionApproved !== false;
            })
            .map(member => {
                const payment = transactions.find(t => {
                    if (t.type !== 'Subscription' || String(t.memberId) !== String(member.memberId)) {
                        return false;
                    }
                    
                    if (subFrequency === 'Weekly') {
                        return t.subscriptionFrequency === 'Weekly' &&
                            parseInt(t.forWeek) === parseInt(subWeek) &&
                            parseInt(t.forYear) === parseInt(subYear);
                    } else if (subFrequency === 'Yearly') {
                        return t.subscriptionFrequency === 'Yearly' &&
                            parseInt(t.forYear) === parseInt(subYear);
                    } else {
                        // Monthly (default & backward-compatible with legacy transactions where subscriptionFrequency is null)
                        return (t.subscriptionFrequency === 'Monthly' || !t.subscriptionFrequency) &&
                            parseInt(t.forMonth) === parseInt(subMonth) &&
                            parseInt(t.forYear) === parseInt(subYear);
                    }
                });
                
                return {
                    ...member,
                    isPaid: !!payment,
                    paymentDetails: payment
                };
            }).filter(m => {
                const memberIdStr = m.customMemberId || String(m.memberId || '');
                const matchesSearch = subSearch === '' || 
                    `${m.firstName} ${m.lastName}`.toLowerCase().includes(subSearch.toLowerCase()) ||
                    memberIdStr.toLowerCase().includes(subSearch.toLowerCase());
                
                const matchesStatus = subStatusFilter === 'All' || 
                    (subStatusFilter === 'Paid' && m.isPaid) || 
                    (subStatusFilter === 'Pending' && !m.isPaid);
                    
                return matchesSearch && matchesStatus;
            });
    }, [allMembers, transactions, subMonth, subYear, subWeek, subFrequency, subSearch, subStatusFilter, activeTab, isSuperPlusAdmin]);

    const fetchMemberHistory = async (id) => {
        setHistLoading(true);
        const headers = getAuthHeaders();
        try {
            const trxRes = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions/member/${id}`, { headers });
            setHistData({
                transactions: Array.isArray(trxRes.data) ? trxRes.data : []
            });
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setHistLoading(false);
        }
    };

    const searchHistMembers = async (term) => {
        if (!term || term.length < 2) {
            setHistResults([]);
            return;
        }
        const headers = getAuthHeaders();
        try {
            const res = await axios.get(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/search?type=all&value=${term}`, { headers });
            setHistResults(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Error searching members:", err);
        }
    };

    const handleHistMemberSelect = (member) => {
        setHistMember(member);
        setHistSearchTerm('');
        setHistResults([]);
        fetchMemberHistory(member.memberId);
    };

    const searchMembers = async (term) => {
        if (!term || term.length < 2) {
            setMemberSearchResults([]);
            return;
        }
        setIsSearching(true);
        const headers = getAuthHeaders();
        try {
            // Search by name, phone or ID
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

    const resetSearch = useCallback(() => {
        setMemberSearchTerm('');
        setMemberSearchResults([]);
        setSelectedMember(null);
        setIsNonMember(false);
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem("token") || localStorage.getItem("jwt") ||
            localStorage.getItem("jwtToken") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
        return token ? { Authorization: `Bearer ${token}` } : null;
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const fetchData = useCallback(async () => {
        const headers = getAuthHeaders();
        if (!headers) { alert("Please log in to view accounting data."); return; }
        try {
            const sumRes = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/summary', { headers });
            setSummary(sumRes.data);

            const trxRes = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', { headers });

            const allTransactions = (trxRes.data || []).sort((a, b) => {
                if (!a.date || !b.date) return 0;
                return new Date(b.date) - new Date(a.date);
            });

            setTransactions(allTransactions);
            setCurrentPage(1);
        } catch (error) {
            console.error("Error fetching accounting data", error);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtering Logic
    const filteredTransactions = transactions.filter(trx => {
        // 1. Search Filter (Description, ID, Type)
        const matchesSearch = !searchTerm || 
            (trx.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (trx.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (trx.type?.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. Type Filter
        const incomeSubtypes = ['Subscription', 'Offering', 'Sponsorship', 'Property Rent'];
        let matchesType = false;
        
        if (typeFilter === 'All Types') {
            matchesType = true;
        } else if (typeFilter === 'Income') {
            matchesType = incomeSubtypes.includes(trx.type);
        } else {
            matchesType = trx.type === typeFilter;
        }

        // 4. Method Filter
        const matchesMethod = methodFilter === 'All Methods' || trx.method === methodFilter;

        if (!matchesSearch || !matchesType || !matchesMethod) return false;

        if (dateFilter === 'All Time') return true;
        
        if (!trx.date) return false;
        const trxDate = new Date(trx.date);
        const now = new Date();
        
        if (dateFilter === 'This Month') {
            return trxDate.getMonth() === now.getMonth() && trxDate.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'Last Month') {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            return trxDate.getMonth() === lastMonth.getMonth() && trxDate.getFullYear() === lastMonth.getFullYear();
        }
        if (dateFilter === 'This Year') {
            return trxDate.getFullYear() === now.getFullYear();
        }

        if (dateFilter === 'Custom Range') {
            if (!startDate && !endDate) return true;
            const trxTime = new Date(trx.date).getTime();
            
            if (startDate) {
                const startTime = new Date(startDate).getTime();
                if (trxTime < startTime) return false;
            }
            if (endDate) {
                const endTime = new Date(endDate).getTime();
                // Set to end of day
                const endOfDate = new Date(endTime);
                endOfDate.setHours(23, 59, 59, 999);
                if (trxTime > endOfDate.getTime()) return false;
            }
            return true;
        }

        return true;
    });

    useEffect(() => {
        resetSearch();
        setFormData(prev => ({ ...prev, memberId: null, donorName: '' }));
    }, [incomeType, resetSearch]);

    // Dashboard Data Aggregation
    const chartData = useMemo(() => {
        const months = [];
        for (let i = 0; i < 12; i++) {
            const d = new Date(dashboardYear, i, 1);
            months.push({
                name: d.toLocaleString('default', { month: 'short' }),
                income: 0,
                expense: 0,
                month: i
            });
        }

        transactions.forEach(trx => {
            if (!trx.date) return;
            const d = new Date(trx.date);
            if (d.getFullYear() !== dashboardYear) return;
            
            const mIdx = d.getMonth();
            if (incomeSubtypes.includes(trx.type) && trx.type !== 'Donation') {
                months[mIdx].income += trx.amount || 0;
            } else if (trx.type === 'Expense') {
                months[mIdx].expense += Math.abs(trx.amount || 0);
            }
        });
        return months;
    }, [transactions, dashboardYear, incomeSubtypes]);

    const categoryData = useMemo(() => {
        const categories = {};
        transactions.forEach(trx => {
            if (!trx.date || new Date(trx.date).getFullYear() !== dashboardYear) return;
            if (incomeSubtypes.includes(trx.type) && trx.type !== 'Donation') {
                categories[trx.type] = (categories[trx.type] || 0) + (trx.amount || 0);
            }
        });
        return Object.entries(categories).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [transactions, dashboardYear, incomeSubtypes]);

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

    const submitIncome = async () => {
        const headers = getAuthHeaders();
        if (!headers) return alert("Please log in.");

        // Multi-period subscription handling
        if (incomeType === 'Subscription') {
            const totalAmt = Number(formData.amount) || 0;
            if (totalAmt <= 0) return alert("Please enter a valid total amount.");

            let periodsToSave = [];
            let frequency = subPayFrequency;

            if (frequency === 'Weekly') {
                if (subSelectedWeeks.length === 0) return alert("Please select at least one week.");
                periodsToSave = subSelectedWeeks;
            } else if (frequency === 'Yearly') {
                if (subSelectedYears.length === 0) return alert("Please select at least one year.");
                periodsToSave = subSelectedYears;
            } else {
                if (subSelectedMonths.length === 0) return alert("Please select at least one month.");
                periodsToSave = subSelectedMonths;
            }

            const n = periodsToSave.length;
            const perPeriod = parseFloat((totalAmt / n).toFixed(2));
            try {
                await Promise.all(periodsToSave.map((p, idx) => {
                    const isLast = idx === n - 1;
                    const amt = isLast ? parseFloat((totalAmt - perPeriod * (n - 1)).toFixed(2)) : perPeriod;
                    // Ensure date is YYYY-MM-DD
                    let formattedDate = formData.date;
                    if (formattedDate && formattedDate.includes('-')) {
                        const parts = formattedDate.split('-');
                        if (parts[0].length !== 4) { // It's likely DD-MM-YYYY
                            formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                        }
                    }

                    let descriptionStr = `Subscription Payment`;
                    if (frequency === 'Weekly') {
                        descriptionStr += ` (Week ${p.week} ${p.year})`;
                    } else if (frequency === 'Yearly') {
                        descriptionStr += ` (${p.year})`;
                    } else {
                        descriptionStr += ` (${MONTH_NAMES[parseInt(p.month) - 1]} ${p.year})`;
                    }

                    const payload = {
                        type: 'Subscription',
                        status: 'Completed',
                        amount: amt,
                        memberId: formData.memberId ? Number(formData.memberId) : null,
                        donorName: formData.donorName || null,
                        description: formData.description || descriptionStr,
                        date: formattedDate || new Date().toISOString().split('T')[0],
                        method: formData.method || null,
                        subscriptionFrequency: frequency,
                        forWeek: frequency === 'Weekly' ? parseInt(p.week) : null,
                        forMonth: frequency === 'Monthly' ? parseInt(p.month) : null,
                        forYear: parseInt(p.year),
                        notes: formData.notes || null
                    };
                    console.log('Posting subscription payload:', payload);
                    return axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', payload, { headers });
                }));
                setShowIncomeModal(false);
                setFormData({});
                setSubCheckedMonths(new Set());
                setSubCheckedWeeks(new Set());
                setSubCheckedYears(new Set());
                resetSearch();
                fetchData();
            } catch (e) {
                console.error('Subscription save error:', e);
                const msg = e?.response?.data?.message || e?.response?.data || e?.message || 'Unknown error';
                alert(`Failed to save subscription: ${msg}`);
            }
            return;
        }

        // Single-entry (non-subscription or subscription with no multi-month)
        const payload = { ...formData, type: incomeType, status: 'Completed' };
        if (payload.amount) payload.amount = Number(payload.amount);
        try {
            await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', payload, { headers });
            setShowIncomeModal(false);
            setFormData({});
            setSubCheckedMonths(new Set());
            setSubCheckedWeeks(new Set());
            setSubCheckedYears(new Set());
            resetSearch();
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to save entry. Make sure the backend server is running.");
        }
    };

    const submitExpense = async () => {
        const headers = getAuthHeaders();
        if (!headers) return alert("Please log in.");
        const payload = { ...formData, type: 'Expense', status: 'Completed' };
        if (payload.amount) payload.amount = Number(payload.amount);
        try {
            await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/accounting/transactions', payload, { headers });
            setShowExpenseModal(false);
            setFormData({});
            fetchData();
        } catch (e) {
            console.error(e);
            alert("Failed to save entry. Make sure the backend server is running.");
        }
    };


    // Calculate Cash vs Online breakdown
    const breakdown = useMemo(() => {
        let incCash = 0, incOnline = 0;
        let expCash = 0, expOnline = 0;
        
        transactions.forEach(trx => {
            if (trx.type === 'Donation') return;
            
            const amt = trx.amount || 0;
            const isCash = trx.method === 'Cash';

            if (trx.type === 'Expense') {
                if (isCash) expCash += amt;
                else expOnline += amt;
            } else {
                if (isCash) incCash += amt;
                else incOnline += amt;
            }
        });

        return {
            income: { cash: incCash, online: incOnline },
            expense: { cash: expCash, online: expOnline },
            net: { cash: incCash - expCash, online: incOnline - expOnline }
        };
    }, [transactions]);

    return (
        <div className="acc-page">
            {/* Header */}
            <div className="acc-header">
                <div className="acc-header-left">
                    <h1>Accounting & Finance</h1>
                    <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                        <button 
                            style={{ background: 'none', border: 'none', padding: '0 0 6px', cursor: 'pointer', fontSize: '0.95rem', fontStyle: 'normal', fontFamily: 'inherit', fontWeight: activeTab === 'transactions' ? '700' : '500', color: activeTab === 'transactions' ? '#1e3a5f' : '#64748b', borderBottom: activeTab === 'transactions' ? '2px solid #1e3a5f' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => handleTabChange('transactions')}
                        >
                            Transactions ({transactions.length})
                        </button>
                        <button 
                            style={{ background: 'none', border: 'none', padding: '0 0 6px', cursor: 'pointer', fontSize: '0.95rem', fontStyle: 'normal', fontFamily: 'inherit', fontWeight: activeTab === 'dashboard' ? '700' : '500', color: activeTab === 'dashboard' ? '#1e3a5f' : '#64748b', borderBottom: activeTab === 'dashboard' ? '2px solid #1e3a5f' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => handleTabChange('dashboard')}
                        >
                            Dashboard
                        </button>
                        <button 
                            style={{ background: 'none', border: 'none', padding: '0 0 6px', cursor: 'pointer', fontSize: '0.95rem', fontStyle: 'normal', fontFamily: 'inherit', fontWeight: activeTab === 'history' ? '700' : '500', color: activeTab === 'history' ? '#1e3a5f' : '#64748b', borderBottom: activeTab === 'history' ? '2px solid #1e3a5f' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => handleTabChange('history')}
                        >
                            Contribution History
                        </button>
                        <button 
                            style={{ background: 'none', border: 'none', padding: '0 0 6px', cursor: 'pointer', fontSize: '0.95rem', fontStyle: 'normal', fontFamily: 'inherit', fontWeight: activeTab === 'subscriptions' ? '700' : '500', color: activeTab === 'subscriptions' ? '#1e3a5f' : '#64748b', borderBottom: activeTab === 'subscriptions' ? '2px solid #1e3a5f' : '2px solid transparent', transition: 'all 0.2s' }}
                            onClick={() => handleTabChange('subscriptions')}
                        >
                            Subscriptions
                        </button>
                    </div>
                </div>
                <div className="acc-header-actions">

                    <button className="btn btn-outline-red" onClick={() => setShowExpenseModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Expense
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowIncomeModal(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add Income
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="acc-summary-grid">
                <div 
                    className="acc-summary-card card-income" 
                >
                    <div className="acc-summary-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                        Total Income
                    </div>
                    <div className="acc-summary-amount">₹ {(summary.totalIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="acc-summary-sub">This Month <span className="acc-summary-badge badge-up">+0%</span></div>
                    
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #bbf7d0', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#166534', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Cash</span>
                            <span style={{ fontWeight: 700, color: '#14532d' }}>₹ {breakdown.income.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                            <span style={{ color: '#166534', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Online/Bank</span>
                            <span style={{ fontWeight: 700, color: '#14532d' }}>₹ {breakdown.income.online.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>
                
                <div 
                    className="acc-summary-card card-expense"
                >
                    <div className="acc-summary-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>
                        Total Expenses
                    </div>
                    <div className="acc-summary-amount">₹ {(summary.totalExpense || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="acc-summary-sub">This Month <span className="acc-summary-badge badge-down">-0%</span></div>
                    
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #fecaca', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Cash</span>
                            <span style={{ fontWeight: 700, color: '#7f1d1d' }}>₹ {breakdown.expense.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                            <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Online/Bank</span>
                            <span style={{ fontWeight: 700, color: '#7f1d1d' }}>₹ {breakdown.expense.online.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>

                <div 
                    className="acc-summary-card card-net"
                >
                    <div className="acc-summary-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        Net Balance
                    </div>
                    <div className="acc-summary-amount">₹ {(summary.netBalance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    <div className="acc-summary-sub">Available Funds</div>
                    
                    <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #bfdbfe', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ color: '#1e40af', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Cash</span>
                            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>₹ {breakdown.net.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                            <span style={{ color: '#1e40af', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>Online/Bank</span>
                            <span style={{ fontWeight: 700, color: '#1e3a8a' }}>₹ {breakdown.net.online.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                    </div>
                </div>


            </div>

            <div className="acc-content" style={{ paddingTop: '10px' }}>

                {activeTab === 'transactions' && (
                    <div className="acc-table-card">
                        <div className="acc-table-top">
                            <div className="acc-search-wrap">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <input 
                                    type="text" 
                                    placeholder="Search transactions..." 
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                />
                            </div>
                            <div className="acc-filter-group">
                                <select 
                                    className="acc-filter-select" 
                                    value={typeFilter}
                                    onChange={(e) => {
                                        setTypeFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option>All Types</option>
                                    <option>Income</option>
                                    <option>Subscription</option>
                                    <option>Offering</option>
                                    <option>Sponsorship</option>
                                    <option>Property Rent</option>
                                    <option>Expense</option>

                                </select>
                                <select 
                                    className="acc-filter-select"
                                    value={methodFilter}
                                    onChange={(e) => {
                                        setMethodFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option>All Methods</option>
                                    <option>Cash</option>
                                    <option>Bank Transfer</option>
                                    <option>Card</option>
                                    <option>Cheque</option>
                                </select>
                                <select 
                                    className="acc-filter-select"
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <option>All Time</option>
                                    <option>This Month</option>
                                    <option>Last Month</option>
                                    <option>This Year</option>
                                    <option>Custom Range</option>
                                </select>

                                {dateFilter === 'Custom Range' && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <input 
                                            type="date" 
                                            className="acc-filter-select" 
                                            style={{ padding: '6px 10px' }}
                                            value={startDate}
                                            onChange={(e) => {
                                                setStartDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                        <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>TO</span>
                                        <input 
                                            type="date" 
                                            className="acc-filter-select" 
                                            style={{ padding: '6px 10px' }}
                                            value={endDate}
                                            onChange={(e) => {
                                                setEndDate(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Desktop Table View */}
                        <div className="acc-table-wrap desktop-only">
                            <table className="acc-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Transaction ID</th>
                                        <th>Description</th>
                                        <th>Type</th>
                                        <th>Method</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No transactions found matching the filters.</td>
                                        </tr>
                                    ) : filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trx, index) => (
                                        <tr 
                                            key={`${trx.type}-${trx.id}-${index}`} 
                                            onClick={() => setViewingTransaction(trx)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td>{trx.date || '-'}</td>
                                            <td><strong>{trx.transactionId}</strong></td>
                                            <td>{trx.description}</td>
                                            <td>
                                                <span className={`type-chip chip-${trx.type.toLowerCase().replace(/[\s-]/g, '')}`}>{trx.type}</span>
                                            </td>
                                            <td><span className="method-tag">{trx.method || '-'}</span></td>
                                            <td className={trx.type !== 'Expense' ? 'amount-positive' : 'amount-negative'}>
                                                {trx.type !== 'Expense' ? '+' : '-'} ₹ {Math.abs(trx.amount || 0).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="acc-mobile-list mobile-only">
                            {filteredTransactions.length === 0 ? (
                                <div className="acc-empty" style={{ padding: '2rem' }}>No transactions found matching the filters.</div>
                            ) : filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((trx, index) => (
                                <div className="mobile-member-card" key={`${trx.type}-${trx.id}-${index}`} onClick={() => setViewingTransaction(trx)}>
                                    <div className="mobile-card-header">
                                        <div className="mobile-card-title">
                                            <h3>{trx.transactionId}</h3>
                                            <span className="mobile-member-id">{trx.date || '—'}</span>
                                        </div>
                                        <span className={`type-chip chip-${trx.type.toLowerCase().replace(/[\s-]/g, '')}`}>{trx.type}</span>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <span className="mobile-label">Description</span>
                                            <span className="mobile-value">{trx.description}</span>
                                        </div>
                                        <div className="mobile-card-row">
                                            <span className="mobile-label">Method</span>
                                            <span className="method-tag">{trx.method || '—'}</span>
                                        </div>
                                        <div className="mobile-card-row">
                                            <span className="mobile-label">Amount</span>
                                            <span className={`mobile-value ${trx.type !== 'Expense' ? 'amount-positive' : 'amount-negative'}`}>
                                                {trx.type !== 'Expense' ? '+' : '-'} ₹ {Math.abs(trx.amount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="acc-pagination">
                            <span>Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredTransactions.length)} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} entries</span>
                            <div className="acc-pagination-btns">
                                <button 
                                    className="acc-page-btn" 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >Prev</button>
                                
                                {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                                    <button 
                                        key={page}
                                        className={`acc-page-btn ${currentPage === page ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(page)}
                                    >
                                        {page}
                                    </button>
                                ))}
 
                                <button 
                                    className="acc-page-btn" 
                                    disabled={currentPage === Math.ceil(filteredTransactions.length / itemsPerPage) || filteredTransactions.length === 0}
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredTransactions.length / itemsPerPage)))}
                                >Next</button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dashboard' && (
                    <div className="acc-dashboard-view">
                        <div className="dashboard-controls">
                            <div className="dashboard-title">
                                <h3>Financial Analytics</h3>
                                <p>Year-to-date performance and breakdown</p>
                            </div>
                            <div className="dashboard-filters">
                                <select 
                                    className="acc-filter-select" 
                                    value={dashboardYear}
                                    onChange={(e) => setDashboardYear(parseInt(e.target.value))}
                                >
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y} Overview</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            {/* Main Trend Chart */}
                            <div className="dashboard-card main-chart">
                                <div className="card-header">
                                    <h4>Income vs Expenses Trend</h4>
                                    <div className="chart-legend-custom">
                                        <span className="legend-item"><span className="dot income"></span> Income</span>
                                        <span className="legend-item"><span className="dot expense"></span> Expense</span>
                                    </div>
                                </div>
                                <div className="chart-container" style={{ height: '350px' }}>
                                    <Line 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    backgroundColor: '#fff',
                                                    titleColor: '#1e293b',
                                                    bodyColor: '#64748b',
                                                    borderColor: '#f1f5f9',
                                                    borderWidth: 1,
                                                    padding: 12,
                                                    displayColors: true,
                                                    callbacks: {
                                                        label: (context) => ` ₹${context.raw.toLocaleString()}`
                                                    }
                                                }
                                            },
                                            scales: {
                                                x: { grid: { display: false }, ticks: { color: '#64748b' } },
                                                y: { 
                                                    grid: { color: '#f1f5f9' }, 
                                                    ticks: { 
                                                        color: '#64748b',
                                                        callback: (value) => `₹${value >= 1000 ? value/1000 + 'k' : value}`
                                                    } 
                                                }
                                            },
                                            elements: {
                                                line: { tension: 0.4 }
                                            }
                                        }}
                                        data={{
                                            labels: chartData.map(d => d.name),
                                            datasets: [
                                                {
                                                    label: 'Income',
                                                    data: chartData.map(d => d.income),
                                                    borderColor: '#10b981',
                                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                    fill: true,
                                                    borderWidth: 3,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: '#fff',
                                                    pointBorderColor: '#10b981',
                                                    pointBorderWidth: 2
                                                },
                                                {
                                                    label: 'Expense',
                                                    data: chartData.map(d => d.expense),
                                                    borderColor: '#ef4444',
                                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                    fill: true,
                                                    borderWidth: 3,
                                                    pointRadius: 4,
                                                    pointBackgroundColor: '#fff',
                                                    pointBorderColor: '#ef4444',
                                                    pointBorderWidth: 2
                                                }
                                            ]
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Income Breakdown */}
                            <div className="dashboard-card side-chart">
                                <div className="card-header">
                                    <h4>Income by Category</h4>
                                </div>
                                <div className="chart-container" style={{ height: '300px' }}>
                                    <Pie 
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            plugins: {
                                                legend: { display: false },
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context) => ` ₹${context.raw.toLocaleString()}`
                                                    }
                                                }
                                            }
                                        }}
                                        data={{
                                            labels: categoryData.map(d => d.name),
                                            datasets: [{
                                                data: categoryData.map(d => d.value),
                                                backgroundColor: COLORS,
                                                borderWidth: 0,
                                                hoverOffset: 10
                                            }]
                                        }}
                                    />
                                    <div className="custom-pie-legend">
                                        {categoryData.slice(0, 4).map((entry, index) => (
                                            <div key={entry.name} className="pie-legend-item">
                                                <span className="pie-dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                                                <span className="pie-label">{entry.name}</span>
                                                <span className="pie-value">₹{entry.value.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="history-tab-content">
                        <div className="history-search-card">
                            <div className="section-header" style={{ border: 'none', marginBottom: '15px' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                <h3 style={{ textTransform: 'none', letterSpacing: 'normal' }}>Find Member to View Contribution History</h3>
                            </div>
                            
                            <div style={{ position: 'relative', maxWidth: '500px' }}>
                                <input 
                                    type="text" 
                                    className="acc-input" 
                                    placeholder="Search by name or phone..." 
                                    value={histSearchTerm}
                                    onChange={(e) => {
                                        setHistSearchTerm(e.target.value);
                                        searchHistMembers(e.target.value);
                                    }}
                                />
                                {histResults.length > 0 && (
                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '250px', overflowY: 'auto' }}>
                                        {histResults.map(m => (
                                            <div 
                                                key={m.memberId} 
                                                onClick={() => handleHistMemberSelect(m)}
                                                style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <AuthenticatedAvatar 
                                                        memberId={m.memberId}
                                                        firstName={m.firstName}
                                                        lastName={m.lastName}
                                                        photoUrl={m.photoUrl}
                                                        photoContentType={m.photoContentType}
                                                        getInitials={getInitials}
                                                        getAvatarColor={getAvatarColor}
                                                        size="36px"
                                                    />
                                                    <div>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' }}>{m.firstName} {m.lastName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {m.customMemberId || m.memberId}</div>
                                                    </div>
                                                </div>
                                                {m.contactNumber && (
                                                    <div style={{ fontSize: '0.8rem', color: '#059669', fontWeight: '600', background: '#f0fdf4', padding: '4px 10px', borderRadius: '6px' }}>
                                                        {m.contactNumber}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {histMember ? (
                            <div className="member-history-view">
                                <div className="history-member-header">
                                    <div className="history-member-info">
                                        <AuthenticatedAvatar 
                                            memberId={histMember.memberId}
                                            firstName={histMember.firstName}
                                            lastName={histMember.lastName}
                                            photoUrl={histMember.photoUrl}
                                            photoContentType={histMember.photoContentType}
                                            getInitials={getInitials}
                                            getAvatarColor={getAvatarColor}
                                            size="52px"
                                        />
                                        <div>
                                            <h2>{histMember.firstName} {histMember.lastName}</h2>
                                            <p>Member ID: {histMember.customMemberId || histMember.memberId} • {histMember.contactNumber || 'No Contact'}</p>
                                        </div>
                                    </div>
                                    <button className="btn btn-secondary" onClick={() => setHistMember(null)}>Close History</button>
                                </div>

                                <div className="financial-history-container" style={{ background: '#fff', marginTop: '20px' }}>
                                    {histLoading ? (
                                        <div className="history-loading">Loading financial records...</div>
                                    ) : (
                                        <>
                                            <div className="history-subset">
                                                <h4>Cash Transactions</h4>
                                                {histData.transactions.length === 0 ? (
                                                    <p className="no-history">No cash transactions found for this member.</p>
                                                ) : (
                                                    <>
                                                        <div className="desktop-only">
                                                            <table className="history-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>Type</th>
                                                                        <th>Amount</th>
                                                                        <th>Method</th>
                                                                        <th>Notes</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {histData.transactions.map(t => (
                                                                        <tr key={t.id}>
                                                                            <td>{t.date}</td>
                                                                            <td><span className={`type-chip chip-${t.type.toLowerCase()}`}>{t.type}</span></td>
                                                                            <td className="amount">₹ {t.amount?.toLocaleString()}</td>
                                                                            <td>{t.method}</td>
                                                                            <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.notes || '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                        <div className="acc-mobile-list mobile-only">
                                                            {histData.transactions.map(t => (
                                                                <div className="mobile-member-card" key={t.id}>
                                                                    <div className="mobile-card-header">
                                                                        <div className="mobile-card-title">
                                                                            <h3>{t.date}</h3>
                                                                        </div>
                                                                        <span className={`type-chip chip-${t.type.toLowerCase()}`}>{t.type}</span>
                                                                    </div>
                                                                    <div className="mobile-card-body">
                                                                        <div className="mobile-card-row">
                                                                            <span className="mobile-label">Amount</span>
                                                                            <span className="mobile-value amount" style={{color: '#059669', fontWeight: '700'}}>₹ {t.amount?.toLocaleString()}</span>
                                                                        </div>
                                                                        <div className="mobile-card-row">
                                                                            <span className="mobile-label">Method</span>
                                                                            <span className="mobile-value">{t.method}</span>
                                                                        </div>
                                                                        <div className="mobile-card-row">
                                                                            <span className="mobile-label">Notes</span>
                                                                            <span className="mobile-value">{t.notes || '—'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </div>


                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="acc-empty" style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0' }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                <h3 style={{ color: '#64748b' }}>No Member Selected</h3>
                                <p>Search for a member above to view their entire donation and payment history.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === 'subscriptions' && (
                    <div className="acc-table-card">
                        <div className="acc-table-top" style={{ flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <div className="acc-search-wrap" style={{ minWidth: '220px' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                    <input 
                                        type="text" 
                                        placeholder="Search members by name or ID..." 
                                        value={subSearch}
                                        onChange={(e) => setSubSearch(e.target.value)}
                                    />
                                </div>
                                <select 
                                    className="acc-filter-select"
                                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '600' }}
                                    value={subFrequency}
                                    onChange={(e) => {
                                        setSubFrequency(e.target.value);
                                        // Update default period if frequency changes
                                        if (e.target.value === 'Weekly') {
                                            const d = new Date();
                                            d.setHours(0, 0, 0, 0);
                                            d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                                            const yearStart = new Date(d.getFullYear(), 0, 1);
                                            setSubWeek(Math.ceil((((d - yearStart) / 86400000) + 1) / 7));
                                        } else if (e.target.value === 'Monthly') {
                                            setSubMonth(new Date().getMonth() + 1);
                                        }
                                    }}
                                >
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly</option>
                                </select>
                            </div>
                            
                            <div className="acc-filter-group">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '4px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>FOR:</span>
                                    {subFrequency === 'Weekly' && (
                                        <select 
                                            className="acc-filter-select" 
                                            style={{ border: 'none', background: 'transparent', padding: '4px', fontWeight: '600' }}
                                            value={subWeek}
                                            onChange={(e) => setSubWeek(parseInt(e.target.value))}
                                        >
                                            {Array.from({ length: 53 }, (_, i) => i + 1).map(w => (
                                                <option key={w} value={w}>Week {w}</option>
                                            ))}
                                        </select>
                                    )}
                                    {subFrequency === 'Monthly' && (
                                        <select 
                                            className="acc-filter-select" 
                                            style={{ border: 'none', background: 'transparent', padding: '4px', fontWeight: '600' }}
                                            value={subMonth}
                                            onChange={(e) => setSubMonth(parseInt(e.target.value))}
                                        >
                                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                                <option key={m} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                    )}
                                    <select 
                                        className="acc-filter-select"
                                        style={{ border: 'none', background: 'transparent', padding: '4px', fontWeight: '600' }}
                                        value={subYear}
                                        onChange={(e) => setSubYear(parseInt(e.target.value))}
                                    >
                                        {[2024, 2025, 2026, 2027, 2028].map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="acc-filter-group">
                                <select 
                                    className="acc-filter-select"
                                    value={subStatusFilter}
                                    onChange={(e) => setSubStatusFilter(e.target.value)}
                                >
                                    <option value="All">All Status</option>
                                    <option value="Paid">Paid Only</option>
                                    <option value="Pending">Pending Only</option>
                                </select>
                                <button className="btn btn-secondary" onClick={fetchAllMembers} disabled={subLoading}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                                    Refresh List
                                </button>
                            </div>
                        </div>

                        {/* Desktop Table View */}
                        <div className="acc-table-wrap desktop-only">
                            <table className="acc-table">
                                <thead>
                                    <tr>
                                        <th>Member Info</th>
                                        <th>Member ID</th>
                                        <th>Paid Amount</th>
                                        <th>Status</th>
                                        <th>Payment Date</th>
                                        {isSuperPlusAdmin && <th>Approval</th>}
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subLoading ? (
                                        <tr>
                                            <td colSpan={isSuperPlusAdmin ? "7" : "6"} style={{ textAlign: 'center', padding: '3rem' }}>
                                                <div className="spinner" style={{ margin: '0 auto 10px' }}></div>
                                                <p style={{ color: '#64748b' }}>Loading members...</p>
                                            </td>
                                        </tr>
                                    ) : subscriptionData.length === 0 ? (
                                        <tr>
                                            <td colSpan={isSuperPlusAdmin ? "7" : "6"} style={{ textAlign: 'center', padding: '3rem' }}>
                                                <p style={{ color: '#64748b' }}>No members found.</p>
                                            </td>
                                        </tr>
                                    ) : subscriptionData.map(member => (
                                        <tr key={member.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <AuthenticatedAvatar 
                                                        memberId={member.id}
                                                        firstName={member.firstName}
                                                        lastName={member.lastName}
                                                        photoUrl={member.photoUrl}
                                                        photoContentType={member.photoContentType}
                                                        getInitials={getInitials}
                                                        getAvatarColor={getAvatarColor}
                                                        size="36px"
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{member.firstName} {member.lastName}</div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{member.contactNo || 'No contact'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td><strong>{member.memberId || '-'}</strong></td>
                                            <td>
                                                {member.isPaid
                                                    ? <span style={{ fontWeight: '700', color: '#059669' }}>₹ {(member.paymentDetails?.amount || 0).toLocaleString()}</span>
                                                    : <span style={{ color: '#94a3b8' }}>—</span>
                                                }
                                            </td>
                                            <td>
                                                {member.isPaid ? (
                                                    <span className="acc-summary-badge badge-up" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#10b981' }}>
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="acc-summary-badge badge-down" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#f87171' }}>
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td>{member.isPaid ? member.paymentDetails.date : '—'}</td>
                                            {isSuperPlusAdmin && (
                                                <td>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={member.subscriptionApproved !== false} 
                                                            onChange={async (e) => {
                                                                const checked = e.target.checked;
                                                                try {
                                                                    const headers = getAuthHeaders();
                                                                    await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/${member.memberId}/subscription-approval?approved=${checked}`, null, { headers });
                                                                    // Update the state locally
                                                                    setAllMembers(prev => prev.map(m => m.memberId === member.memberId ? { ...m, subscriptionApproved: checked } : m));
                                                                } catch (err) {
                                                                    console.error("Error setting subscription approval", err);
                                                                    alert("Failed to update approval status.");
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer', width: '18px', height: '18px', borderRadius: '4px', accentColor: '#3b82f6' }}
                                                        />
                                                        <span style={{ fontSize: '0.78rem', fontWeight: '600', color: member.subscriptionApproved !== false ? '#059669' : '#64748b' }}>
                                                            {member.subscriptionApproved !== false ? 'Approved' : 'Hidden'}
                                                        </span>
                                                    </label>
                                                </td>
                                            )}
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    {member.isPaid && (
                                                        <button className="btn btn-secondary btn-sm" onClick={() => setViewingTransaction(member.paymentDetails)}>
                                                            View Receipt
                                                        </button>
                                                    )}
                                                    <button 
                                                        className="btn btn-primary btn-sm" 
                                                        onClick={() => {
                                                            setIncomeType('Subscription');
                                                            setSubPayFrequency(subFrequency);
                                                            setFormData({ 
                                                                memberId: member.memberId,
                                                                donorName: `${member.firstName} ${member.lastName}`,
                                                                forMonth: subMonth,
                                                                forYear: subYear
                                                            });
                                                            setSelectedMember(member);
                                                            setShowIncomeModal(true);
                                                        }}
                                                    >
                                                        {member.isPaid ? 'Add Another' : 'Add Payment'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="acc-mobile-list mobile-only">
                            {subLoading ? (
                                <div className="history-loading">Loading members...</div>
                            ) : subscriptionData.length === 0 ? (
                                <div className="acc-empty">No members found.</div>
                            ) : subscriptionData.map(member => (
                                <div className="mobile-member-card" key={member.id}>
                                    <div className="mobile-card-header">
                                        <AuthenticatedAvatar 
                                            memberId={member.id}
                                            firstName={member.firstName}
                                            lastName={member.lastName}
                                            photoUrl={member.photoUrl}
                                            photoContentType={member.photoContentType}
                                            getInitials={getInitials}
                                            getAvatarColor={getAvatarColor}
                                            size="36px"
                                        />
                                        <div className="mobile-card-title">
                                            <h3>{member.firstName} {member.lastName}</h3>
                                            <span className="mobile-member-id">ID: {member.memberId || '-'} • {member.contactNo || 'No contact'}</span>
                                        </div>
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="mobile-card-row">
                                            <span className="mobile-label">Status</span>
                                            {member.isPaid ? (
                                                <span className="acc-summary-badge badge-up" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#10b981' }}>Paid</span>
                                            ) : (
                                                <span className="acc-summary-badge badge-down" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#f87171' }}>Pending</span>
                                            )}
                                        </div>
                                        {member.isPaid && (
                                            <>
                                            <div className="mobile-card-row">
                                                <span className="mobile-label">Amount</span>
                                                <span className="mobile-value" style={{ fontWeight: '700', color: '#059669' }}>₹ {(member.paymentDetails?.amount || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="mobile-card-row">
                                                <span className="mobile-label">Payment Date</span>
                                                <span className="mobile-value">{member.paymentDetails.date}</span>
                                            </div>
                                            </>
                                        )}
                                        {isSuperPlusAdmin && (
                                            <div className="mobile-card-row">
                                                <span className="mobile-label">Approval</span>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                    <input 
                                                        type="checkbox" 
                                                        checked={member.subscriptionApproved !== false} 
                                                        onChange={async (e) => {
                                                            const checked = e.target.checked;
                                                            try {
                                                                const headers = getAuthHeaders();
                                                                await axios.put(`https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/members/${member.memberId}/subscription-approval?approved=${checked}`, null, { headers });
                                                                setAllMembers(prev => prev.map(m => m.memberId === member.memberId ? { ...m, subscriptionApproved: checked } : m));
                                                            } catch (err) {
                                                                console.error("Error setting subscription approval", err);
                                                                alert("Failed to update approval status.");
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer', width: '18px', height: '18px', borderRadius: '4px', accentColor: '#3b82f6' }}
                                                    />
                                                    <span style={{ fontSize: '0.78rem', fontWeight: '600', color: member.subscriptionApproved !== false ? '#059669' : '#64748b' }}>
                                                        {member.subscriptionApproved !== false ? 'Approved' : 'Hidden'}
                                                    </span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mobile-card-actions">
                                        {member.isPaid && (
                                            <button className="mobile-btn-view" onClick={() => setViewingTransaction(member.paymentDetails)}>Receipt</button>
                                        )}
                                        <button 
                                            className="mobile-btn-edit" 
                                            onClick={() => {
                                                setIncomeType('Subscription');
                                                setSubPayFrequency(subFrequency);
                                                setFormData({ 
                                                    memberId: member.memberId,
                                                    donorName: `${member.firstName} ${member.lastName}`,
                                                    forMonth: subMonth,
                                                    forYear: subYear
                                                });
                                                setSelectedMember(member);
                                                setShowIncomeModal(true);
                                            }}
                                        >
                                            {member.isPaid ? 'Add Another' : 'Add Payment'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <div className="acc-modal-overlay">
                    <div className="acc-modal">
                        <div className="acc-modal-header">
                            <div>
                                <h2>Add Expense Entry</h2>
                                <p>Record a church expense or payment.</p>
                            </div>
                            <button className="acc-modal-close" onClick={() => setShowExpenseModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="acc-modal-body">
                            <div className="acc-form-group">
                                <label className="acc-label">Description</label>
                                <input type="text" className="acc-input" name="description" placeholder="e.g. Electricity Bill, Sound System Repair" onChange={handleInputChange} />
                            </div>
                            <div className="acc-form-group">
                                <label className="acc-label">Amount</label>
                                <div className="acc-amount-wrap">
                                    <span className="acc-currency">₹</span>
                                    <input type="number" className="acc-amount-input" name="amount" defaultValue="0" onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="acc-form-group">
                                <label className="acc-label">Date</label>
                                <input type="date" className="acc-input" name="date" onChange={handleInputChange} />
                            </div>
                            <div className="acc-form-group">
                                <label className="acc-label">Method</label>
                                <select className="acc-input acc-select" name="method" onChange={handleInputChange}>
                                    <option value="">Select Method</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Card">Card</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div className="acc-form-group">
                                <label className="acc-label">Notes</label>
                                <textarea className="acc-input acc-textarea" name="notes" placeholder="Optional details..." onChange={handleInputChange}></textarea>
                            </div>
                        </div>
                        <div className="acc-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Cancel</button>
                            <button className="btn btn-outline-red" onClick={submitExpense}>Save Expense</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Income Modal */}
            {showIncomeModal && (
                <div className="acc-modal-overlay">
                    <div className="acc-modal">
                        <div className="acc-modal-header">
                            <div>
                                <h2>Add Income Entry</h2>
                                <p>Pick the type of income, then fill in the details.</p>
                            </div>
                            <button className="acc-modal-close" onClick={() => { setShowIncomeModal(false); resetSearch(); }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="acc-modal-body">
                            <div className="income-type-grid">
                                {[
                                    { id: 'Subscription', icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>, label: 'Subscription' },
                                    { id: 'Offering', icon: <><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>, label: 'Offering' },
                                    { id: 'Sponsorship', icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>, label: 'Sponsorship' },
                                ].map(type => (
                                    <button
                                        key={type.id}
                                        className={`income-type-btn ${incomeType === type.id ? `active-${type.id.toLowerCase().replace(' ', '_')}` : ''}`}
                                        onClick={() => setIncomeType(type.id)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{type.icon}</svg>
                                        {type.label}
                                    </button>
                                ))}
                            </div>

                            <div className="income-type-desc">
                                {incomeType === 'Subscription' && 'Member monthly fee'}
                                {incomeType === 'Offering' && 'Event collection'}
                                {incomeType === 'Sponsorship' && 'Sponsor contribution'}
                                {incomeType === 'Property Rent' && 'Hall / property rental'}
                            </div>

                            <div className="acc-form-group">
                                <label className="acc-label">Description / Title</label>
                                <input type="text" className="acc-input" name="description" onChange={handleInputChange} placeholder={`e.g. ${incomeType} Payment`} />
                            </div>

                            <div className="acc-form-group">
                                <label className="acc-label">Amount <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.78rem' }}>(any amount, no minimum)</span></label>
                                <div className="acc-amount-wrap">
                                    <span className="acc-currency">₹</span>
                                    <input type="number" className="acc-amount-input" name="amount" min="0" step="any" placeholder="Enter amount" value={formData.amount || ''} onChange={handleInputChange} />
                                </div>
                            </div>

                            <div className="acc-form-group">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <label className="acc-label" style={{ marginBottom: 0 }}>Date</label>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({ ...formData, date: new Date().toISOString().split('T')[0] })}
                                        style={{ 
                                            background: '#f1f5f9', 
                                            border: '1px solid #cbd5e1', 
                                            borderRadius: '6px', 
                                            padding: '4px 10px', 
                                            fontSize: '0.75rem', 
                                            color: '#334155', 
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}
                                        onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                                        onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                        Today
                                    </button>
                                </div>
                                <input type="date" className="acc-input" name="date" value={formData.date || ''} onChange={handleInputChange} />
                            </div>

                            {incomeType !== 'Offering' && incomeType !== 'Property Rent' && (
                                <div className="acc-form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label className="acc-label">{incomeType === 'Subscription' ? 'Member' : 'Contributor'}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                                            <input 
                                                type="checkbox" 
                                                id="nonMemberToggle" 
                                                checked={isNonMember} 
                                                onChange={(e) => toggleNonMember(e.target.checked)} 
                                            />
                                            <label htmlFor="nonMemberToggle" style={{ cursor: 'pointer' }}>Not a member?</label>
                                        </div>
                                    </div>

                                    {!isNonMember ? (
                                        <div style={{ position: 'relative' }}>
                                            {selectedMember ? (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '9px' }}>
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
                                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#064e3b' }}>{selectedMember.firstName} {selectedMember.lastName}</div>
                                                            <div style={{ fontSize: '0.7rem', color: '#059669' }}>ID: {selectedMember.customMemberId || selectedMember.memberId}</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setSelectedMember(null)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}
                                                    >Change</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <input 
                                                        type="text" 
                                                        className="acc-input" 
                                                        placeholder="Search by name or phone..." 
                                                        value={memberSearchTerm}
                                                        onChange={(e) => {
                                                            setMemberSearchTerm(e.target.value);
                                                            searchMembers(e.target.value);
                                                        }}
                                                    />
                                                    {memberSearchResults.length > 0 && (
                                                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', marginTop: '4px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '250px', overflowY: 'auto' }}>
                                                            {memberSearchResults.map(m => (
                                                                <div 
                                                                    key={m.memberId} 
                                                                    onClick={() => handleMemberSelect(m)}
                                                                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                                                    onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                                    onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
                                                                >
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <AuthenticatedAvatar 
                                                                            memberId={m.memberId}
                                                                            firstName={m.firstName}
                                                                            lastName={m.lastName}
                                                                            photoUrl={m.photoUrl}
                                                                            photoContentType={m.photoContentType}
                                                                            getInitials={getInitials}
                                                                            getAvatarColor={getAvatarColor}
                                                                            size="32px"
                                                                        />
                                                                        <div>
                                                                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1e293b' }}>{m.firstName} {m.lastName}</div>
                                                                            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {m.customMemberId || m.memberId}</div>
                                                                        </div>
                                                                    </div>
                                                                    {m.contactNumber && (
                                                                        <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', padding: '4px 8px', borderRadius: '6px' }}>
                                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                                            {m.contactNumber}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {isSearching && <div style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '0.7rem', color: '#94a3b8' }}>Searching...</div>}
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <input 
                                            type="text" 
                                            name="donorName" 
                                            className="acc-input" 
                                            placeholder="Enter person's name..." 
                                            value={formData.donorName || ''}
                                            onChange={handleInputChange}
                                        />
                                    )}
                                </div>
                            )}

                                                     <>
                                    {/* Frequency selection */}
                                    {incomeType === 'Subscription' && (
                                    <div className="acc-form-group">
                                        <label className="acc-label">Subscription Frequency</label>
                                        <select 
                                            className="acc-input acc-select" 
                                            value={subPayFrequency} 
                                            onChange={e => {
                                                setSubPayFrequency(e.target.value);
                                                setSubCheckedMonths(new Set());
                                                setSubCheckedWeeks(new Set());
                                                setSubCheckedYears(new Set());
                                            }}
                                        >
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Yearly">Yearly</option>
                                        </select>
                                    </div>
                                    )}

                                    {/* Method */}
                                    <div className="acc-form-group">
                                        <label className="acc-label">Payment Method</label>
                                        <select className="acc-input acc-select" name="method" value={formData.method || ''} onChange={handleInputChange}>
                                            <option value="">Select Method</option>
                                            <option value="Cash">Cash</option>
                                            <option value="Bank Transfer">Bank Transfer</option>
                                            <option value="Card">Card</option>
                                            <option value="Cheque">Cheque</option>
                                        </select>
                                    </div>

                                    {/* Checkbox Period Grid based on frequency */}
                                    {incomeType === 'Subscription' && subPayFrequency === 'Weekly' && (
                                        <div className="acc-form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <label className="acc-label" style={{ marginBottom: 0 }}>
                                                    Subscription Weeks
                                                    <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.78rem', marginLeft: '6px' }}>
                                                        (tick weeks this payment covers)
                                                    </span>
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Year:</span>
                                                    <select
                                                        className="acc-filter-select"
                                                        style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                                                        value={subPayYear}
                                                        onChange={e => { setSubPayYear(parseInt(e.target.value)); setSubCheckedWeeks(new Set()); }}
                                                    >
                                                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Scrollable 6-column week grid */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                                                {Array.from({ length: 53 }, (_, i) => i + 1).map(w => {
                                                    const checked = subCheckedWeeks.has(w);
                                                    return (
                                                        <button
                                                            key={w}
                                                            type="button"
                                                            onClick={() => toggleSubWeek(w)}
                                                            style={{
                                                                padding: '6px 2px',
                                                                borderRadius: '6px',
                                                                border: checked ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                                                                background: checked ? '#eff6ff' : '#fff',
                                                                color: checked ? '#1d4ed8' : '#475569',
                                                                fontWeight: checked ? '700' : '500',
                                                                fontSize: '0.75rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.1s',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            W{w}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Split Summary */}
                                            {subCheckedWeeks.size > 0 && formData.amount && Number(formData.amount) > 0 ? (
                                                <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '9px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: '600' }}>
                                                        ₹{Number(formData.amount).toLocaleString()} total
                                                        {subCheckedWeeks.size > 1 && (
                                                            <> &rarr; <strong>₹{(Number(formData.amount) / subCheckedWeeks.size).toFixed(2)}</strong> per week &times; {subCheckedWeeks.size} weeks</>
                                                        )}
                                                        {subCheckedWeeks.size === 1 && <> for Week {Array.from(subCheckedWeeks)[0]} {subPayYear}</>}
                                                    </span>
                                                </div>
                                            ) : subCheckedWeeks.size > 0 ? (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    {subCheckedWeeks.size} week{subCheckedWeeks.size > 1 ? 's' : ''} selected — enter amount above to see split
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    No weeks selected yet
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {incomeType === 'Subscription' && subPayFrequency === 'Monthly' && (
                                        <div className="acc-form-group">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                <label className="acc-label" style={{ marginBottom: 0 }}>
                                                    Subscription Months
                                                    <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.78rem', marginLeft: '6px' }}>
                                                        (tick months this payment covers)
                                                    </span>
                                                </label>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Year:</span>
                                                    <select
                                                        className="acc-filter-select"
                                                        style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                                                        value={subPayYear}
                                                        onChange={e => { setSubPayYear(parseInt(e.target.value)); setSubCheckedMonths(new Set()); }}
                                                    >
                                                        {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(y => (
                                                            <option key={y} value={y}>{y}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                                {MONTH_SHORT.map((m, i) => {
                                                    const monthNum = i + 1;
                                                    const checked = subCheckedMonths.has(monthNum);
                                                    return (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onClick={() => toggleSubMonth(monthNum)}
                                                            style={{
                                                                padding: '10px 6px',
                                                                borderRadius: '9px',
                                                                border: checked ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                                                                background: checked ? '#eff6ff' : '#f8fafc',
                                                                color: checked ? '#1d4ed8' : '#64748b',
                                                                fontWeight: checked ? '700' : '500',
                                                                fontSize: '0.82rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            {checked ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="0">
                                                                    <path d="M9 11l3 3L22 4"/>
                                                                    <rect x="3" y="3" width="18" height="18" rx="3" fill="#3b82f6"/>
                                                                    <polyline points="7 13 10 16 17 9" stroke="white" strokeWidth="2.5" fill="none"/>
                                                                </svg>
                                                            ) : (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                                </svg>
                                                            )}
                                                            {m}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Split Summary */}
                                            {subCheckedMonths.size > 0 && formData.amount && Number(formData.amount) > 0 ? (
                                                <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '9px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: '600' }}>
                                                        ₹{Number(formData.amount).toLocaleString()} total
                                                        {subCheckedMonths.size > 1 && (
                                                            <> &rarr; <strong>₹{(Number(formData.amount) / subCheckedMonths.size).toFixed(2)}</strong> per month &times; {subCheckedMonths.size} months</>
                                                        )}
                                                        {subCheckedMonths.size === 1 && <> for {MONTH_SHORT[Array.from(subCheckedMonths)[0] - 1]} {subPayYear}</>}
                                                    </span>
                                                </div>
                                            ) : subCheckedMonths.size > 0 ? (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    {subCheckedMonths.size} month{subCheckedMonths.size > 1 ? 's' : ''} selected — enter amount above to see split
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    No months selected yet
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {incomeType === 'Subscription' && subPayFrequency === 'Yearly' && (
                                        <div className="acc-form-group">
                                            <label className="acc-label">
                                                Subscription Years
                                                <span style={{ fontWeight: '400', color: '#94a3b8', fontSize: '0.78rem', marginLeft: '6px' }}>
                                                    (tick years this payment covers)
                                                </span>
                                            </label>

                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => {
                                                    const checked = subCheckedYears.has(y);
                                                    return (
                                                        <button
                                                            key={y}
                                                            type="button"
                                                            onClick={() => toggleSubYear(y)}
                                                            style={{
                                                                padding: '10px 6px',
                                                                borderRadius: '9px',
                                                                border: checked ? '2px solid #3b82f6' : '1.5px solid #e2e8f0',
                                                                background: checked ? '#eff6ff' : '#f8fafc',
                                                                color: checked ? '#1d4ed8' : '#64748b',
                                                                fontWeight: checked ? '700' : '500',
                                                                fontSize: '0.82rem',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.15s',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                gap: '4px'
                                                            }}
                                                        >
                                                            {checked ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6" stroke="#3b82f6" strokeWidth="0">
                                                                    <path d="M9 11l3 3L22 4"/>
                                                                    <rect x="3" y="3" width="18" height="18" rx="3" fill="#3b82f6"/>
                                                                    <polyline points="7 13 10 16 17 9" stroke="white" strokeWidth="2.5" fill="none"/>
                                                                </svg>
                                                            ) : (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                                                                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                                                                </svg>
                                                            )}
                                                            {y}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Split Summary */}
                                            {subCheckedYears.size > 0 && formData.amount && Number(formData.amount) > 0 ? (
                                                <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '9px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                                                    <span style={{ fontSize: '0.82rem', color: '#065f46', fontWeight: '600' }}>
                                                        ₹{Number(formData.amount).toLocaleString()} total
                                                        {subCheckedYears.size > 1 && (
                                                            <> &rarr; <strong>₹{(Number(formData.amount) / subCheckedYears.size).toFixed(2)}</strong> per year &times; {subCheckedYears.size} years</>
                                                        )}
                                                        {subCheckedYears.size === 1 && <> for Year {Array.from(subCheckedYears)[0]}</>}
                                                    </span>
                                                </div>
                                            ) : subCheckedYears.size > 0 ? (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    {subCheckedYears.size} year{subCheckedYears.size > 1 ? 's' : ''} selected — enter amount above to see split
                                                </div>
                                            ) : (
                                                <div style={{ marginTop: '8px', fontSize: '0.78rem', color: '#94a3b8' }}>
                                                    No years selected yet
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            {incomeType === 'Offering' && (
                                <div className="acc-form-group">
                                    <label className="acc-label">Event Name</label>
                                    <input type="text" className="acc-input" name="eventName" onChange={handleInputChange} placeholder="Sunday Service / Prayer Meeting" />
                                </div>
                            )}

                            {incomeType === 'Property Rent' && (
                                <div className="acc-form-group">
                                    <label className="acc-label">Tenant / Purpose</label>
                                    <textarea className="acc-input acc-textarea" name="tenantPurpose" onChange={handleInputChange} placeholder="e.g. Wedding reception — John & Mary"></textarea>
                                </div>
                            )}

                        </div>
                        <div className="acc-modal-footer">
                            <button className="btn btn-secondary" onClick={() => { setShowIncomeModal(false); setSubCheckedMonths(new Set()); setSubCheckedWeeks(new Set()); setSubCheckedYears(new Set()); resetSearch(); }}>Cancel</button>
                            <button className="btn btn-primary" onClick={submitIncome}>
                                {incomeType === 'Subscription' ? (
                                    subPayFrequency === 'Weekly' && subCheckedWeeks.size > 1 ? `Save ${subCheckedWeeks.size} Week Entries` :
                                    subPayFrequency === 'Yearly' && subCheckedYears.size > 1 ? `Save ${subCheckedYears.size} Year Entries` :
                                    subPayFrequency === 'Monthly' && subCheckedMonths.size > 1 ? `Save ${subCheckedMonths.size} Month Entries` :
                                    'Save Entry'
                                ) : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>
            )}



            {/* View Transaction Modal */}
            {viewingTransaction && (
                <div className="acc-modal-overlay" onClick={() => setViewingTransaction(null)}>
                    <div className="acc-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="acc-modal-header">
                            <div>
                                <h2>Transaction Details</h2>
                                <p>{viewingTransaction.transactionId} • {viewingTransaction.type}</p>
                            </div>
                            <button className="acc-modal-close" onClick={() => setViewingTransaction(null)}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div className="acc-modal-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Date</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.date}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Amount</label>
                                    <div style={{ fontWeight: '800', color: viewingTransaction.type === 'Expense' ? '#dc2626' : '#059669', fontSize: '1.2rem' }}>
                                        {viewingTransaction.type === 'Expense' ? '-' : '+'} ₹ {Math.abs(viewingTransaction.amount || 0).toLocaleString()}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Payment Method</label>
                                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.method || '-'}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Status</label>
                                    <div style={{ color: '#10b981', fontWeight: '700', fontSize: '0.85rem' }}>● {viewingTransaction.status || 'Completed'}</div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Description</label>
                                <div style={{ background: '#fff', border: '1.5px solid #e2e8f0', padding: '12px 16px', borderRadius: '9px', color: '#334155', fontSize: '0.9rem', lineHeight: '1.5' }}>
                                    {viewingTransaction.description || 'No description provided.'}
                                </div>
                            </div>

                            {/* Specific Details based on Type */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                {viewingTransaction.type === 'Subscription' && (
                                    <>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Member ID</label>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.memberId || '-'}</div>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Period</label>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                                {viewingTransaction.subscriptionFrequency === 'Weekly' && `Week ${viewingTransaction.forWeek}, ${viewingTransaction.forYear}`}
                                                {viewingTransaction.subscriptionFrequency === 'Yearly' && `Year ${viewingTransaction.forYear}`}
                                                {(viewingTransaction.subscriptionFrequency === 'Monthly' || !viewingTransaction.subscriptionFrequency) && `${viewingTransaction.forMonth}/${viewingTransaction.forYear}`}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {viewingTransaction.type === 'Offering' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Event/Service Name</label>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.eventName || '-'}</div>
                                    </div>
                                )}
                                {viewingTransaction.type === 'Donation' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Donor Name</label>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.donorName || '-'}</div>
                                    </div>
                                )}
                                {viewingTransaction.type === 'Property Rent' && (
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Rental Purpose</label>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{viewingTransaction.tenantPurpose || '-'}</div>
                                    </div>
                                )}

                            </div>

                            {viewingTransaction.notes && (
                                <div style={{ marginTop: '20px' }}>
                                    <label style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Internal Notes</label>
                                    <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', padding: '12px 16px', borderRadius: '9px', color: '#92400e', fontSize: '0.85rem' }}>
                                        {viewingTransaction.notes}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="acc-modal-footer">
                            <button className="btn btn-secondary" onClick={() => setViewingTransaction(null)}>Close Details</button>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                                Print Receipt
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Accounting;
