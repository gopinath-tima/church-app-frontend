import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");

    // State for collapsible menus
    const [openMenus, setOpenMenus] = useState({
        contacts: true,
        contributions: false,
        accounting: true,
        communication: false
    });

    const toggleMenu = (menu) => {
        setOpenMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    // Don't show the sidebar on the login screen
    if (!token || location.pathname === '/login' || location.pathname === '/') return null;

    let roles = [];
    let username = "User";
    try {
        const decoded = jwtDecode(token);
        roles = decoded.roles || [];
        let rawUsername = decoded.sub || decoded.username || "User";
        username = rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1).toLowerCase();
    } catch (err) {
        return null;
    }

    const isAdmin = roles.some(r => ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(r));

    const adminLinks = [];
    if (roles.includes("SUPER_PLUS_ADMIN")) adminLinks.push({ path: "/super-plus-admin", name: "Super Plus Admin", icon: <><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"/></> });
    if (roles.includes("SUPER_ADMIN")) adminLinks.push({ path: "/super-admin", name: "Super Admin", icon: <><path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"/></> });
    if (roles.includes("ADMIN")) adminLinks.push({ path: "/admin", name: "Admin Panel", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></> });
    if (roles.includes("SUPER_PLUS_ADMIN") || roles.includes("SUPER_ADMIN")) adminLinks.push({ path: "/logs", name: "Log Management", icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="9"></line><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="15" y2="17"></line></> });
    if (isAdmin || roles.includes("ADD_MEMBER")) adminLinks.push({ path: "/add-member", name: "Add Member", icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M21 8v6"/><path d="M24 11h-6"/><circle cx="8" cy="7" r="4"/></> });

    const moduleLinks = [];
    if (isAdmin || roles.includes("INVENTORY")) moduleLinks.push({ path: "/assets", name: "Assets", icon: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></> });
    if (isAdmin || roles.includes("COMMUNICATION")) moduleLinks.push({ path: "/communication", name: "Communication", icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></> });
    if (isAdmin || roles.includes("DOCUMENTS")) moduleLinks.push({ path: "/documents", name: "Documents", icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> });

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
        if (onClose) onClose();
    };

    // Generic Icon SVG Component
    const Icon = ({ path, className = "" }) => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`nav-icon ${className}`}>
            {path}
        </svg>
    );

    const ChevronIcon = ({ isOpen }) => (
        <svg 
            width="14" height="14" 
            viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" strokeWidth="2.5" 
            strokeLinecap="round" strokeLinejoin="round" 
            className={`chevron-icon ${isOpen ? 'open' : ''}`}
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );

    const handleNavigation = () => {
        if (onClose) onClose();
    };

    return (
        <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="sidebar-logo-icon">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>ChurchApp</span>
                </div>
                {onClose && (
                    <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-menu-category">MAIN</div>
                <Link to="/home" className={`sidebar-nav-item ${location.pathname === '/home' ? 'active' : ''}`} onClick={handleNavigation}>
                    <Icon path={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} />
                    <span>Home</span>
                </Link>

                {/* Contacts Collapsible */}
                {(isAdmin || roles.includes("CONTACTS")) && (
                <div className={`sidebar-collapsible ${openMenus.contacts ? 'is-open' : ''}`}>
                    <div className="sidebar-nav-item collapsible-header" onClick={() => toggleMenu('contacts')}>
                        <Icon path={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />
                        <span>Contacts</span>
                        <ChevronIcon isOpen={openMenus.contacts} />
                    </div>
                    <div className="sidebar-sub-menu">
                        <Link to="/people" className={`sidebar-sub-item ${location.pathname === '/people' ? 'active' : ''}`} onClick={handleNavigation}>
                            People
                        </Link>
                        <Link to="/families" className={`sidebar-sub-item ${location.pathname === '/families' ? 'active' : ''}`} onClick={handleNavigation}>
                            Families
                        </Link>
                        <Link to="/visitors-list" className={`sidebar-sub-item ${location.pathname === '/visitors-list' ? 'active' : ''}`} onClick={handleNavigation}>
                            Visitor Directory
                        </Link>
                    </div>
                </div>
                )}

                {/* Accounting Collapsible */}
                {(isAdmin || roles.includes("ACCOUNTING")) && (
                <div className={`sidebar-collapsible ${openMenus.accounting ? 'is-open' : ''}`}>
                    <div className="sidebar-nav-item collapsible-header" onClick={() => toggleMenu('accounting')}>
                        <Icon path={<><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></>} />
                        <span>Accounting</span>
                        <ChevronIcon isOpen={openMenus.accounting} />
                    </div>
                    <div className="sidebar-sub-menu">
                        <Link to="/accounting?tab=transactions" className={`sidebar-sub-item ${location.pathname === '/accounting' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'transactions') ? 'active' : ''}`} onClick={handleNavigation}>
                            Transactions
                        </Link>
                        <Link to="/accounting?tab=dashboard" className={`sidebar-sub-item ${location.search.includes('tab=dashboard') ? 'active' : ''}`} onClick={handleNavigation}>
                            Dashboard
                        </Link>
                        <Link to="/accounting?tab=history" className={`sidebar-sub-item ${location.search.includes('tab=history') ? 'active' : ''}`} onClick={handleNavigation}>
                            Contribution History
                        </Link>
                        <Link to="/accounting?tab=subscriptions" className={`sidebar-sub-item ${location.search.includes('tab=subscriptions') ? 'active' : ''}`} onClick={handleNavigation}>
                            Subscriptions
                        </Link>
                        <Link to="/donations" className={`sidebar-sub-item ${location.pathname === '/donations' ? 'active' : ''}`} onClick={handleNavigation}>
                            Manage Donations
                        </Link>
                    </div>
                </div>
                )}

                {/* Groups */}
                {(isAdmin || roles.includes("GROUPS")) && (
                <Link to="/groups" className={`sidebar-nav-item ${location.pathname === '/groups' ? 'active' : ''}`} onClick={handleNavigation}>
                    <Icon path={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />
                    <span>Groups</span>
                </Link>
                )}

                {/* Events */}
                {(isAdmin || roles.includes("EVENTS")) && (
                <Link to="/events" className={`sidebar-nav-item ${location.pathname === '/events' ? 'active' : ''}`} onClick={handleNavigation}>
                    <Icon path={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />
                    <span>Events</span>
                </Link>
                )}

                {/* Forms */}
                {(isAdmin || roles.includes("FORMS")) && (
                <Link to="/forms" className={`sidebar-nav-item ${location.pathname === '/forms' ? 'active' : ''}`} onClick={handleNavigation}>
                    <Icon path={<><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>} />
                    <span>Forms</span>
                </Link>
                )}

                {/* Ministry Section */}
                {(isAdmin || roles.includes("MINISTRY")) && (
                <>
                    <div className="sidebar-menu-category" style={{marginTop: '16px'}}>MINISTRY</div>
                    <Link to="/check-in" className={`sidebar-nav-item ${location.pathname === '/check-in' ? 'active' : ''}`} onClick={handleNavigation}>
                        <Icon path={<><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>} />
                        <span>Check-In</span>
                    </Link>
                    <Link to="/attendance-reports" className={`sidebar-nav-item ${location.pathname === '/attendance-reports' ? 'active' : ''}`} onClick={handleNavigation}>
                        <Icon path={<><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>} />
                        <span>Attendance Reports</span>
                    </Link>
                    <Link to="/sunday-school" className={`sidebar-nav-item ${location.pathname === '/sunday-school' ? 'active' : ''}`} onClick={handleNavigation}>
                        <Icon path={<><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></>} />
                        <span>Sunday School</span>
                    </Link>
                </>
                )}

                {/* Admin Links */}
                {adminLinks.length > 0 && (
                    <>
                        <div className="sidebar-menu-category" style={{marginTop: '16px'}}>MANAGEMENT</div>
                        {adminLinks.map(link => (
                            <Link key={link.path} to={link.path} className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`} onClick={handleNavigation}>
                                <Icon path={link.icon} />
                                <span>{link.name}</span>
                            </Link>
                        ))}
                    </>
                )}

                {/* Module Links */}
                {moduleLinks.length > 0 && (
                    <>
                        <div className="sidebar-menu-category" style={{marginTop: '16px'}}>MODULES</div>
                        {moduleLinks.map(link => {
                            if (link.name === 'Communication') {
                                return (
                                    <div key="communication" className={`sidebar-collapsible ${openMenus.communication ? 'is-open' : ''}`}>
                                        <div className="sidebar-nav-item collapsible-header" onClick={() => toggleMenu('communication')}>
                                            <Icon path={link.icon} />
                                            <span>{link.name}</span>
                                            <ChevronIcon isOpen={openMenus.communication} />
                                        </div>
                                        <div className="sidebar-sub-menu">
                                            <Link to="/communication?tab=announcements" className={`sidebar-sub-item ${location.pathname === '/communication' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'announcements') ? 'active' : ''}`} onClick={handleNavigation}>
                                                Announcement Board
                                            </Link>
                                            <Link to="/communication?tab=broadcast" className={`sidebar-sub-item ${location.pathname === '/communication' && location.search.includes('tab=broadcast') ? 'active' : ''}`} onClick={handleNavigation}>
                                                Send Broadcast
                                            </Link>
                                            <Link to="/communication?tab=logs" className={`sidebar-sub-item ${location.pathname === '/communication' && location.search.includes('tab=logs') ? 'active' : ''}`} onClick={handleNavigation}>
                                                Sent Logs
                                            </Link>
                                            <Link to="/communication?tab=alerts" className={`sidebar-sub-item ${location.pathname === '/communication' && location.search.includes('tab=alerts') ? 'active' : ''}`} onClick={handleNavigation}>
                                                System Alerts
                                            </Link>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <Link key={link.path} to={link.path} className={`sidebar-nav-item ${location.pathname === link.path ? 'active' : ''}`} onClick={handleNavigation}>
                                    <Icon path={link.icon} />
                                    <span>{link.name}</span>
                                </Link>
                            );
                        })}
                    </>
                )}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-profile">
                    <div className="profile-avatar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{username}</span>
                    </div>
                </div>

                <button className="sidebar-logout" onClick={handleLogout}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
