import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckIn.css';

const CheckIn = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [roster, setRoster] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Fetch all events to populate the dropdown
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:8081/api/events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter events so only today's events are shown in the dropdown
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysEvents = response.data.filter(ev => ev.startDate && ev.startDate.startsWith(todayStr));
        
        setEvents(todaysEvents);
        if(todaysEvents.length > 0) {
          setSelectedEventId(todaysEvents[0].eventId);
        } else {
          setSelectedEventId("");
        }
      } catch (err) {
        console.error("Error fetching events", err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch Roster when event changes
  useEffect(() => {
    if(!selectedEventId) return;
    
    const fetchRoster = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:8081/api/attendance/event/${selectedEventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRoster(response.data);
      } catch(err) {
        console.error("Error fetching roster", err);
      }
    };
    fetchRoster();
  }, [selectedEventId]);

  // Handle Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(`http://localhost:8081/api/attendance/search?query=${searchQuery}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSearchResults(response.data);
        } catch(err) {
          console.error("Error searching", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleCheckIn = async (memberId) => {
    if(!selectedEventId) {
        alert("Please select an event first!");
        return;
    }
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`http://localhost:8081/api/attendance/checkin?memberId=${memberId}&eventId=${selectedEventId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Add to top of roster
      setRoster([response.data, ...roster]);
      setSearchQuery(""); // Clear search to be ready for next person
      setSearchResults([]);
    } catch(err) {
      alert(err.response?.data || "Error checking in");
    }
  };

  const formatTime = (isoString) => {
    if(!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="checkin-dashboard">
      <div className="checkin-header">
        <h1>Live Check-In</h1>
        <p>Select an event and search for members to log their attendance.</p>
      </div>

      <div className="checkin-layout">
        <div className="checkin-panel">
          <div className="panel-title">Check-In Station</div>
          
          <div className="form-group">
            <label className="form-label">1. Select Event / Service</label>
            <select 
                className="checkin-select"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {events.map(ev => (
                <option key={ev.eventId} value={ev.eventId}>{ev.title} ({ev.startDate})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">2. Search Member (Name, Phone, or ID)</label>
            <input 
                type="text"
                className="checkin-input"
                placeholder="Start typing..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="search-results">
            {isSearching && <p>Searching...</p>}
            {searchResults.map(member => (
                <div key={member.memberId} className="search-result-item">
                    <div>
                        <div className="member-name">{member.firstName} {member.lastName}</div>
                        <div className="member-meta">{member.contactNumber} | ID: {member.customMemberId}</div>
                    </div>
                    <button 
                        className="checkin-btn"
                        onClick={() => handleCheckIn(member.memberId)}
                    >
                        Check In
                    </button>
                </div>
            ))}
          </div>
        </div>

        <div className="checkin-panel">
          <div className="panel-title">Live Roster</div>
          {roster.length === 0 ? (
            <div className="empty-state">No one checked in yet.</div>
          ) : (
            <ul className="roster-list">
              {roster.map(entry => (
                <li key={entry.id} className="roster-item">
                  <div className="roster-avatar">
                    {entry.firstName?.charAt(0)}{entry.lastName?.charAt(0)}
                  </div>
                  <div>
                    <div className="member-name">{entry.firstName} {entry.lastName}</div>
                    <div className="time-stamp">Checked in at {formatTime(entry.checkInTime)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
