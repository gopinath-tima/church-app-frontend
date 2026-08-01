import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AttendanceReports.css';

const AttendanceReports = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    // Fetch all events (historical and future)
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Sort events so most recent ones are at the top
        const sortedEvents = response.data.sort((a, b) => {
          if(!a.startDate) return 1;
          if(!b.startDate) return -1;
          return new Date(b.startDate) - new Date(a.startDate);
        });
        
        setEvents(sortedEvents);
      } catch (err) {
        console.error("Error fetching events", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if(!selectedEvent) return;
    
    const fetchRoster = async () => {
      setLoadingRoster(true);
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8081/api/attendance/event/${selectedEvent.eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoster(response.data);
      } catch(err) {
        console.error("Error fetching roster", err);
      } finally {
        setLoadingRoster(false);
      }
    };
    fetchRoster();
  }, [selectedEvent]);

  const formatTime = (isoString) => {
    if(!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString) => {
    if(!isoString) return "No date";
    const date = new Date(isoString);
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="report-dashboard">
      <div className="report-header">
        <h1>Attendance Reports</h1>
        <p>Review headcounts and rosters for all past and present events.</p>
      </div>

      <div className="report-layout">
        
        {/* Left Sidebar - Event Selection */}
        <div className="report-panel">
          <div className="panel-title">Select Event</div>
          {loadingEvents ? (
             <p className="empty-state">Loading events...</p>
          ) : events.length === 0 ? (
             <p className="empty-state">No events found.</p>
          ) : (
             <ul className="event-list">
               {events.map(ev => (
                 <li 
                   key={ev.eventId} 
                   className={`event-item ${selectedEvent?.eventId === ev.eventId ? 'active' : ''}`}
                   onClick={() => setSelectedEvent(ev)}
                 >
                   <div className="event-title">{ev.title}</div>
                   <div className="event-date">{formatDate(ev.startDate)}</div>
                 </li>
               ))}
             </ul>
          )}
        </div>

        {/* Right Panel - Report Data */}
        <div className="report-panel">
          {!selectedEvent ? (
             <div className="empty-state" style={{margin: 'auto'}}>Select an event from the list to view its attendance report.</div>
          ) : (
            <>
              <div className="panel-title">{selectedEvent.title} - Attendance Report</div>
              
              <div className="attendance-stats-banner">
                 <div className="stats-label">Total Headcount</div>
                 <div className="stats-count">{loadingRoster ? "..." : roster.length}</div>
              </div>

              <div className="report-roster">
                 <div className="panel-title" style={{fontSize: '1.1rem', borderBottom: 'none'}}>Checked-In Roster</div>
                 
                 {loadingRoster ? (
                   <p className="empty-state">Loading roster...</p>
                 ) : roster.length === 0 ? (
                   <p className="empty-state">No attendance records found for this event.</p>
                 ) : (
                   <ul className="report-roster-list">
                     {roster.map(entry => (
                       <li key={entry.id} className="report-roster-item">
                         <div>
                           <div className="report-roster-name">{entry.firstName} {entry.lastName}</div>
                           <div className="report-roster-id">ID: {entry.customMemberId || 'N/A'}</div>
                         </div>
                         <div className="report-roster-time">
                           {formatTime(entry.checkInTime)}
                         </div>
                       </li>
                     ))}
                   </ul>
                 )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default AttendanceReports;
