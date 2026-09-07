import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
    const [demoForm, setDemoForm] = useState({ name: '', email: '', message: '' });
    const [navScrolled, setNavScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setNavScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDemoSubmit = (e) => {
        e.preventDefault();
        alert(`Thank you, ${demoForm.name}! Our team will contact you shortly at ${demoForm.email} to schedule your demo.`);
        setIsDemoModalOpen(false);
        setDemoForm({ name: '', email: '', message: '' });
    };

    return (
        <div className="landing-container">
            {/* Top Banner */}
            <div className="landing-top-banner">
                <span>✦</span> Try DivineArch Free — No Credit Card Required <span>✦</span>
            </div>

            {/* Navigation */}
            <nav className={`landing-nav ${navScrolled ? 'scrolled' : ''}`}>
                <Link to="/" className="landing-logo">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    DivineArch
                </Link>

                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#customers">Customers</a>
                    <a href="#resources">Resources</a>
                </div>

                <div className="landing-actions">
                    <Link to="/login" className="btn-login">Login</Link>
                    <button onClick={() => setIsDemoModalOpen(true)} className="btn-primary-hero">
                        Book a Demo
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="landing-hero">
                    <div className="hero-content">
                        <div className="hero-badge">THE NEW STANDARD FOR ChMS</div>
                        <h1>Church Management<br/><span>Simplified.</span></h1>
                        <p>
                            Focus less on administrative tasks and more on your people. DivineArch is the modern, intuitive platform built to help your ministry thrive.
                        </p>
                        <div className="hero-buttons">
                            <button onClick={() => setIsDemoModalOpen(true)} className="btn-cta">
                                Start Your Free Trial
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                            <button onClick={() => setIsDemoModalOpen(true)} className="btn-cta-ghost">
                                Watch Demo
                            </button>
                        </div>
                        <div className="hero-trust">
                            <div className="trust-avatars">
                                <div className="avatar a1"></div>
                                <div className="avatar a2"></div>
                                <div className="avatar a3"></div>
                                <div className="avatar a4"></div>
                            </div>
                            <span className="trust-text">Trusted by <strong>2,000+</strong> churches worldwide</span>
                        </div>
                    </div>

                    <div className="hero-image">
                        <div className="premium-mockup">
                            <div className="pm-header">
                                <div className="pm-dots">
                                    <div className="pm-dot r"></div>
                                    <div className="pm-dot y"></div>
                                    <div className="pm-dot g"></div>
                                </div>
                                <div className="pm-tab-bar">
                                    <span className="pm-tab active">Dashboard</span>
                                    <span className="pm-tab">People</span>
                                    <span className="pm-tab">Giving</span>
                                </div>
                            </div>
                            <div className="pm-body">
                                <div className="pm-sidebar">
                                    <div className="pm-brand">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                        </svg>
                                        <span>DivineArch</span>
                                    </div>
                                    <div className="pm-nav-item active">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                        Dashboard
                                    </div>
                                    <div className="pm-nav-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        People
                                    </div>
                                    <div className="pm-nav-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                        Giving
                                    </div>
                                    <div className="pm-nav-item">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                        Events
                                    </div>
                                </div>
                                <div className="pm-content">
                                    <div className="pm-top-stats">
                                        <div className="pm-stat-card">
                                            <div className="pm-stat-icon members">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                                            </div>
                                            <div className="pm-stat-info">
                                                <div className="pm-stat-title">Total Members</div>
                                                <div className="pm-stat-value">2,847</div>
                                            </div>
                                            <div className="pm-stat-badge up">+12%</div>
                                        </div>
                                        <div className="pm-stat-card">
                                            <div className="pm-stat-icon giving">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                            </div>
                                            <div className="pm-stat-info">
                                                <div className="pm-stat-title">Weekly Giving</div>
                                                <div className="pm-stat-value">$14,250</div>
                                            </div>
                                            <div className="pm-stat-badge up">+8%</div>
                                        </div>
                                        <div className="pm-stat-card">
                                            <div className="pm-stat-icon guests">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                                            </div>
                                            <div className="pm-stat-info">
                                                <div className="pm-stat-title">New Guests</div>
                                                <div className="pm-stat-value">34</div>
                                            </div>
                                            <div className="pm-stat-badge up">+5</div>
                                        </div>
                                    </div>
                                    <div className="pm-main-area">
                                        <div className="pm-chart-card">
                                            <div className="pm-chart-header">
                                                <div className="pm-chart-title">Attendance</div>
                                                <div className="pm-chart-period">This Month</div>
                                            </div>
                                            <div className="pm-chart-visual">
                                                <div className="pm-bar" style={{height: '60%'}}></div>
                                                <div className="pm-bar" style={{height: '75%'}}></div>
                                                <div className="pm-bar" style={{height: '55%'}}></div>
                                                <div className="pm-bar" style={{height: '85%'}}></div>
                                                <div className="pm-bar" style={{height: '70%'}}></div>
                                                <div className="pm-bar accent" style={{height: '92%'}}></div>
                                            </div>
                                        </div>
                                        <div className="pm-list-card">
                                            <div className="pm-list-title">Recent Activity</div>
                                            <div className="pm-list-item">
                                                <div className="pm-avatar a1"></div>
                                                <div className="pm-lines">
                                                    <div className="pm-line-text">Sarah J. donated $250</div>
                                                    <div className="pm-line-subtext">2 min ago</div>
                                                </div>
                                            </div>
                                            <div className="pm-list-item">
                                                <div className="pm-avatar a2"></div>
                                                <div className="pm-lines">
                                                    <div className="pm-line-text">Mark D. joined Youth Camp</div>
                                                    <div className="pm-line-subtext">15 min ago</div>
                                                </div>
                                            </div>
                                            <div className="pm-list-item">
                                                <div className="pm-avatar a3"></div>
                                                <div className="pm-lines">
                                                    <div className="pm-line-text">New family checked in</div>
                                                    <div className="pm-line-subtext">1 hr ago</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <section className="landing-social-proof">
                    <p className="social-proof-text">Trusted by leading churches</p>
                    <div className="social-proof-logos">
                        <span>Grace Fellowship</span>
                        <span>New Life Church</span>
                        <span>Hillside Community</span>
                        <span>The Rock Church</span>
                        <span>Calvary Chapel</span>
                        <span>Living Hope</span>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="landing-features">
                    <div className="features-header">
                        <div className="section-label">Features</div>
                        <h2>Everything your ministry needs, <br/><span>nothing it doesn't.</span></h2>
                        <p className="features-subtitle">Powerful tools designed specifically for churches. Simple enough for volunteers, robust enough for large congregations.</p>
                    </div>

                    {/* PEOPLE & CONTACTS */}
                    <div className="feature-category">
                        <div className="feature-category-label">People & Contacts</div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '220, 90%, 56%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                                    </svg>
                                </div>
                                <h3>Add Member</h3>
                                <p>Quickly onboard new members with smart forms, auto-complete, and instant profile creation.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '220, 80%, 52%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                </div>
                                <h3>People Directory</h3>
                                <p>A unified directory for all members. Smart search, custom fields, detailed profiles, and quick actions.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '260, 65%, 58%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                </div>
                                <h3>Families</h3>
                                <p>Link members into family units. View household details, manage relationships, and track family involvement.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '180, 60%, 45%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <h3>Visitor Directory</h3>
                                <p>Track first-time guests from their first visit to membership. Follow-up reminders and visitor profiles.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '200, 80%, 50%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
                                    </svg>
                                </div>
                                <h3>Groups</h3>
                                <p>Create and manage small groups, Bible studies, and serving teams with built-in scheduling and rosters.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                        </div>
                    </div>

                    {/* FINANCE & GIVING */}
                    <div className="feature-category">
                        <div className="feature-category-label">Finance & Giving</div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '150, 70%, 42%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                                    </svg>
                                </div>
                                <h3>Accounting</h3>
                                <p>Complete financial dashboard with transactions, contribution history, and comprehensive reporting.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '145, 65%, 40%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                    </svg>
                                </div>
                                <h3>Donations</h3>
                                <p>Manage tithes, offerings, and special donations. Track pledges, generate giving statements, and receipts.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '160, 55%, 45%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                </div>
                                <h3>Daily Contributions</h3>
                                <p>Record and track daily offerings and contributions. Instant summaries and batch processing.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '170, 50%, 48%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                    </svg>
                                </div>
                                <h3>Subscriptions</h3>
                                <p>Manage recurring giving plans and automated subscriptions with easy setup and member self-service.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '140, 45%, 50%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                    </svg>
                                </div>
                                <h3>Property Leases</h3>
                                <p>Track church property leases, rental agreements, and generate invoices for tenants and facilities.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                        </div>
                    </div>

                    {/* MINISTRY & WORSHIP */}
                    <div className="feature-category">
                        <div className="feature-category-label">Ministry & Worship</div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '270, 70%, 60%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                    </svg>
                                </div>
                                <h3>Events</h3>
                                <p>Schedule services, manage events, coordinate volunteers, and send automatic reminders with RSVP tracking.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '25, 85%, 55%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                </div>
                                <h3>Sunday School</h3>
                                <p>Manage classes, curriculum, student enrollment, and teacher assignments. Track progress and attendance.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '340, 75%, 55%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                    </svg>
                                </div>
                                <h3>Check-In System</h3>
                                <p>Secure child check-in, real-time attendance tracking, and safety alerts. Parents get peace of mind.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '290, 55%, 55%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                                    </svg>
                                </div>
                                <h3>Attendance Reports</h3>
                                <p>Visual attendance analytics, trend reports, and exportable data to understand engagement patterns.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                        </div>
                    </div>

                    {/* OPERATIONS */}
                    <div className="feature-category">
                        <div className="feature-category-label">Operations</div>
                        <div className="features-grid">
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '35, 90%, 55%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </div>
                                <h3>Communication</h3>
                                <p>Announcements, email broadcasts, SMS messaging, and sent logs — all from a single unified inbox.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '210, 70%, 52%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                                    </svg>
                                </div>
                                <h3>Documents</h3>
                                <p>Store, organize, and share church documents securely. Version control and role-based access.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '320, 60%, 52%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                    </svg>
                                </div>
                                <h3>Forms</h3>
                                <p>Create custom forms for registrations, surveys, and applications. Collect responses and export data.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '45, 75%, 50%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                                    </svg>
                                </div>
                                <h3>Asset Management</h3>
                                <p>Track church assets, equipment, and inventory. Manage assignments, maintenance schedules, and depreciation.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '0, 0%, 45%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l10 6.5v7L12 22 2 15.5v-7L12 2z"/>
                                    </svg>
                                </div>
                                <h3>Branch Management</h3>
                                <p>Manage multiple church locations from one platform. Separate data per branch with unified oversight.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                            <div className="feature-card">
                                <div className="feature-icon-wrap" style={{'--accent': '10, 70%, 50%'}}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
                                    </svg>
                                </div>
                                <h3>Log Management</h3>
                                <p>Full audit trail of all system activities. Track user actions, changes, and security events in real-time.</p>
                                <a href="#features" className="feature-link">Learn more →</a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="landing-stats">
                    <div className="stats-container">
                        <div className="stat-item">
                            <div className="stat-number">2,000+</div>
                            <div className="stat-label">Churches</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number">500K+</div>
                            <div className="stat-label">Members Managed</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number">$50M+</div>
                            <div className="stat-label">Donations Tracked</div>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                    </div>
                </section>

                {/* Testimonials */}
                <section id="customers" className="landing-testimonials">
                    <div className="section-label">Testimonials</div>
                    <h2>Loved by church leaders</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">"DivineArch completely transformed how we manage our congregation. It's so intuitive that our volunteers learned it in minutes."</p>
                            <div className="testimonial-author">
                                <div className="author-avatar pastor-d"></div>
                                <div className="author-info">
                                    <strong>Pastor David Miller</strong>
                                    <span>Lead Pastor, Grace Fellowship</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card featured">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">"The financial tools and reporting have saved us countless hours every week. Plus, giving has increased 23% since we switched."</p>
                            <div className="testimonial-author">
                                <div className="author-avatar sarah-j"></div>
                                <div className="author-info">
                                    <strong>Sarah Jenkins</strong>
                                    <span>Finance Director, New Life Church</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="testimonial-stars">★★★★★</div>
                            <p className="testimonial-quote">"The child check-in system gives our parents peace of mind, and the event scheduling keeps our ministries perfectly aligned."</p>
                            <div className="testimonial-author">
                                <div className="author-avatar michael-c"></div>
                                <div className="author-info">
                                    <strong>Michael Chang</strong>
                                    <span>Executive Pastor, Hillside Community</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="landing-cta">
                    <div className="cta-inner">
                        <h2>Ready to simplify your<br/>church management?</h2>
                        <p>Join thousands of churches already using DivineArch to focus on what matters most — your people.</p>
                        <div className="cta-actions">
                            <button onClick={() => setIsDemoModalOpen(true)} className="btn-cta-primary">
                                Start Free Trial
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                            <button onClick={() => setIsDemoModalOpen(true)} className="btn-cta-secondary">
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            DivineArch
                        </Link>
                        <p>The modern platform for<br/>growing ministries.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#integrations">Integrations</a>
                            <a href="#updates">Updates</a>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#careers">Careers</a>
                            <a href="#blog">Blog</a>
                            <a href="#press">Press</a>
                        </div>
                        <div className="footer-column">
                            <h4>Support</h4>
                            <a href="#help">Help Center</a>
                            <a href="#contact">Contact</a>
                            <a href="#privacy">Privacy</a>
                            <a href="#terms">Terms</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="copyright">&copy; {new Date().getFullYear()} DivineArch. All rights reserved.</p>
                    <div className="social-links">
                        <a href="#twitter" aria-label="Twitter">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a href="#facebook" aria-label="Facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                        <a href="#instagram" aria-label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                        </a>
                    </div>
                </div>
            </footer>

            {/* Demo Modal */}
            {isDemoModalOpen && (
                <div className="demo-modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsDemoModalOpen(false)}>
                    <div className="demo-modal">
                        <button className="demo-modal-close" onClick={() => setIsDemoModalOpen(false)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <div className="modal-badge">Get Started</div>
                        <h2>Let's talk</h2>
                        <p>See how DivineArch can simplify your church admin.</p>
                        
                        <form className="demo-form" onSubmit={handleDemoSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Jane Doe"
                                    value={demoForm.name}
                                    onChange={(e) => setDemoForm({...demoForm, name: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>Work Email</label>
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="jane@church.org"
                                    value={demoForm.email}
                                    onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                                />
                            </div>
                            <div className="form-group">
                                <label>How can we help? <span>(Optional)</span></label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Tell us a bit about your church..."
                                    value={demoForm.message}
                                    onChange={(e) => setDemoForm({...demoForm, message: e.target.value})}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-submit">
                                Request Demo
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Landing;
