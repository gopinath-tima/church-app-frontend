import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  CheckSquare, 
  Plus, Edit2, Trash2, X, Calendar, UserCheck, TrendingUp
} from "lucide-react";
import "./SundaySchool.css";

const API_BASE = "http://localhost:8081/api/sunday-school";

export default function SundaySchool() {
  const [activeTab, setActiveTab] = useState("dashboard");

  // App States
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: { Authorization: `Bearer ${token}` }
    };
  };

  // Load Data from APIs
  const loadData = async () => {
    try {
      setErrorMsg("");
      const [resClasses, resTeachers, resStudents, resAttendance] = await Promise.all([
        axios.get(`${API_BASE}/classes`, getHeaders()),
        axios.get(`${API_BASE}/teachers`, getHeaders()),
        axios.get(`${API_BASE}/students`, getHeaders()),
        axios.get(`${API_BASE}/attendance`, getHeaders())
      ]);
      setClasses(resClasses.data);
      setTeachers(resTeachers.data);
      setStudents(resStudents.data);
      setAttendance(resAttendance.data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to backend server. Make sure the API service is running.");
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // CRUD handlers calling backend APIs
  const handleSaveClass = async (cls) => {
    try {
      const res = await axios.post(`${API_BASE}/classes`, cls, getHeaders());
      if (cls.id) {
        setClasses(classes.map(c => c.id === cls.id ? res.data : c));
      } else {
        setClasses([...classes, res.data]);
      }
    } catch (err) {
      alert("Error saving class");
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await axios.delete(`${API_BASE}/classes/${id}`, getHeaders());
      setClasses(classes.filter(c => c.id !== id));
    } catch (err) {
      alert("Error deleting class");
    }
  };

  const handleSaveTeacher = async (teacher) => {
    try {
      const res = await axios.post(`${API_BASE}/teachers`, teacher, getHeaders());
      if (teacher.id) {
        setTeachers(teachers.map(t => t.id === teacher.id ? res.data : t));
      } else {
        setTeachers([...teachers, res.data]);
      }
    } catch (err) {
      alert("Error saving teacher");
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      await axios.delete(`${API_BASE}/teachers/${id}`, getHeaders());
      setTeachers(teachers.filter(t => t.id !== id));
    } catch (err) {
      alert("Error deleting teacher");
    }
  };

  const handleSaveStudent = async (student) => {
    try {
      const res = await axios.post(`${API_BASE}/students`, student, getHeaders());
      if (student.id) {
        setStudents(students.map(s => s.id === student.id ? res.data : s));
      } else {
        setStudents([...students, res.data]);
      }
    } catch (err) {
      alert("Error saving student");
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      await axios.delete(`${API_BASE}/students/${id}`, getHeaders());
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      alert("Error deleting student");
    }
  };

  const handleSaveAttendance = async (att) => {
    try {
      const res = await axios.post(`${API_BASE}/attendance`, att, getHeaders());
      const existingIdx = attendance.findIndex(a => a.id === att.id || (a.date === att.date && a.classId === att.classId));
      if (existingIdx > -1) {
        const updated = [...attendance];
        updated[existingIdx] = res.data;
        setAttendance(updated);
      } else {
        setAttendance([...attendance, res.data]);
      }
    } catch (err) {
      alert("Error saving attendance logs");
    }
  };

  const handleDeleteAttendance = async (id) => {
    try {
      await axios.delete(`${API_BASE}/attendance/${id}`, getHeaders());
      setAttendance(attendance.filter(a => a.id !== id));
    } catch (err) {
      alert("Error deleting attendance log");
    }
  };



  return (
    <div className="ss-container ss-theme">
      <div className="ss-header">
        <div className="ss-header-title">
          <h1>Sunday School Management</h1>
          <p>Classes, Teachers, Students & Attendance</p>
        </div>
        <button className="ss-btn ss-btn-secondary" onClick={loadData}>Reload Data</button>
      </div>

      {errorMsg && (
        <div style={{ padding: "12px 20px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid var(--color-danger)", color: "var(--color-danger)", borderRadius: "8px", marginBottom: "20px" }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Tabs navigation */}
      <div className="ss-tabs-bar">
        <button className={`ss-tab-btn ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
          <LayoutDashboard size={18} /> Dashboard
        </button>
        <button className={`ss-tab-btn ${activeTab === "classes" ? "active" : ""}`} onClick={() => setActiveTab("classes")}>
          <GraduationCap size={18} /> Classes
        </button>
        <button className={`ss-tab-btn ${activeTab === "teachers" ? "active" : ""}`} onClick={() => setActiveTab("teachers")}>
          <Users size={18} /> Teachers
        </button>
        <button className={`ss-tab-btn ${activeTab === "students" ? "active" : ""}`} onClick={() => setActiveTab("students")}>
          <Users size={18} /> Students
        </button>
        <button className={`ss-tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
          <CheckSquare size={18} /> Attendance
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "dashboard" && (
        <DashboardTab classes={classes} teachers={teachers} students={students} attendance={attendance} onTabChange={setActiveTab} />
      )}
      {activeTab === "classes" && (
        <ClassesTab classes={classes} onSave={handleSaveClass} onDelete={handleDeleteClass} teachers={teachers} students={students} />
      )}
      {activeTab === "teachers" && (
        <TeachersTab teachers={teachers} onSave={handleSaveTeacher} onDelete={handleDeleteTeacher} classes={classes} />
      )}
      {activeTab === "students" && (
        <StudentsTab students={students} onSave={handleSaveStudent} onDelete={handleDeleteStudent} classes={classes} />
      )}
      {activeTab === "attendance" && (
        <AttendanceTab attendance={attendance} onSave={handleSaveAttendance} onDelete={handleDeleteAttendance} classes={classes} students={students} />
      )}
    </div>
  );
}

// ==================== DASHBOARD TAB ====================
function DashboardTab({ classes, teachers, students, attendance, onTabChange }) {
  const totalStudents = students.length;
  const totalClasses = classes.length;
  const totalTeachers = teachers.length;

  let averageAttendanceRate = 0;
  if (attendance.length > 0) {
    const totalPossible = attendance.reduce((acc, curr) => {
      const classStudentsCount = students.filter(s => s.classId === curr.classId).length;
      return acc + classStudentsCount;
    }, 0);
    const totalActual = attendance.reduce((acc, curr) => acc + (curr.presentStudentIds ? curr.presentStudentIds.length : 0), 0);
    averageAttendanceRate = totalPossible > 0 ? Math.round((totalActual / totalPossible) * 100) : 0;
  }

  const attendanceByDate = attendance.reduce((acc, curr) => {
    const date = curr.date;
    if (!acc[date]) acc[date] = { date, present: 0, possible: 0 };
    const classStudentsCount = students.filter(s => s.classId === curr.classId).length;
    acc[date].possible += classStudentsCount;
    acc[date].present += curr.presentStudentIds ? curr.presentStudentIds.length : 0;
    return acc;
  }, {});

  const trendData = Object.values(attendanceByDate)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(item => ({
      date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      Rate: item.possible > 0 ? Math.round((item.present / item.possible) * 100) : 0
    }));

  const chart2Title = "Student Enrollment & Latest Attendance";
  const chart2Data = classes.map(cls => {
    const enrolledCount = students.filter(s => s.classId === cls.id).length;
    // Find latest attendance log for this class
    const classLogs = attendance.filter(a => Number(a.classId) === Number(cls.id));
    const latestLog = classLogs.length > 0
      ? classLogs.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;
    const presentCount = latestLog && latestLog.presentStudentIds
      ? latestLog.presentStudentIds.length
      : 0;

    return {
      name: cls.name.split(" (")[0],
      enrolled: enrolledCount,
      present: presentCount
    };
  });

  return (
    <div>
      {/* Dashboard Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#111827", margin: 0 }}>
          Sunday School Overview
        </h3>
      </div>

      <div className="ss-grid-cols-4" style={{ marginBottom: "32px" }}>
        {/* Card 1: Students */}
        <div className="ss-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(99, 102, 241, 0.1)", color: "var(--color-primary)", padding: "16px", borderRadius: "12px" }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>Total Students</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", marginBottom: 0, color: "#111827" }}>{totalStudents}</h3>
          </div>
        </div>

        {/* Card 2: Classes */}
        <div className="ss-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--color-info)", padding: "16px", borderRadius: "12px" }}>
            <GraduationCap size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>Total Classes</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", marginBottom: 0, color: "#111827" }}>{totalClasses}</h3>
          </div>
        </div>

        {/* Card 3: Teachers */}
        <div className="ss-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--color-accent)", padding: "16px", borderRadius: "12px" }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>Teachers</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", marginBottom: 0, color: "#111827" }}>{totalTeachers}</h3>
          </div>
        </div>

        {/* Card 4: Avg Attendance */}
        <div className="ss-card" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--color-success)", padding: "16px", borderRadius: "12px" }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", fontWeight: "500", margin: 0 }}>Avg Attendance</p>
            <h3 style={{ fontSize: "1.75rem", fontWeight: "700", marginTop: "4px", marginBottom: 0, color: "#111827" }}>{averageAttendanceRate}%</h3>
          </div>
        </div>
      </div>

      <div className="ss-grid-cols-2" style={{ marginBottom: "32px" }}>
        {/* Custom SVG Attendance Area Chart */}
        <div className="ss-card">
          <h4 style={{ fontSize: "1.1rem", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px", color: "#111827", marginTop: 0 }}>
            <Calendar size={18} style={{ color: "var(--color-primary)" }} /> Attendance Trends (%)
          </h4>
          <div style={{ width: "100%", height: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            {trendData.length > 0 ? (
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <svg width="100%" height="80%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ss-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="30" x2="100" y2="30" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="0" y1="70" x2="100" y2="70" stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="2" />
                  
                  {(() => {
                    const scaleY = (rate) => 100 - (rate * 0.8 + 10);
                    
                    const trendPoints = trendData.length === 1
                      ? `0,${scaleY(trendData[0].Rate)} 100,${scaleY(trendData[0].Rate)}`
                      : trendData.map((d, index) => {
                          const x = (index / Math.max(1, trendData.length - 1)) * 100;
                          const y = scaleY(d.Rate);
                          return `${x},${y}`;
                        }).join(" ");

                    const areaPoints = trendData.length === 1
                      ? `0,90 0,${scaleY(trendData[0].Rate)} 100,${scaleY(trendData[0].Rate)} 100,90`
                      : `0,90 ${trendPoints} 100,90`;

                    return (
                      <>
                        <polygon points={areaPoints} fill="url(#ss-area-grad)" />
                        <polyline points={trendPoints} fill="none" stroke="#6366f1" strokeWidth="2.5" />
                      </>
                    );
                  })()}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "8px" }}>
                  {trendData.map((d, idx) => (
                    <span key={idx}>{d.date} ({d.Rate}%)</span>
                  ))}
                </div>
              </div>
            ) : <div style={{ textAlign: "center", color: "var(--text-secondary)", paddingTop: "80px" }}>No data logs found.</div>}
          </div>
        </div>

        {/* Custom HTML Bar Distribution */}
        <div className="ss-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h4 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "8px", color: "#111827", margin: 0 }}>
              <GraduationCap size={18} style={{ color: "var(--color-info)" }} /> {chart2Title}
            </h4>
            <div style={{ display: "flex", gap: "12px", fontSize: "0.75rem", fontWeight: "600" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "#6366f1", borderRadius: "2px" }} />
                <span style={{ color: "var(--text-secondary)" }}>Enrolled</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "10px", height: "10px", backgroundColor: "#10b981", borderRadius: "2px" }} />
                <span style={{ color: "var(--text-secondary)" }}>Present</span>
              </div>
            </div>
          </div>
          <div style={{ width: "100%", height: 260, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            {chart2Data.length > 0 ? (
              <div style={{ display: "flex", height: "80%", alignItems: "flex-end", gap: "16px", justifyContent: "space-around" }}>
                {chart2Data.map((item, index) => {
                  const maxVal = Math.max(...chart2Data.map(d => Math.max(d.enrolled, d.present)), 1);
                  const pctEnrolled = (item.enrolled / maxVal) * 100;
                  const pctPresent = (item.present / maxVal) * 100;
                  return (
                    <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "75%", justifyContent: "center", width: "100%" }}>
                        {/* Enrolled Column */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "0.75rem", color: "#374151", fontWeight: "600", marginBottom: "4px" }}>{item.enrolled}</span>
                          <div style={{
                            width: "20px",
                            height: `${pctEnrolled}%`,
                            backgroundColor: "#6366f1",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.3s ease"
                          }} />
                        </div>
                        {/* Present Column */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: "0.75rem", color: "#374151", fontWeight: "600", marginBottom: "4px" }}>{item.present}</span>
                          <div style={{
                            width: "20px",
                            height: `${pctPresent}%`,
                            backgroundColor: "#10b981",
                            borderRadius: "4px 4px 0 0",
                            transition: "height 0.3s ease"
                          }} />
                        </div>
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "8px", textOverflow: "ellipsis", whiteSpace: "nowrap", overflow: "hidden", width: "100%", textAlign: "center", fontWeight: "600", textTransform: "capitalize" }} title={item.name}>
                        {item.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--text-secondary)", paddingTop: "80px", height: "100%" }}>
                No records found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ss-card">
        <h4 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#111827", marginTop: 0 }}>Quick Sunday School Actions</h4>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button className="ss-btn ss-btn-secondary" onClick={() => onTabChange("students")} style={{ flex: 1, minWidth: "150px" }}>
            <Users size={16} /> Manage Students
          </button>
          <button className="ss-btn ss-btn-secondary" onClick={() => onTabChange("teachers")} style={{ flex: 1, minWidth: "150px" }}>
            <Users size={16} /> Manage Teachers
          </button>
          <button className="ss-btn ss-btn-secondary" onClick={() => onTabChange("classes")} style={{ flex: 1, minWidth: "150px" }}>
            <GraduationCap size={16} /> Configure Classes
          </button>
          <button className="ss-btn ss-btn-secondary" onClick={() => onTabChange("attendance")} style={{ flex: 1, minWidth: "150px" }}>
            <UserCheck size={16} /> Mark Attendance
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== CLASSES TAB ====================
function ClassesTab({ classes, onSave, onDelete, teachers, students }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({ name: "", room: "", time: "", description: "", teacherId: "" });
  const [selectedRosterClass, setSelectedRosterClass] = useState(null);

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({ name: "", room: "", time: "", description: "", teacherId: teachers[0]?.id || "" });
    setIsModalOpen(true);
  };

  const openEditModal = (cls) => {
    setEditingClass(cls);
    setFormData({ name: cls.name, room: cls.room, time: cls.time, description: cls.description, teacherId: cls.teacherId || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...formData, teacherId: formData.teacherId ? Number(formData.teacherId) : null };
    if (editingClass) {
      onSave({ ...editingClass, ...payload });
    } else {
      onSave(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3>Classrooms & Schedules</h3>
        <button className="ss-btn ss-btn-primary" onClick={openAddModal}><Plus size={16} /> Add Class</button>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 2, minWidth: "300px" }}>
          <div className="ss-grid-cols-2" style={{ gap: "20px" }}>
            {classes.map(cls => (
              <div key={cls.id} className="ss-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", border: selectedRosterClass?.id === cls.id ? "1px solid var(--color-primary)" : "1px solid var(--border-color)" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "1.1rem" }}>{cls.name}</h3>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => openEditModal(cls)}><Edit2 size={14} /></button>
                      <button style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }} onClick={() => onDelete(cls.id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "12px" }}>{cls.description}</p>
                  <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span>📍 {cls.room}</span>
                    <span>⏰ {cls.time}</span>
                    <span>👤 Teacher: {teachers.find(t => t.id === cls.teacherId)?.name || "Unassigned"}</span>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "12px" }}>
                  <span className="ss-badge ss-badge-info">{students.filter(s => s.classId === cls.id).length} Students</span>
                  <button className="ss-btn ss-btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }} onClick={() => setSelectedRosterClass(cls)}>Roster</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedRosterClass && (
          <div style={{ flex: 1, minWidth: "260px" }} className="ss-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h4>Roster: {selectedRosterClass.name}</h4>
              <button style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }} onClick={() => setSelectedRosterClass(null)}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {students.filter(s => s.classId === selectedRosterClass.id).map(student => (
                <div key={student.id} style={{ padding: "10px", background: "rgba(0,0,0,0.02)", borderRadius: "6px" }}>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{student.name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Age: {student.age} | Parent: {student.parentName}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="ss-modal-overlay">
          <div className="ss-modal-content">
            <div className="ss-modal-header">
              <h2>{editingClass ? "Edit Class" : "Create Class"}</h2>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ss-modal-body">
                <div className="ss-form-group">
                  <label className="ss-form-label">Name</label>
                  <input type="text" className="ss-form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Room</label>
                  <input type="text" className="ss-form-input" required value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Time</label>
                  <input type="text" className="ss-form-input" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Description</label>
                  <textarea className="ss-form-textarea" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Teacher</label>
                  <select className="ss-form-select" value={formData.teacherId} onChange={e => setFormData({ ...formData, teacherId: e.target.value })}>
                    <option value="">Select Teacher</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="ss-modal-footer">
                <button type="button" className="ss-btn ss-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="ss-btn ss-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TEACHERS TAB ====================
function TeachersTab({ teachers, onSave, onDelete, classes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", bio: "" });

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({ name: "", email: "", phone: "", bio: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTeacher(t);
    setFormData({ name: t.name, email: t.email, phone: t.phone, bio: t.bio });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeacher) {
      onSave({ ...editingTeacher, ...formData });
    } else {
      onSave(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3>Teachers Directory</h3>
        <button className="ss-btn ss-btn-primary" onClick={openAddModal}><Plus size={16} /> Add Teacher</button>
      </div>

      <div className="ss-grid-cols-3">
        {teachers.map(t => (
          <div key={t.id} className="ss-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <div>
                  <h4 style={{ fontWeight: "600" }}>{t.name}</h4>
                  <span className="ss-badge ss-badge-success" style={{ marginTop: "4px" }}>Instructor</span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => openEditModal(t)}><Edit2 size={14} /></button>
                  <button style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }} onClick={() => onDelete(t.id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", fontStyle: "italic", marginBottom: "12px" }}>"{t.bio}"</p>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-color)", paddingTop: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <span>✉️ {t.email}</span>
                <span>📞 {t.phone}</span>
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "12px", marginTop: "12px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              Classes: {classes.filter(c => c.teacherId === t.id).map(c => c.name.split(" (")[0]).join(", ") || "None"}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="ss-modal-overlay">
          <div className="ss-modal-content">
            <div className="ss-modal-header">
              <h2>{editingTeacher ? "Edit Profile" : "Register Teacher"}</h2>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ss-modal-body">
                <div className="ss-form-group">
                  <label className="ss-form-label">Full Name</label>
                  <input type="text" className="ss-form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Email</label>
                  <input type="email" className="ss-form-input" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Phone</label>
                  <input type="text" className="ss-form-input" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Bio</label>
                  <textarea className="ss-form-textarea" rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
                </div>
              </div>
              <div className="ss-modal-footer">
                <button type="button" className="ss-btn ss-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="ss-btn ss-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== STUDENTS TAB ====================
function StudentsTab({ students, onSave, onDelete, classes }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [formData, setFormData] = useState({ name: "", age: "", parentName: "", parentPhone: "", classId: "" });

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: "", age: "", parentName: "", parentPhone: "", classId: classes[0]?.id || "" });
    setIsModalOpen(true);
  };

  const openEditModal = (s) => {
    setEditingStudent(s);
    setFormData({ name: s.name, age: s.age, parentName: s.parentName, parentPhone: s.parentPhone, classId: s.classId || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      age: parseInt(formData.age, 10),
      classId: formData.classId ? Number(formData.classId) : null
    };
    if (editingStudent) {
      onSave({ ...editingStudent, ...payload });
    } else {
      onSave(payload);
    }
    setIsModalOpen(false);
  };

  const filtered = students.filter(s => {
    const sClassIdStr = s.classId ? String(s.classId) : "";
    const filterClassStr = filterClass ? String(filterClass) : "";
    const matchClass = !filterClass || sClassIdStr === filterClassStr;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.parentName.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h3>Enrolled Students</h3>
        <button className="ss-btn ss-btn-primary" onClick={openAddModal}><Plus size={16} /> Enroll Student</button>
      </div>

      <div className="ss-card" style={{ display: "flex", gap: "16px", marginBottom: "24px", padding: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input type="text" placeholder="Search students..." className="ss-form-input" style={{ flex: 1, minWidth: "200px" }} value={search} onChange={e => setSearch(e.target.value)} />
        <select className="ss-form-select" style={{ width: "200px" }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="ss-table-container desktop-only">
        <table className="ss-custom-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Class</th>
              <th>Parent</th>
              <th>Phone</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: "600" }}>{s.name}</td>
                <td>{s.age}</td>
                <td><span className="ss-badge ss-badge-info">{classes.find(c => c.id === s.classId)?.name || "Unassigned"}</span></td>
                <td>{s.parentName}</td>
                <td>{s.parentPhone}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                    <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => openEditModal(s)}><Edit2 size={14} /></button>
                    <button style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }} onClick={() => onDelete(s.id)}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ss-mobile-list mobile-only">
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "20px" }}>
            No students found.
          </div>
        ) : (
          filtered.map(s => (
            <div key={s.id} className="ss-mobile-card">
              <div className="ss-mobile-card-header">
                <div>
                  <h4 className="ss-mobile-card-title">{s.name}</h4>
                  <p className="ss-mobile-card-subtitle">Class: {classes.find(c => c.id === s.classId)?.name || "Unassigned"}</p>
                </div>
                <span className="ss-badge ss-badge-info">Age: {s.age}</span>
              </div>
              <div className="ss-mobile-card-body">
                <div className="ss-mobile-card-row">
                  <span className="ss-mobile-label">Parent</span>
                  <span className="ss-mobile-value">{s.parentName}</span>
                </div>
                <div className="ss-mobile-card-row">
                  <span className="ss-mobile-label">Phone</span>
                  <span className="ss-mobile-value">{s.parentPhone}</span>
                </div>
              </div>
              <div className="ss-mobile-card-actions">
                <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => openEditModal(s)}><Edit2 size={16} /></button>
                <button style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }} onClick={() => onDelete(s.id)}><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="ss-modal-overlay">
          <div className="ss-modal-content">
            <div className="ss-modal-header">
              <h2>{editingStudent ? "Modify Student details" : "Enroll Student"}</h2>
              <button style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }} onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="ss-modal-body">
                <div className="ss-form-group">
                  <label className="ss-form-label">Student Name</label>
                  <input type="text" className="ss-form-input" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Age</label>
                  <input type="number" className="ss-form-input" required value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Parent Name</label>
                  <input type="text" className="ss-form-input" required value={formData.parentName} onChange={e => setFormData({ ...formData, parentName: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Parent Phone</label>
                  <input type="text" className="ss-form-input" required value={formData.parentPhone} onChange={e => setFormData({ ...formData, parentPhone: e.target.value })} />
                </div>
                <div className="ss-form-group">
                  <label className="ss-form-label">Class</label>
                  <select className="ss-form-select" value={formData.classId} onChange={e => setFormData({ ...formData, classId: e.target.value })}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="ss-modal-footer">
                <button type="button" className="ss-btn ss-btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="ss-btn ss-btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== ATTENDANCE TAB ====================
function AttendanceTab({ attendance, onSave, onDelete, classes, students }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [checkedIds, setCheckedIds] = useState([]);
  const [isTaking, setIsTaking] = useState(false);

  // Synchronize and initialize selectedClass when classes load or change
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes, selectedClass]);

  const classStudents = students.filter(s => s.classId === Number(selectedClass));

  const startChecking = () => {
    const existing = attendance.find(a => a.date === date && Number(a.classId) === Number(selectedClass));
    setCheckedIds(existing ? existing.presentStudentIds : []);
    setIsTaking(true);
  };

  const toggleStudent = (id) => {
    setCheckedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };

  const handleSave = () => {
    const existing = attendance.find(a => a.date === date && Number(a.classId) === Number(selectedClass));
    const payload = {
      id: existing ? existing.id : null,
      date,
      classId: Number(selectedClass),
      presentStudentIds: checkedIds
    };
    onSave(payload);
    setIsTaking(false);
  };

  // Find the selected class name for display in the checklist title
  const selectedClassName = classes.find(c => Number(c.id) === Number(selectedClass))?.name || "Class";

  return (
    <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
      <div className="ss-card" style={{ flex: 1.5, minWidth: "300px" }}>
        {!isTaking ? (
          <div>
            <h4>Take Weekly Attendance</h4>
            <div className="ss-form-group" style={{ marginTop: "16px" }}>
              <label className="ss-form-label">Class</label>
              <select className="ss-form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="ss-form-group">
              <label className="ss-form-label">Date</label>
              <input type="date" className="ss-form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <button className="ss-btn ss-btn-primary" style={{ width: "100%" }} onClick={startChecking} disabled={!selectedClass}>Begin Checklist</button>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h4>Check-In: {selectedClassName}</h4>
              <span className="ss-badge ss-badge-info">{checkedIds.length} Present</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", margin: "16px 0", maxHeight: "250px", overflowY: "auto" }}>
              {classStudents.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "30px 10px" }}>
                  <p style={{ margin: 0, fontSize: "0.95rem" }}>No students enrolled in this class.</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.8rem", opacity: 0.8 }}>Assign students to this class in the "Students" tab.</p>
                </div>
              ) : (
                classStudents.map(s => {
                  const isChecked = checkedIds.includes(s.id);
                  return (
                    <div key={s.id} onClick={() => toggleStudent(s.id)} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: isChecked ? "rgba(16, 185, 129, 0.05)" : "rgba(0,0,0,0.02)", border: isChecked ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid var(--border-color)", borderRadius: "6px", cursor: "pointer" }}>
                      <span>{s.name}</span>
                      <span>{isChecked ? "✅ Present" : "⬜ Absent"}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border-color)", paddingTop: "12px" }}>
              <button className="ss-btn ss-btn-secondary" style={{ flex: 1 }} onClick={() => setIsTaking(false)}>Back</button>
              <button className="ss-btn ss-btn-primary" style={{ flex: 1.5 }} onClick={handleSave}>Save Logs</button>
            </div>
          </div>
        )}
      </div>

      <div className="ss-card" style={{ flex: 1.2, minWidth: "300px" }}>
        <h4>Recent Attendance Logs</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px", maxHeight: "350px", overflowY: "auto" }}>
          {attendance.map(log => {
            const count = students.filter(s => s.classId === log.classId).length;
            const rate = count > 0 ? Math.round(((log.presentStudentIds ? log.presentStudentIds.length : 0) / count) * 100) : 0;
            return (
              <div key={log.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px", background: "rgba(0,0,0,0.02)", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <div>
                  <p style={{ fontWeight: "600", fontSize: "0.9rem" }}>{classes.find(c => c.id === log.classId)?.name.split(" (")[0]}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>{log.date} • {log.presentStudentIds ? log.presentStudentIds.length : 0}/{count} students</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className={`ss-badge ${rate >= 75 ? "ss-badge-success" : "ss-badge-warning"}`}>{rate}%</span>
                  <button style={{ background: "none", border: "none", color: "var(--color-danger)", cursor: "pointer" }} onClick={() => onDelete(log.id)}><Trash2 size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


