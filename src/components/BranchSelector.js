import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BranchSelector.css';

const BranchSelector = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranchId, setSelectedBranchId] = useState(localStorage.getItem('selectedBranchId') || '');

    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [assignedBranchId, setAssignedBranchId] = useState(null);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const { jwtDecode } = await import('jwt-decode');
                const decoded = jwtDecode(token);
                const roles = decoded.roles || [];
                const isSuper = roles.includes("SUPER_ADMIN") || roles.includes("SUPER_PLUS_ADMIN");
                setIsSuperAdmin(isSuper);
                
                if (decoded.branchId) {
                    setAssignedBranchId(decoded.branchId.toString());
                    // Force the assigned branch id into local storage if they are not super admin
                    if (!isSuper) {
                        localStorage.setItem('selectedBranchId', decoded.branchId.toString());
                        setSelectedBranchId(decoded.branchId.toString());
                    }
                }

                // Don't send X-Branch-Id for this specific request otherwise we might get filtered
                const res = await axios.get('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/branches', {
                    headers: { 
                        Authorization: `Bearer ${token}`
                        // We intentionally do not pass X-Branch-Id here
                    }
                });
                const fetchedBranches = Array.isArray(res.data) ? res.data : [];
                setBranches(fetchedBranches);

                // If no branch is selected but we have branches, auto-select the first active one (for super admins)
                if (isSuper && !localStorage.getItem('selectedBranchId') && fetchedBranches.length > 0) {
                    const activeBranch = fetchedBranches.find(b => b.status === "ACTIVE") || fetchedBranches[0];
                    if (activeBranch && activeBranch.id) {
                        handleSelectBranch(activeBranch.id.toString());
                    }
                }
            } catch (error) {
                console.error("Failed to fetch branches for selector", error);
            }
        };

        fetchBranches();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectBranch = (branchId) => {
        setSelectedBranchId(branchId);
        if (branchId) {
            localStorage.setItem('selectedBranchId', branchId);
        } else {
            localStorage.removeItem('selectedBranchId');
        }
        
        // Reload to apply new branch filter globally
        window.location.reload();
    };

    if (!isSuperAdmin) {
        const assignedBranch = branches.find(b => b.id.toString() === assignedBranchId);
        return (
            <div className="branch-selector-container">
                <label className="branch-selector-label">Current Branch</label>
                <div className="branch-selector-dropdown" style={{ cursor: 'default', backgroundColor: '#e2e8f0', borderColor: '#cbd5e1' }}>
                    {assignedBranch ? assignedBranch.name : 'No Branch Assigned'}
                </div>
            </div>
        );
    }

    return (
        <div className="branch-selector-container">
            <label className="branch-selector-label">Current Branch</label>
            <select 
                className="branch-selector-dropdown"
                value={selectedBranchId}
                onChange={(e) => handleSelectBranch(e.target.value)}
            >
                <option value="">-- All Branches --</option>
                {branches.length === 0 && <option disabled>No branches available</option>}
                {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                        {branch.name} {branch.location ? `(${branch.location})` : ''}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default BranchSelector;
