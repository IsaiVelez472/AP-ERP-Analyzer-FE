// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { initPreline } from './utils/preline';

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

// Initialize Preline UI components
document.addEventListener('DOMContentLoaded', () => {
  initPreline();
});
