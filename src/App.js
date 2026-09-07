import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "./App.css";

// Components
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import BranchSelector from "./components/BranchSelector";

import Home from "./pages/Home";
import Landing from "./pages/Landing";

// Admin Pages
import SuperPlusAdmin from "./pages/SuperPlusAdmin";
import SuperAdmin from "./pages/SuperAdmin";
import Admin from "./pages/Admin";
import LogManagement from "./pages/LogManagement";

// Module Pages
import Communication from "./pages/Communication";
import AddMember from "./pages/AddMember"; // ✅ Imported the new page
import People from "./pages/People";
import Families from "./pages/Families";
import Events from "./pages/Events";
import Accounting from "./pages/Accounting";
import Assets from "./pages/Assets"; // ✅ Imported Asset Management
import Leases from "./pages/Leases";
import DailyContributions from "./pages/DailyContributions";
import Donations from "./pages/Donations";
import Documents from "./pages/Documents";
import Forms from "./pages/Forms"; // ✅ Added Forms import
import Groups from "./pages/Groups";
import CheckIn from "./pages/CheckIn";
import AttendanceReports from "./pages/AttendanceReports";
import Visitors from "./pages/Visitors";
import VisitorList from "./pages/VisitorList";
import VisitorProfile from "./pages/VisitorProfile";
import SundaySchool from "./pages/SundaySchool"; // ✅ Added Sunday School import
import Branches from "./pages/Branches"; // ✅ Added Branches import

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const roles = decoded.roles || [];
    const isAdmin = roles.some(r => ["SUPER_PLUS_ADMIN", "SUPER_ADMIN", "ADMIN"].includes(r));
    
    if (isAdmin || allowedRoles.some(r => roles.includes(r))) {
      return children;
    }
    return <Navigate to="/home" replace />;
  } catch (err) {
    return <Navigate to="/login" replace />;
  }
};

function AppContent() {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAuthPage = !token || location.pathname === '/login' || location.pathname === '/';

  return (
    <div className={`app-container ${isAuthPage ? 'auth-layout' : ''}`}>
      {!isAuthPage && (
        <>
          <div className="mobile-header">
            <button className="hamburger-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="mobile-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="sidebar-logo-icon">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>ChurchApp</span>
            </div>
            <div style={{ width: '40px' }}></div> {/* Spacer to keep logo centered */}
          </div>
          <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
        </>
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="main-content">
        {/* Branch Selector was moved to Home.js per user request */}
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />

          {/* Admin Routes */}
          <Route path="/super-plus-admin" element={<SuperPlusAdmin />} />
          <Route path="/super-admin" element={<SuperAdmin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/logs" element={<ProtectedRoute allowedRoles={["SUPER_PLUS_ADMIN", "SUPER_ADMIN"]}><LogManagement /></ProtectedRoute>} />
          <Route path="/branches" element={<ProtectedRoute allowedRoles={["SUPER_PLUS_ADMIN", "SUPER_ADMIN"]}><Branches /></ProtectedRoute>} />

          {/* Module Routes */}
          <Route path="/communication" element={<ProtectedRoute allowedRoles={["COMMUNICATION"]}><Communication /></ProtectedRoute>} />

          {/* ✅ Added the new routes here */}
          <Route path="/add-member" element={<ProtectedRoute allowedRoles={["ADD_MEMBER"]}><AddMember /></ProtectedRoute>} />
          <Route path="/people" element={<ProtectedRoute allowedRoles={["CONTACTS"]}><People /></ProtectedRoute>} />
          <Route path="/families" element={<ProtectedRoute allowedRoles={["CONTACTS"]}><Families /></ProtectedRoute>} />
          <Route path="/events" element={<ProtectedRoute allowedRoles={["EVENTS"]}><Events /></ProtectedRoute>} />
          <Route path="/accounting" element={<ProtectedRoute allowedRoles={["ACCOUNTING"]}><Accounting /></ProtectedRoute>} />
          <Route path="/assets" element={<ProtectedRoute allowedRoles={["INVENTORY"]}><Assets /></ProtectedRoute>} />
          <Route path="/leases" element={<ProtectedRoute allowedRoles={["ACCOUNTING"]}><Leases /></ProtectedRoute>} />
          <Route path="/daily-contributions" element={<ProtectedRoute allowedRoles={["ACCOUNTING"]}><DailyContributions /></ProtectedRoute>} />
          <Route path="/donations" element={<ProtectedRoute allowedRoles={["ACCOUNTING"]}><Donations /></ProtectedRoute>} />
          <Route path="/documents" element={<ProtectedRoute allowedRoles={["DOCUMENTS"]}><Documents /></ProtectedRoute>} />
          <Route path="/forms" element={<ProtectedRoute allowedRoles={["FORMS"]}><Forms /></ProtectedRoute>} />
          <Route path="/groups" element={<ProtectedRoute allowedRoles={["GROUPS"]}><Groups /></ProtectedRoute>} />
          <Route path="/check-in" element={<ProtectedRoute allowedRoles={["MINISTRY"]}><CheckIn /></ProtectedRoute>} />
          <Route path="/attendance-reports" element={<ProtectedRoute allowedRoles={["MINISTRY"]}><AttendanceReports /></ProtectedRoute>} />
          <Route path="/sunday-school" element={<ProtectedRoute allowedRoles={["MINISTRY"]}><SundaySchool /></ProtectedRoute>} />
          <Route path="/visitors" element={<ProtectedRoute allowedRoles={["CONTACTS"]}><Visitors /></ProtectedRoute>} />
          <Route path="/visitors-list" element={<ProtectedRoute allowedRoles={["CONTACTS"]}><VisitorList /></ProtectedRoute>} />
          <Route path="/visitor-profile/:id" element={<ProtectedRoute allowedRoles={["CONTACTS"]}><VisitorProfile /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;