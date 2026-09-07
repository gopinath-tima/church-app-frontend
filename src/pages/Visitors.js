import React, { useState } from 'react';
import axios from 'axios';
import './Visitors.css';

const Icon = ({ name, size = 18 }) => {
  const icons = {
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  };
  return (
    <span className="svg-icon" style={{ display: 'inline-flex', width: size, height: size }}>
      {icons[name] || null}
    </span>
  );
};

const Visitors = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    visitDate: new Date().toISOString().substring(0, 10),
    gender: 'Male',
    address: '',
    firstVisitNotes: '',
    status: 'Registered',
    convertedMemberId: null
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://church-back-gabqhtdphaeshbaf.westus3-01.azurewebsites.net/api/visitors', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMessage(`Successfully registered visitor: ${formData.firstName} ${formData.lastName}!`);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        visitDate: new Date().toISOString().substring(0, 10),
        gender: 'Male',
        address: '',
        firstVisitNotes: '',
        status: 'Registered',
        convertedMemberId: null
      });
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Failed to register visitor. Please try again.');
    }
  };

  return (
    <div className="visitors-page-container">
      {successMessage && (
        <div className="alert alert-success">
          <Icon name="check" size={20} className="alert-icon" />
          <span>{successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="alert alert-danger">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="visitors-registration-form glass-card">
        <div className="form-header-title">
          <h2>Register New Visitor</h2>
          <p>Fill out the profile fields below to create a new visitor profile record.</p>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>First Name*</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
              placeholder="Enter first name" 
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Enter last name" 
            />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="example@email.com" 
            />
          </div>
          <div className="form-group">
            <label>Phone Number*</label>
            <input 
              type="text" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              required 
              placeholder="Enter phone number" 
            />
          </div>
          <div className="form-group">
            <label>First Visit Date</label>
            <input 
              type="date" 
              name="visitDate" 
              value={formData.visitDate} 
              onChange={handleChange} 
            />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group full-width">
            <label>Home Address</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Street address, City, Zip code" 
            />
          </div>
          <div className="form-group full-width">
            <label>First Visit Notes</label>
            <textarea 
              name="firstVisitNotes" 
              rows="4" 
              value={formData.firstVisitNotes} 
              onChange={handleChange} 
              placeholder="Provide details about their first visit, how they found out about the church, family details, etc."
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Register Visitor
          </button>
        </div>
      </form>
    </div>
  );
};

export default Visitors;
