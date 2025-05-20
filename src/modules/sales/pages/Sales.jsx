import React, { useState, useEffect, useRef } from 'react';
import { reinitPreline } from '../../../utils/preline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importar Plotly desde window global
const Plotly = window.Plotly;

function Sales() {
  const [salesData, setSalesData] = useState(null);
  const [salesByPeriod, setSalesByPeriod] = useState(null);
  const [salesByCustomer, setSalesByCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  
  // Referencia al contenedor principal para exportar PDF
  const reportContainerRef = useRef(null);

  // Definir la URL de la API con una URL de respaldo en caso de que la variable de entorno no esté disponible
  const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5002';

  useEffect(() => {
    // Reinicializar componentes de Preline cuando el componente se monta
    reinitPreline();
    
    // Función para obtener los datos de ventas
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        console.log('Fetching sales data from API URL:', API_URL);
        
        // Obtener datos generales de ventas
        const salesResponse = await fetch(`${API_URL}/api/kpis/sales`);
        if (!salesResponse.ok) {
          throw new Error(`Error ${salesResponse.status}: No se pudo obtener los datos de ventas`);
        }
        const salesDataResult = await salesResponse.json();
        
        // Obtener datos de ventas por período
        const salesByPeriodResponse = await fetch(`${API_URL}/api/kpis/sales/by-period`);
        if (!salesByPeriodResponse.ok) {
          throw new Error(`Error ${salesByPeriodResponse.status}: No se pudo obtener los datos de ventas por período`);
        }
        const salesByPeriodResult = await salesByPeriodResponse.json();
        
        // Obtener datos de ventas por cliente
        const salesByCustomerResponse = await fetch(`${API_URL}/api/kpis/sales/by-customer`);
        if (!salesByCustomerResponse.ok) {
          throw new Error(`Error ${salesByCustomerResponse.status}: No se pudo obtener los datos de ventas por cliente`);
        }
        const salesByCustomerResult = await salesByCustomerResponse.json();
        
        setSalesData(salesDataResult);
        setSalesByPeriod(salesByPeriodResult);
        setSalesByCustomer(salesByCustomerResult);
        setLoading(false);
      } catch (err) {
        handleApiError(err);
      }
    };
    
    fetchSalesData();
  }, []);
  
  // Efecto para crear los gráficos cuando los datos estén disponibles
  useEffect(() => {
    if (salesData && salesByPeriod && salesByCustomer && !loading) {
      // Crear los gráficos con Plotly
      createSalesChart();
      createSalesGrowthChart();
      createTopCustomersChart();
    }
  }, [salesData, salesByPeriod, salesByCustomer, loading]);
  
  // Manejar errores de API
  const handleApiError = (error) => {
    console.error('Error fetching data:', error);
    setError(`Error al cargar datos: ${error.message}. Por favor, verifica que el servidor esté en ejecución en ${API_URL}.`);
    setLoading(false);
  };
  
  // Función para formatear números grandes
  const formatNumber = (num) => {
    if (num === null || num === undefined) return 'N/A';
    
    // Para números muy grandes (billones)
    if (Math.abs(num) >= 1e12) {
      return (num / 1e12).toFixed(2) + 'T';
    }
    // Para números grandes (miles de millones)
    else if (Math.abs(num) >= 1e9) {
      return (num / 1e9).toFixed(2) + 'B';
    }
    // Para millones
    else if (Math.abs(num) >= 1e6) {
      return (num / 1e6).toFixed(2) + 'M';
    }
    // Para miles
    else if (Math.abs(num) >= 1e3) {
      return (num / 1e3).toFixed(2) + 'K';
    }
    // Para números pequeños
    else {
      return num.toFixed(2);
    }
  };
  
  // Función para obtener el color según el valor (positivo/negativo)
  const getValueColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  // Función para obtener la tendencia (↑/↓) según el valor
  const getTrend = (value) => {
    if (value > 0) return '↑';
    if (value < 0) return '↓';
    return '';
  };
  
  // Referencias para los gráficos de Plotly
  const salesChartRef = useRef(null);
  const salesGrowthChartRef = useRef(null);
  const topCustomersChartRef = useRef(null);
  
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
  
  // Function to create the sales chart with Plotly
  const createSalesChart = () => {
    if (!salesByPeriod || !salesChartRef.current) return;
    
    const periods = salesByPeriod.periods;
    const formattedPeriods = periods.map(formatPeriod);
    const sales = salesByPeriod.sales;
    
    const traces = [
      {
        x: formattedPeriods,
        y: sales,
        type: 'bar',
        name: 'Sales',
        marker: {
          color: 'rgba(53, 162, 235, 0.7)'
        }
      }
    ];
    
    const layout = {
      title: 'Sales by Period',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Amount ($)' }
    };
    
    Plotly.newPlot(salesChartRef.current, traces, layout, { responsive: true });
  };
  
  // Function to create the sales growth chart with Plotly
  const createSalesGrowthChart = () => {
    if (!salesByPeriod || !salesGrowthChartRef.current) return;
    
    const periods = salesByPeriod.periods;
    const formattedPeriods = periods.map(formatPeriod);
    const growth = salesByPeriod.growth;
    
    const traces = [
      {
        x: formattedPeriods,
        y: growth,
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Sales Growth (%)',
        line: { color: 'rgb(255, 99, 132)', width: 2 }
      }
    ];
    
    const layout = {
      title: 'Sales Growth',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Growth (%)' }
    };
    
    Plotly.newPlot(salesGrowthChartRef.current, traces, layout, { responsive: true });
  };
  
  // Function to create the top customers chart with Plotly
  const createTopCustomersChart = () => {
    if (!salesByCustomer || !topCustomersChartRef.current) return;
    
    const topCustomers = salesByCustomer.top_customers;
    
    // Sort customers by sales amount (from highest to lowest)
    const sortedCustomers = [...topCustomers].sort((a, b) => b.credit_movement - a.credit_movement);
    
    // Take the top 10 customers
    const top10Customers = sortedCustomers.slice(0, 10);
    
    const traces = [
      {
        x: top10Customers.map(customer => `Customer ${customer.third_party_id}`),
        y: top10Customers.map(customer => customer.credit_movement),
        type: 'bar',
        marker: {
          color: 'rgba(75, 192, 192, 0.7)'
        }
      }
    ];
    
    const layout = {
      title: 'Top 10 Customers by Sales',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Customer' },
      yaxis: { title: 'Sales Amount ($)' }
    };
    
    Plotly.newPlot(topCustomersChartRef.current, traces, layout, { responsive: true });
  };
  
  // Function to export the report as PDF
  const exportReportToPDF = async () => {
    if (!salesData || !salesByPeriod || !salesByCustomer) return;
    
    try {
      setExporting(true);
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add title and date
      pdf.setFontSize(18);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Sales Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString();
      pdf.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Add sales summary
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Sales Summary', 14, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Total Sales: $${formatNumber(salesData.total_sales_amount)}`, 14, 38);
      
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
      yPos = await captureAndAddChart(salesChartRef, 'Sales by Period', yPos);
      
      pdf.addPage();
      yPos = 20;
      yPos = await captureAndAddChart(salesGrowthChartRef, 'Sales Growth', yPos);
      
      pdf.addPage();
      yPos = 20;
      yPos = await captureAndAddChart(topCustomersChartRef, 'Top 10 Customers by Sales', yPos);
      
      // Save the PDF
      pdf.save('sales_report.pdf');
      
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
          <h1 className="text-2xl font-bold text-gray-800">Sales Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive sales data analysis and key performance indicators.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={exportReportToPDF}
            disabled={loading || exporting || !salesData}
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

      {/* KPI 1-3: Sales Summary */}
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
              <h3 className="text-sm font-medium text-gray-600">Total Sales</h3>
              <p className="text-2xl font-bold text-green-600">${formatNumber(salesData.total_sales_amount)}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Last 5 months</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Total revenue generated from all sales activities.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-x-3">
            <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-blue-100">
              <svg className="flex-shrink-0 w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Latest Period</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${formatNumber(salesData.total_sales[salesData.periods[salesData.periods.length - 1]])}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">{salesData.periods[salesData.periods.length - 1]}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Total sales for the latest recorded period.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center gap-x-3">
            <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-purple-100">
              <svg className="flex-shrink-0 w-5 h-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-600">Growth</h3>
              <p className={`text-2xl font-bold ${getValueColor(salesData.sales_growth[salesData.periods[salesData.periods.length - 1]])}`}>
                {formatNumber(salesData.sales_growth[salesData.periods[salesData.periods.length - 1]])}% 
                {getTrend(salesData.sales_growth[salesData.periods[salesData.periods.length - 1]])}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Latest period vs. previous</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Percentage of sales growth compared to the previous period.</p>
          </div>
        </div>
      </div>
      
      {/* KPI 4-5: Top Customers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Top Customer</h3>
          <p className="text-2xl font-bold text-purple-600">
            Customer {salesData.top_customers[0].third_party_id}
          </p>
          <p className="text-lg font-semibold text-gray-700">
            ${formatNumber(salesData.top_customers[0].credit_movement)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Highest sales volume</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Customer with the highest accumulated sales volume in the analyzed period.</p>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Average Sales</h3>
          <p className="text-2xl font-bold text-teal-600">
            ${formatNumber(salesData.total_sales_amount / salesData.periods.length)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Per period</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">Average sales per period during the last 5 months.</p>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div ref={salesChartRef} className="w-full h-80"></div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div ref={salesGrowthChartRef} className="w-full h-80"></div>
        </div>
        
        <div className="bg-white border rounded-lg shadow-sm p-4">
          <div ref={topCustomersChartRef} className="w-full h-80"></div>
        </div>
      </div>
    </div>
  );
}

export default Sales;
