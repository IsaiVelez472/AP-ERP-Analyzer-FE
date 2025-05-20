// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import React, { useState, useEffect, useRef } from 'react';
import { reinitPreline } from '../../../utils/preline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import Plotly from window global
const Plotly = window.Plotly;

function Administrativos() {
  const [accountsData, setAccountsData] = useState(null);
  const [receivablesData, setReceivablesData] = useState(null);
  const [payablesData, setPayablesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Reference to the main container for PDF export
  const reportContainerRef = useRef(null);

  // Define the API URL with a fallback in case the environment variable is not available
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5002';

  useEffect(() => {
    // Reinitialize Preline components when the component mounts
    reinitPreline();
    
    // Function to fetch accounts data
    const fetchAccountsData = async () => {
      try {
        setLoading(true);
        console.log('Fetching accounts data from API URL:', API_URL);
        
        // Fetch general accounts data
        const accountsResponse = await fetch(`${API_URL}/api/kpis/accounts`);
        if (!accountsResponse.ok) {
          throw new Error(`Error ${accountsResponse.status}: Could not fetch accounts data`);
        }
        const accountsResult = await accountsResponse.json();
        
        // Fetch accounts receivable data
        const receivablesResponse = await fetch(`${API_URL}/api/kpis/accounts/receivable`);
        if (!receivablesResponse.ok) {
          throw new Error(`Error ${receivablesResponse.status}: Could not fetch accounts receivable data`);
        }
        const receivablesResult = await receivablesResponse.json();
        
        // Fetch accounts payable data
        const payablesResponse = await fetch(`${API_URL}/api/kpis/accounts/payable`);
        if (!payablesResponse.ok) {
          throw new Error(`Error ${payablesResponse.status}: Could not fetch accounts payable data`);
        }
        const payablesResult = await payablesResponse.json();
        
        setAccountsData(accountsResult);
        setReceivablesData(receivablesResult);
        setPayablesData(payablesResult);
        setLoading(false);
      } catch (err) {
        handleApiError(err);
      }
    };
    
    fetchAccountsData();
  }, []);
  
  // Effect to create charts when data is available
  useEffect(() => {
    if (accountsData && receivablesData && payablesData && !loading) {
      // Create charts with Plotly
      createReceivablesPayablesChart();
      createStackedAreaChart();
    }
  }, [accountsData, receivablesData, payablesData, loading]);
  
  // Handle API errors without using hardcoded mocks
  const handleApiError = (error) => {
    console.error('Error fetching data:', error);
    setError(`Error loading data: ${error.message}. Please verify that the server is running at ${API_URL}.`);
    setLoading(false);
  };
  
  // Function to format large numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    
    // For very large numbers (trillions)
    if (Math.abs(num) >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    }
    // For large numbers (billions)
    else if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    // For millions
    else if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    // For thousands
    else if (Math.abs(num) >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    // For small numbers
    else {
      return num.toFixed(2);
    }
  };
  
  // Function to get color based on value (positive/negative)
  const getValueColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  // Function to get trend (↑/↓) based on value
  const getTrend = (value) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '';
  };
  
  // References for Plotly charts
  const receivablesPayablesChartRef = useRef(null);
  const stackedAreaChartRef = useRef(null);
  const radarChartRef = useRef(null);
  
  // Function to format period string (e.g., '2024-02' to 'February 2024')
  const formatPeriod = (periodStr) => {
    const [year, month] = periodStr.split('-');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Month is 0-indexed in JavaScript Date, but our input is 1-indexed
    const monthIndex = parseInt(month, 10) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  };
  
  // Function to create the receivables vs payables chart
  const createReceivablesPayablesChart = () => {
    if (!accountsData || !receivablesPayablesChartRef.current) return;
    
    const periods = accountsData.periods;
    const formattedPeriods = periods.map(formatPeriod);
    
    const traces = [
      {
        x: formattedPeriods,
        y: periods.map(period => accountsData.accounts_receivable[period]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Accounts Receivable',
        line: { color: 'rgb(53, 162, 235)', width: 2 }
      },
      {
        x: formattedPeriods,
        y: periods.map(period => accountsData.accounts_payable[period]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Accounts Payable',
        line: { color: 'rgb(255, 99, 132)', width: 2 }
      }
    ];
    
    const layout = {
      title: 'Accounts Receivable vs Payable',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Amount' },
      legend: { orientation: 'h', y: -0.2 }
    };
    
    Plotly.newPlot(receivablesPayablesChartRef.current, traces, layout, { responsive: true });
  };
  
  // Function to create stacked area chart
  const createStackedAreaChart = () => {
    if (!accountsData || !stackedAreaChartRef.current) return;
    
    const periods = accountsData.periods;
    const formattedPeriods = periods.map(formatPeriod);
    
    // Create absolute values for better visualization
    const receivablesAbs = periods.map(period => Math.abs(accountsData.accounts_receivable[period]));
    const payablesAbs = periods.map(period => Math.abs(accountsData.accounts_payable[period]));
    
    const traces = [
      {
        x: formattedPeriods,
        y: receivablesAbs,
        type: 'scatter',
        mode: 'lines',
        name: 'Accounts Receivable',
        fill: 'tozeroy',
        line: { color: 'rgba(53, 162, 235, 0.7)', width: 1 }
      },
      {
        x: formattedPeriods,
        y: payablesAbs,
        type: 'scatter',
        mode: 'lines',
        name: 'Accounts Payable',
        fill: 'tonexty',
        line: { color: 'rgba(255, 99, 132, 0.7)', width: 1 }
      }
    ];
    
    const layout = {
      title: 'Accounts Volume (Stacked Area)',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Amount (Absolute)' },
      legend: { orientation: 'h', y: -0.2 }
    };
    
    Plotly.newPlot(stackedAreaChartRef.current, traces, layout, { responsive: true });
  };
  
  // No longer need to create radar chart as we're using a table instead
  
  // Function to export the report as PDF
  const exportReportToPDF = async () => {
    if (!accountsData || !receivablesData || !payablesData) return;
    
    try {
      setExporting(true);
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title and date
      pdf.setFontSize(18);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Administrative Accounts Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Add accounts summary
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Accounts Summary', 14, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Average Accounts Receivable: $${formatNumber(accountsData.avg_accounts_receivable)}`, 14, 38);
      pdf.text(`Average Accounts Payable: $${formatNumber(accountsData.avg_accounts_payable)}`, 14, 44);
      
      // Capture charts as images
      const captureAndAddChart = async (ref, title, yPosition) => {
        if (!ref.current) return yPosition;
        
        try {
          const canvas = await html2canvas(ref.current, {
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 28; // 14mm margin on each side
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Check if we need a new page
          if (yPosition + imgHeight + 20 > pageHeight) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(44, 62, 80);
          pdf.text(title, 14, yPosition);
          
          pdf.addImage(imgData, 'PNG', 14, yPosition + 5, imgWidth, imgHeight);
          
          return yPosition + imgHeight + 20; // Return the new Y position
        } catch (err) {
          console.error(`Error capturing chart ${title}:`, err);
          return yPosition + 10;
        }
      };
      
      // Capture and add charts
      let yPos = 50;
      yPos = await captureAndAddChart(receivablesPayablesChartRef, 'Accounts Receivable vs Payable', yPos);
      
      pdf.addPage();
      yPos = 20;
      yPos = await captureAndAddChart(stackedAreaChartRef, 'Accounts Volume (Stacked Area)', yPos);
      
      // Add metrics table to PDF
      pdf.addPage();
      yPos = 20;
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Accounts Metrics Summary', 14, yPos);
      yPos += 10;
      
      // Create table headers
      pdf.setFillColor(240, 240, 240);
      pdf.setDrawColor(200, 200, 200);
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      
      // Draw table headers
      pdf.rect(14, yPos, 90, 8, 'FD');
      pdf.rect(104, yPos, 90, 8, 'FD');
      pdf.text('Metric', 16, yPos + 5);
      pdf.text('Value', 106, yPos + 5);
      yPos += 8;
      
      // Add table rows
      const lastPeriod = accountsData.periods[accountsData.periods.length - 1];
      const metrics = [
        { name: 'Receivables (Latest)', value: formatNumber(accountsData.accounts_receivable[lastPeriod]) },
        { name: 'Payables (Latest)', value: formatNumber(accountsData.accounts_payable[lastPeriod]) },
        { name: 'Avg Receivables', value: formatNumber(accountsData.avg_accounts_receivable) },
        { name: 'Avg Payables', value: formatNumber(accountsData.avg_accounts_payable) },
        { name: 'Receivables Turnover', value: formatNumber(accountsData.receivables_turnover) },
        { name: 'Payables Turnover', value: formatNumber(accountsData.payables_turnover) }
      ];
      
      metrics.forEach((metric, index) => {
        const rowY = yPos + (index * 8);
        pdf.setFillColor(255, 255, 255);
        pdf.rect(14, rowY, 90, 8, 'FD');
        pdf.rect(104, rowY, 90, 8, 'FD');
        pdf.text(metric.name, 16, rowY + 5);
        pdf.text('$' + metric.value, 106, rowY + 5);
      });
      
      // Save the PDF
      pdf.save('administrative_accounts_report.pdf');
      
      setExporting(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setExporting(false);
      alert('Error exporting report: ' + err.message);
    }
  };
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" ref={reportContainerRef}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 px-4 sm:px-6 lg:px-8 border-b border-gray-200 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administrative Accounts</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive accounts data analysis and key performance indicators.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={exportReportToPDF}
            disabled={loading || exporting || !accountsData}
          >
            {exporting ? (
              <>
                <div className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading"></div>
                Exporting...
              </>
            ) : (
              <>
                <svg
                  className="flex-shrink-0 w-4 h-4"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Export Report
              </>
            )}
          </button>
        </div>
      </header>

      {/* KPI 1-3: Accounts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-x-3">
            <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-green-100">
              <svg className="flex-shrink-0 w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Accounts Receivable</h3>
              <p className={`text-2xl font-bold ${getValueColor(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]])}`}>
                ${formatNumber(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]])}
                {getTrend(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]])}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Latest period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Money owed to the company by customers for goods or services delivered.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-x-3">
            <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-red-100">
              <svg className="flex-shrink-0 w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Accounts Payable</h3>
              <p className={`text-2xl font-bold ${getValueColor(accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}`}>
                ${formatNumber(accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}
                {getTrend(accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Latest period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Money owed by the company to its creditors for goods or services received.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-x-3">
            <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-blue-100">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Net Position</h3>
              <p className={`text-2xl font-bold ${getValueColor(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]] - accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}`}>
                ${formatNumber(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]] - accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}
                {getTrend(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]] - accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Latest period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Net position calculated as Accounts Receivable minus Accounts Payable.</p>
          </div>
        </div>
      </div>
      
      {/* KPI 4-5: Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Average Receivables</h3>
          <p className={`text-2xl font-bold ${getValueColor(accountsData.avg_accounts_receivable)}`}>
            ${formatNumber(accountsData.avg_accounts_receivable)}
            {getTrend(accountsData.avg_accounts_receivable)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Over all periods</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Average accounts receivable across all periods analyzed.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Average Payables</h3>
          <p className={`text-2xl font-bold ${getValueColor(accountsData.avg_accounts_payable)}`}>
            ${formatNumber(accountsData.avg_accounts_payable)}
            {getTrend(accountsData.avg_accounts_payable)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Over all periods</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Average accounts payable across all periods analyzed.</p>
          </div>
        </div>
      </div>
      
      {/* KPI 6: Payables Turnover */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Payables Turnover</h3>
          <p className="text-2xl font-bold text-teal-600">
            {formatNumber(accountsData.payables_turnover)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Ratio</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Measures how quickly a company pays its suppliers.</p>
          </div>
        </div>
      </div>
      
      {/* KPI 10: Receivable to Payable Ratio */}
      <div className="grid grid-cols-1 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Receivable to Payable Ratio</h3>
          <p className="text-2xl font-bold text-cyan-600">
            {accountsData.avg_accounts_payable !== 0 ? 
              formatNumber(Math.abs(accountsData.avg_accounts_receivable / accountsData.avg_accounts_payable)) : 'N/A'}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Ratio</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Ratio of average accounts receivable to average accounts payable. Indicates balance between money owed to the company and money the company owes.</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div ref={receivablesPayablesChartRef} className="w-full h-80"></div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div ref={stackedAreaChartRef} className="w-full h-80"></div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <h3 className="text-lg font-semibold mb-4">Accounts Metrics Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accountsData && (
                  <>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Receivables (Latest)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(accountsData.accounts_receivable[accountsData.periods[accountsData.periods.length - 1]])}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Current amount owed to the company</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Payables (Latest)</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(accountsData.accounts_payable[accountsData.periods[accountsData.periods.length - 1]])}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Current amount the company owes</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Avg Receivables</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(accountsData.avg_accounts_receivable)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Average amount owed to the company across all periods</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Avg Payables</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatNumber(accountsData.avg_accounts_payable)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Average amount the company owes across all periods</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Receivables Turnover</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(accountsData.receivables_turnover)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">How quickly customers pay their debts to the company</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Payables Turnover</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatNumber(accountsData.payables_turnover)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">How quickly the company pays its debts to suppliers</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Administrativos;
