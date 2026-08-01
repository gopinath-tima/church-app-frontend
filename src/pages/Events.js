import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
const minutesList = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

const CATEGORY_COLORS = {
  'Service':      { bg: '#e8f4fd', color: '#2980b9' },
  'Fellowship':   { bg: '#eafaf1', color: '#27ae60' },
  'Youth':        { bg: '#fef9e7', color: '#f39c12' },
  'Conference':   { bg: '#f4ecf7', color: '#8e44ad' },
  'Outreach':     { bg: '#fdebd0', color: '#e67e22' },
  'Class':        { bg: '#e8f8f5', color: '#16a085' },
  'Children':     { bg: '#fdedec', color: '#e74c3c' },
  'Worship':      { bg: '#e8f4fd', color: '#2471a3' },
  'All Congregation': { bg: '#f0f3f4', color: '#5d6d7e' },
  'Men':          { bg: '#eaf2ff', color: '#2155cd' },
  'Women':        { bg: '#fce4ec', color: '#c2185b' },
  'Leadership':   { bg: '#e8f5e9', color: '#2e7d32' },
};

const getCategoryStyle = (cat) => CATEGORY_COLORS[cat] || { bg: '#f0f3f4', color: '#5d6d7e' };

function Events() {
  const [events, setEvents] = useState([]);
  const [currentTime] = useState(new Date());
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentEventId, setCurrentEventId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('listing'); // 'calendar' | 'listing'
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [teachers, setTeachers] = useState([]);

  const initialFormState = {
    title: '', description: '', startDate: '', endDate: '',
    location: '', organizer: '', targetAudience: 'All Congregation',
    teacherId: ''
  };
  const [formData, setFormData] = useState(initialFormState);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || localStorage.getItem("jwt") ||
      localStorage.getItem("jwtToken") || localStorage.getItem("authToken") || localStorage.getItem("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : null;
  };

  useEffect(() => { 
    fetchEvents(); 
    fetchTeachers();
  }, []);

  const fetchEvents = async () => {
    const headers = getAuthHeaders();
    if (!headers) { alert("Please log in to load events."); return; }
    try {
      const res = await axios.get('http://localhost:8081/api/events', { headers });
      setEvents(res.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) alert("Unauthorized. Please log in again.");
      else console.error("Error fetching events:", err);
    }
  };

  const fetchTeachers = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await axios.get('http://localhost:8081/api/sunday-school/teachers', { headers });
      setTeachers(res.data);
    } catch (err) {
      console.error("Error fetching Sunday School teachers:", err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const CustomDropdown = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{ position: "relative", display: "inline-block" }}>
        <div onClick={() => setIsOpen(!isOpen)} style={{ padding: "7px 10px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#fff", cursor: "pointer", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px", minWidth: "58px" }}>
          {value} <span style={{ fontSize: "9px", color: "#94a3b8" }}>▼</span>
        </div>
        {isOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 99 }} onClick={() => setIsOpen(false)} />
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", maxHeight: "150px", overflowY: "auto", background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 100, minWidth: "100%" }}>
              {options.map(opt => (
                <div key={opt} onClick={() => { onChange(opt); setIsOpen(false); }}
                  style={{ padding: "8px 12px", cursor: "pointer", fontSize: "13px", background: value === opt ? "#eff6ff" : "transparent", color: value === opt ? "#2563eb" : "#374151", fontWeight: value === opt ? "600" : "normal" }}
                  onMouseOver={(e) => { if (value !== opt) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseOut={(e) => { if (value !== opt) e.currentTarget.style.background = "transparent"; }}
                >{opt}</div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const parseDateTime = (isoString) => {
    if (!isoString) return { date: null, hour: '12', minute: '00', ampm: 'AM' };
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return { date: null, hour: '12', minute: '00', ampm: 'AM' };
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { date: d, hour: h.toString().padStart(2, '0'), minute: m, ampm };
  };

  const buildIsoString = (date, hour, minute, ampm) => {
    const d = date ? new Date(date) : new Date();
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    d.setHours(h, parseInt(minute, 10), 0, 0);
    return (new Date(d - d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const renderTimePicker = (dateString, fieldName, accentColor = '#10b981') => {
    const { date, hour, minute, ampm } = parseDateTime(dateString);
    const isStart = fieldName === 'startDate';
    const borderCol = isStart ? '#bbf7d0' : '#fed7aa';
    const focusCol  = isStart ? '#10b981' : '#f59e0b';
    const iconCol   = isStart ? '#16a34a' : '#ea580c';
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* Date input with calendar icon */}
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)",
            fontSize: "15px", pointerEvents: "none", zIndex: 1
          }}>📆</span>
          <DatePicker
            selected={date}
            onChange={(d) => setFormData({ ...formData, [fieldName]: buildIsoString(d, hour, minute, ampm) })}
            dateFormat="MMM d, yyyy"
            placeholderText="Select a date"
            className={isStart ? "custom-dp-start" : "custom-dp-end"}
          />
        </div>
        {/* Time row */}
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          background: "#fff", border: `1.5px solid ${borderCol}`,
          borderRadius: "10px", padding: "8px 12px"
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={iconCol} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <CustomDropdown value={hour} options={hoursList} onChange={(v) => setFormData({ ...formData, [fieldName]: buildIsoString(date, v, minute, ampm) })} />
          <span style={{ fontWeight: "700", color: "#94a3b8", fontSize: "16px", userSelect: "none" }}>:</span>
          <CustomDropdown value={minute} options={minutesList} onChange={(v) => setFormData({ ...formData, [fieldName]: buildIsoString(date, hour, v, ampm) })} />
          <CustomDropdown value={ampm} options={['AM', 'PM']} onChange={(v) => setFormData({ ...formData, [fieldName]: buildIsoString(date, hour, minute, v) })} />
        </div>
      </div>
    );
  };

  const handleAddNew = () => { setFormData(initialFormState); setIsEditMode(false); setCurrentEventId(null); setIsModalOpen(true); };
  const handleEdit = (event) => { setFormData({ ...event }); setIsEditMode(true); setCurrentEventId(event.eventId); setIsModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = getAuthHeaders();
    if (!headers) return alert("Please log in.");
    try {
      if (isEditMode) await axios.put(`http://localhost:8081/api/events/update/${currentEventId}`, formData, { headers });
      else await axios.post('http://localhost:8081/api/events/add', formData, { headers });
      setIsModalOpen(false);
      fetchEvents();
    } catch (err) { alert("Error saving event: " + (err.response?.data || err.message)); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event permanently?")) return;
    const headers = getAuthHeaders();
    if (!headers) { alert("Please log in."); return; }
    try {
      await axios.delete(`http://localhost:8081/api/events/delete/${id}`, { headers });
      fetchEvents();
    } catch (err) {
      const s = err.response?.status;
      if (s === 401 || s === 403) alert("Unauthorized.");
      else alert("Error deleting event.");
    }
  };

  const formatDate = (ds) => {
    if (!ds) return "TBA";
    return new Date(ds).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const formatTime = (ds) => {
    if (!ds) return "";
    return new Date(ds).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const upcomingEvents = events.filter(e => {
    const d = e.endDate ? new Date(e.endDate) : (e.startDate ? new Date(e.startDate) : new Date(8640000000000000));
    return d >= currentTime;
  });

  const pastEvents = events.filter(e => {
    const d = e.endDate ? new Date(e.endDate) : (e.startDate ? new Date(e.startDate) : new Date(8640000000000000));
    return d < currentTime;
  });

  const categories = ['All', ...new Set(events.map(e => e.targetAudience).filter(Boolean))];

  const filterEvents = (list) => activeFilter === 'All' ? list : list.filter(e => e.targetAudience === activeFilter);

  const EventCard = ({ event, isPast }) => {
    const catStyle = getCategoryStyle(event.targetAudience);
    return (
      <div
        onClick={() => setSelectedEvent(event)}
        style={{ background: "#fff", borderRadius: "14px", padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "10px", opacity: isPast ? 0.72 : 1, transition: "box-shadow 0.2s, transform 0.2s", cursor: "pointer" }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.11)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}
      >
        {/* Top Row: Badge + Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ background: catStyle.bg, color: catStyle.color, padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", letterSpacing: "0.2px" }}>
            {event.targetAudience}
          </span>
          <div style={{ display: "flex", gap: "4px" }}>
            <button onClick={(e) => { e.stopPropagation(); handleEdit(event); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px", padding: "4px 6px", borderRadius: "6px" }} title="Edit"
              onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={e => e.currentTarget.style.background = "none"}>✏️</button>
            <button onClick={(e) => { e.stopPropagation(); handleDelete(event.eventId); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: "14px", padding: "4px 6px", borderRadius: "6px" }} title="Delete"
              onMouseEnter={e => e.currentTarget.style.background = "#fee2e2"} onMouseLeave={e => e.currentTarget.style.background = "none"}>🗑️</button>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "17px", fontWeight: "700", lineHeight: "1.3", textDecoration: isPast ? "line-through" : "none" }}>{event.title}</h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "13px", lineHeight: "1.5", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.description}</p>
        </div>

        {/* Date / Time / Location */}
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginTop: "4px" }}>
          {event.startDate && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#475569", fontSize: "13px" }}>
              <span>📅</span> <span>{formatDate(event.startDate)}</span>
            </div>
          )}
          {event.startDate && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#475569", fontSize: "13px" }}>
              <span>🕐</span> <span>{formatTime(event.startDate)}</span>
            </div>
          )}
          {event.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "7px", color: "#475569", fontSize: "13px" }}>
              <span>📍</span> <span>{event.location}</span>
            </div>
          )}
        </div>

        {/* Divider + Registrants/Organizer */}
        <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "12px" }}>
            <span>👥</span> <span style={{ color: "#3b82f6", fontWeight: "600" }}>{event.organizer || "Church Admin"}</span>
          </span>
          <div style={{ width: "60px", height: "4px", borderRadius: "4px", background: "#e2e8f0", overflow: "hidden" }}>
            <div style={{ width: "60%", height: "100%", background: catStyle.color, borderRadius: "4px" }} />
          </div>
        </div>
      </div>
    );
  };

  const inputStyle = { width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", boxSizing: "border-box", fontSize: "14px", color: "#1e293b", outline: "none", fontFamily: "'Inter','Segoe UI',sans-serif", background: "#f8fafc", transition: "border-color 0.2s, background 0.2s" };
  const labelStyle = { fontWeight: "600", fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", marginBottom: "6px" };
  const fieldWrap = { marginBottom: "18px" };

  // ── Calendar helpers ─────────────────────────────────────────────
  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const prevMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday   = () => setCalendarDate(new Date());

  const buildCalendarDays = () => {
    const year  = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const first = new Date(year, month, 1).getDay();   // 0=Sun
    const total = new Date(year, month + 1, 0).getDate();
    const days  = [];
    for (let i = 0; i < first; i++) days.push(null);  // leading blanks
    for (let d = 1; d <= total; d++) days.push(d);
    // pad to complete last week row
    while (days.length % 7 !== 0) days.push(null);
    return days;
  };

  const eventsForDay = (day) => {
    if (!day) return [];
    const year  = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    return filterEvents([...upcomingEvents, ...pastEvents]).filter(ev => {
      const d = ev.startDate ? new Date(ev.startDate) : null;
      return d && d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  const isToday = (day) => {
    if (!day) return false;
    const now = new Date();
    return now.getFullYear() === calendarDate.getFullYear() &&
      now.getMonth() === calendarDate.getMonth() && now.getDate() === day;
  };

  // ── Calendar View Component ───────────────────────────────────────
  const CalendarView = () => {
    const days = buildCalendarDays();
    return (
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Main calendar */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>

          {/* Calendar toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
              {MONTHS[calendarDate.getMonth()]} {calendarDate.getFullYear()}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={prevMonth} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>‹</button>
              <button onClick={goToday} style={{ padding: '6px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#374151' }}>Today</button>
              <button onClick={nextMonth} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>›</button>
            </div>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
            {DAYS.map(d => (
              <div key={d} style={{ padding: '10px 0', textAlign: 'center', fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0.5px' }}>{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {days.map((day, idx) => {
              const dayEvents = eventsForDay(day);
              const today = isToday(day);
              return (
                <div key={idx} style={{ minHeight: '110px', padding: '8px 6px', borderRight: idx % 7 !== 6 ? '1px solid #f1f5f9' : 'none', borderBottom: '1px solid #f1f5f9', background: today ? '#fffbeb' : '#fff', position: 'relative' }}>
                  {day && (
                    <>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '50%', fontSize: '13px', fontWeight: today ? '800' : '500', color: today ? '#fff' : '#374151', background: today ? '#3b82f6' : 'transparent', marginBottom: '4px' }}>{day}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {dayEvents.slice(0, 3).map(ev => {
                          const cs = getCategoryStyle(ev.targetAudience);
                          return (
                            <div key={ev.eventId} onClick={() => setSelectedEvent(ev)}
                              title={ev.title}
                              style={{ background: cs.color, color: '#fff', fontSize: '11px', fontWeight: '600', padding: '2px 7px', borderRadius: '5px', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'opacity 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 3 && <span style={{ fontSize: '10px', color: '#64748b', paddingLeft: '4px' }}>+{dayEvents.length - 3} more</span>}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right sidebar – Calendars panel */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Calendars</span>
            </div>
            {/* Category legend */}
            {Object.entries(CATEGORY_COLORS).slice(0, 8).map(([cat, style]) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: style.color, flexShrink: 0, display: 'inline-block' }} />
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>{cat}</span>
              </div>
            ))}
            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>This Month</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>
                {eventsForDay(null) !== undefined && (() => {
                  const yr = calendarDate.getFullYear(), mo = calendarDate.getMonth();
                  return [...upcomingEvents, ...pastEvents].filter(ev => {
                    const d = ev.startDate ? new Date(ev.startDate) : null;
                    return d && d.getFullYear() === yr && d.getMonth() === mo;
                  }).length;
                })()}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>events scheduled</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '700', color: '#1e293b' }}>Events</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{upcomingEvents.length} upcoming events</p>
        </div>
        <button onClick={handleAddNew} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '14px', boxShadow: '0 2px 8px rgba(59,130,246,0.35)' }}
          onMouseEnter={e => e.currentTarget.style.background = '#2563eb'} onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}>
          <span style={{ fontSize: '16px' }}>+</span> Create Event
        </button>
      </div>

      {/* View toggle + Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Calendar / Listing toggle */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', gap: '2px' }}>
          <button onClick={() => setViewMode('calendar')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: viewMode === 'calendar' ? '#fff' : 'transparent', color: viewMode === 'calendar' ? '#1e293b' : '#64748b', boxShadow: viewMode === 'calendar' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📅 Calendar
          </button>
          <button onClick={() => setViewMode('listing')} style={{ padding: '7px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', background: viewMode === 'listing' ? '#fff' : 'transparent', color: viewMode === 'listing' ? '#1e293b' : '#64748b', boxShadow: viewMode === 'listing' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ☰ Listing
          </button>
        </div>

        {/* Category filter pills (listing only) */}
        {viewMode === 'listing' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveFilter(cat)} style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: activeFilter === cat ? '700' : '500', background: activeFilter === cat ? '#3b82f6' : '#f1f5f9', color: activeFilter === cat ? '#fff' : '#475569', transition: 'all 0.2s' }}>
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── CALENDAR VIEW ── */}
      {viewMode === 'calendar' && <CalendarView />}

      {/* ── LISTING VIEW ── */}
      {viewMode === 'listing' && (
        <>
          {/* Upcoming Events Grid */}
          {filterEvents(upcomingEvents).length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', margin: '40px 0', fontSize: '16px' }}>No upcoming events.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
              {filterEvents(upcomingEvents).map(event => <EventCard key={event.eventId} event={event} isPast={false} />)}
            </div>
          )}

          {/* Past Events Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px', margin: '36px 0 20px 0' }}>
            <h2 style={{ color: '#94a3b8', margin: 0, fontSize: '16px', fontWeight: '600' }}>Past Events</h2>
            <button onClick={() => setShowPastEvents(!showPastEvents)}
              style={{ padding: '7px 16px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
              {showPastEvents ? 'Hide ▲' : 'View ▼'}
            </button>
          </div>
          {showPastEvents && (
            filterEvents(pastEvents).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '15px' }}>No past events.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '20px' }}>
                {filterEvents(pastEvents).map(event => <EventCard key={event.eventId} event={event} isPast={true} />)}
              </div>
            )
          )}
        </>
      )}

      {/* ── Event Detail View Modal ── */}
      {selectedEvent && (() => {
        const ev = selectedEvent;
        const catStyle = getCategoryStyle(ev.targetAudience);
        const isPast = ev.endDate
          ? new Date(ev.endDate) < currentTime
          : ev.startDate ? new Date(ev.startDate) < currentTime : false;
        return (
          <div
            onClick={() => setSelectedEvent(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.65)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1100, backdropFilter: "blur(5px)", padding: "16px" }}
          >
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: "22px", width: "100%", maxWidth: "640px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 40px 100px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}>

              {/* Coloured header band */}
              <div style={{ background: `linear-gradient(135deg, ${catStyle.color}22 0%, ${catStyle.color}08 100%)`, borderBottom: `3px solid ${catStyle.color}30`, borderRadius: "22px 22px 0 0", padding: "28px 30px 22px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    {/* Category badge */}
                    <span style={{ background: catStyle.bg, color: catStyle.color, padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", letterSpacing: "0.4px", display: "inline-block", marginBottom: "12px" }}>
                      {ev.targetAudience}
                    </span>
                    <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#1e293b", lineHeight: "1.3", textDecoration: isPast ? "line-through" : "none" }}>
                      {ev.title}
                    </h2>
                    {isPast && <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", marginTop: "4px", display: "block" }}>📁 Past Event</span>}
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: "15px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "16px" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; }}
                  >✕</button>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "26px 30px 30px", display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Description */}
                {ev.description && (
                  <div style={{ background: "#f8fafc", borderRadius: "12px", padding: "16px 18px", borderLeft: `4px solid ${catStyle.color}` }}>
                    <p style={{ margin: 0, color: "#374151", fontSize: "14px", lineHeight: "1.7" }}>{ev.description}</p>
                  </div>
                )}

                {/* Info grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>

                  {/* Start */}
                  {ev.startDate && (
                    <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>🟢 Start</div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatDate(ev.startDate)}</div>
                      <div style={{ fontSize: "13px", color: "#16a34a", fontWeight: "600", marginTop: "3px" }}>{formatTime(ev.startDate)}</div>
                    </div>
                  )}

                  {/* End */}
                  {ev.endDate && (
                    <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "12px", padding: "14px 16px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>🔴 End</div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{formatDate(ev.endDate)}</div>
                      <div style={{ fontSize: "13px", color: "#ea580c", fontWeight: "600", marginTop: "3px" }}>{formatTime(ev.endDate)}</div>
                    </div>
                  )}

                  {/* Location */}
                  {ev.location && (
                    <div style={{ background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "12px", padding: "14px 16px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>📍 Location</div>
                      <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{ev.location}</div>
                    </div>
                  )}

                  {/* Organizer */}
                  <div style={{ background: "#faf5ff", border: "1.5px solid #e9d5ff", borderRadius: "12px", padding: "14px 16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: "700", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: "8px" }}>👤 Organizer</div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>{ev.organizer || "Church Admin"}</div>
                  </div>

                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                  <button
                    onClick={() => { setSelectedEvent(null); handleEdit(ev); }}
                    style={{ flex: 1, padding: "12px", background: "#f8fafc", color: "#374151", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                    onMouseLeave={e => e.currentTarget.style.background = "#f8fafc"}
                  >✏️ Edit Event</button>
                  <button
                    onClick={() => { setSelectedEvent(null); handleDelete(ev.eventId); }}
                    style={{ flex: 1, padding: "12px", background: "#fff1f2", color: "#e11d48", border: "1.5px solid #fecdd3", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#ffe4e6"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff1f2"}
                  >🗑️ Delete</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: "16px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", width: "100%", maxWidth: "920px", maxHeight: "92vh", overflowY: "auto", overflowX: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.25)", display: "flex", flexDirection: "column" }}>

            {/* Modal Header */}
            <div style={{ padding: "28px 32px 20px", borderBottom: "1.5px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg,#f8faff 0%,#fff 100%)", borderRadius: "20px 20px 0 0", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: isEditMode ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#3b82f6,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: isEditMode ? "0 4px 14px rgba(245,158,11,0.35)" : "0 4px 14px rgba(59,130,246,0.35)" }}>
                  {isEditMode ? "✏️" : "📅"}
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "#1e293b", fontSize: "20px", fontWeight: "800", letterSpacing: "-0.3px" }}>{isEditMode ? "Edit Event" : "Create New Event"}</h2>
                  <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px", marginTop: "2px" }}>{isEditMode ? "Update event details below" : "Fill in the details to publish your event"}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)}
                style={{ width: "36px", height: "36px", borderRadius: "10px", border: "none", background: "#f1f5f9", cursor: "pointer", fontSize: "15px", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                onMouseEnter={e => { e.currentTarget.style.background="#fee2e2"; e.currentTarget.style.color="#ef4444"; }}
                onMouseLeave={e => { e.currentTarget.style.background="#f1f5f9"; e.currentTarget.style.color="#64748b"; }}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: "0" }}>

              {/* Section: Basic Info */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(#3b82f6,#8b5cf6)" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.8px" }}>Event Information</span>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Event Title <span style={{ color: "#ef4444" }}>*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required
                  style={inputStyle} placeholder="e.g., Easter Sunday Celebration"
                  onFocus={e => { e.target.style.borderColor="#3b82f6"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(59,130,246,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                />
              </div>

              <div style={{ ...fieldWrap }}>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange}
                  style={{ ...inputStyle, height: "88px", resize: "vertical", lineHeight: "1.6" }}
                  placeholder="Describe the event — what to expect, what to bring, special notes..."
                  onFocus={e => { e.target.style.borderColor="#3b82f6"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(59,130,246,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                />
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 16px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(#10b981,#059669)" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.8px" }}>Date & Time</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "18px" }}>
                {/* Start */}
                <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px" }}>🟢</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px" }}>Start <span style={{ color: "#ef4444" }}>*</span></span>
                  </div>
                  {renderTimePicker(formData.startDate, 'startDate', '#10b981')}
                </div>
                {/* End */}
                <div style={{ background: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "12px", padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "13px" }}>🔴</span>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#ea580c", textTransform: "uppercase", letterSpacing: "0.5px" }}>End</span>
                  </div>
                  {renderTimePicker(formData.endDate, 'endDate', '#f59e0b')}
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 16px" }}>
                <div style={{ width: "3px", height: "18px", borderRadius: "2px", background: "linear-gradient(#f59e0b,#d97706)" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.8px" }}>Location & Organizer</span>
              </div>

              <div style={fieldWrap}>
                <label style={labelStyle}>Location</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none" }}>📍</span>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    style={{ ...inputStyle, paddingLeft: "38px" }} placeholder="e.g., Main Sanctuary, Room 201, Harbor Park"
                    onFocus={e => { e.target.style.borderColor="#f59e0b"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.12)"; }}
                    onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "18px" }}>
                <div>
                  <label style={labelStyle}>Organizer</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none" }}>👤</span>
                    <input type="text" name="organizer" value={formData.organizer} onChange={handleChange}
                      style={{ ...inputStyle, paddingLeft: "38px" }} placeholder="e.g., Pastor John"
                      onFocus={e => { e.target.style.borderColor="#f59e0b"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(245,158,11,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Category / Audience</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none", zIndex: 1 }}>🏷️</span>
                    <select name="targetAudience" value={formData.targetAudience} onChange={handleChange}
                      style={{ ...inputStyle, paddingLeft: "38px", appearance: "none", cursor: "pointer" }}
                      onFocus={e => { e.target.style.borderColor="#8b5cf6"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(139,92,246,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}>
                      {['All Congregation','Service','Fellowship','Youth','Children','Men','Women','Leadership','Conference','Outreach','Class','Worship'].map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#94a3b8", pointerEvents: "none" }}>▼</span>
                  </div>
                </div>
              </div>

              {/* Sunday School Teacher Dropdown (Only for Class category) */}
              {formData.targetAudience === 'Class' && (
                <div style={{ ...fieldWrap, marginBottom: "20px" }}>
                  <label style={labelStyle}>Sunday School Teacher <span style={{ color: "#ef4444" }}>*</span></label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", pointerEvents: "none", zIndex: 1 }}>👤</span>
                    <select name="teacherId" value={formData.teacherId || ''} onChange={handleChange} required
                      style={{ ...inputStyle, paddingLeft: "38px", appearance: "none", cursor: "pointer" }}
                      onFocus={e => { e.target.style.borderColor="#10b981"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(16,185,129,0.12)"; }}
                      onBlur={e => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}>
                      <option value="">Select Teacher</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <span style={{ position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)", fontSize: "11px", color: "#94a3b8", pointerEvents: "none" }}>▼</span>
                  </div>
                </div>
              )}

              {/* Category Preview Badge */}
              {formData.targetAudience && (
                <div style={{ marginBottom: "20px", padding: "10px 14px", background: getCategoryStyle(formData.targetAudience).bg, borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "13px" }}>✅</span>
                  <span style={{ fontSize: "13px", color: getCategoryStyle(formData.targetAudience).color, fontWeight: "600" }}>This event will be tagged as: <strong>{formData.targetAudience}</strong></span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "6px", paddingTop: "20px", borderTop: "1.5px solid #f1f5f9" }}>
                <button type="button" onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: "13px", background: "#f8fafc", color: "#475569", border: "1.5px solid #e2e8f0", borderRadius: "12px", fontWeight: "600", cursor: "pointer", fontSize: "14px", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#f1f5f9"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#f8fafc"; }}>
                  Cancel
                </button>
                <button type="submit"
                  style={{ flex: 2, padding: "13px", background: isEditMode ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#3b82f6,#2563eb)", color: "white", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: isEditMode ? "0 4px 14px rgba(245,158,11,0.4)" : "0 4px 14px rgba(59,130,246,0.4)", transition: "all 0.2s", letterSpacing: "0.2px" }}
                  onMouseEnter={e => { e.currentTarget.style.transform="translateY(-1px)"; e.currentTarget.style.boxShadow=isEditMode?"0 6px 20px rgba(245,158,11,0.5)":"0 6px 20px rgba(59,130,246,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isEditMode?"0 4px 14px rgba(245,158,11,0.4)":"0 4px 14px rgba(59,130,246,0.4)"; }}>
                  {isEditMode ? "💾 Save Changes" : "🚀 Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        /* Shared datepicker base */
        .custom-dp-start, .custom-dp-end {
          width: 100%;
          padding: 10px 12px 10px 38px;
          border-radius: 10px;
          font-size: 13.5px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          font-family: 'Inter','Segoe UI',sans-serif;
          color: #1e293b;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          box-sizing: border-box;
        }
        /* Start – green accent */
        .custom-dp-start {
          border: 1.5px solid #86efac;
          background: #f0fdf4;
        }
        .custom-dp-start:focus {
          border-color: #16a34a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(22,163,74,0.15);
        }
        /* End – orange accent */
        .custom-dp-end {
          border: 1.5px solid #fdba74;
          background: #fff7ed;
        }
        .custom-dp-end:focus {
          border-color: #ea580c;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(234,88,12,0.15);
        }

        /* Wrapper fills its parent column */
        .react-datepicker-wrapper { width: 100%; display: block; }
        .react-datepicker__input-container { width: 100%; }

        /* Calendar popup */
        .react-datepicker {
          border: 1px solid #e2e8f0 !important;
          border-radius: 16px !important;
          box-shadow: 0 16px 48px rgba(0,0,0,0.18) !important;
          font-family: 'Inter','Segoe UI',sans-serif !important;
          overflow: hidden;
        }
        .react-datepicker__header {
          background: #f8fafc !important;
          border-bottom: 1px solid #f1f5f9 !important;
          padding-top: 12px !important;
        }
        .react-datepicker__current-month {
          font-weight: 700 !important;
          color: #1e293b !important;
          font-size: 14px !important;
        }
        .react-datepicker__day-name { color: #64748b !important; font-weight: 600 !important; }
        .react-datepicker__day {
          border-radius: 8px !important;
          color: #374151 !important;
          font-weight: 500 !important;
        }
        .react-datepicker__day:hover { background: #eff6ff !important; color: #2563eb !important; }
        .react-datepicker__day--selected {
          background: linear-gradient(135deg,#3b82f6,#2563eb) !important;
          color: #fff !important;
          font-weight: 700 !important;
        }
        .react-datepicker__day--today { font-weight: 700 !important; color: #3b82f6 !important; }
        .react-datepicker__navigation-icon::before { border-color: #64748b !important; }
      `}</style>
    </div>
  );
}

export default Events;