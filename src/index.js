import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './index.css';
import './responsive.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global Axios Interceptor for Multi-Tenancy
axios.interceptors.request.use(config => {
    const branchId = localStorage.getItem('selectedBranchId');
    if (branchId) {
        config.headers['X-Branch-Id'] = branchId;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
