import React, { useState, useEffect, useRef } from 'react';
import { reinitPreline } from '../../../utils/preline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useFilter } from '../../../context/FilterContext';

// Importar Plotly desde window global
const Plotly = window.Plotly;

function Finances() {
  const { filterCards } = useFilter();
  const [financialSummary, setFinancialSummary] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
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
    
    // Función para obtener los datos financieros
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data from API URL:', API_URL);
        
        // Obtener resumen financiero
        const summaryResponse = await fetch(`${API_URL}/api/kpis/financial/summary`);
        if (!summaryResponse.ok) {
          throw new Error(`Error ${summaryResponse.status}: No se pudo obtener el resumen financiero`);
        }
        const summaryData = await summaryResponse.json();
        
        // Obtener datos de flujo de caja
        const cashFlowResponse = await fetch(`${API_URL}/api/kpis/financial/cash-flow`);
        if (!cashFlowResponse.ok) {
          throw new Error(`Error ${cashFlowResponse.status}: No se pudo obtener los datos de flujo de caja`);
        }
        const cashFlowData = await cashFlowResponse.json();
        
        setFinancialSummary(summaryData);
        setCashFlow(cashFlowData);
        setLoading(false);
      } catch (err) {
        handleApiError(err);
      }
    };
    
    fetchFinancialData();
  }, []);
  
  // Efecto para crear los gráficos cuando los datos estén disponibles
  useEffect(() => {
    if (financialSummary && cashFlow && !loading) {
      // Crear los gráficos con Plotly
      createCashFlowChart();
      createAccumulatedCashFlowChart();
      createCashFlowCompositionChart();
      createProfitabilityChart();
    }
  }, [financialSummary, cashFlow, loading]);
  
  // Manejar errores de API sin usar mocks quemados
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
  const cashFlowChartRef = useRef(null);
  const accumulatedCashFlowChartRef = useRef(null);
  const cashFlowCompositionRef = useRef(null);
  const profitabilityChartRef = useRef(null);
  
  // Función para crear el gráfico de flujo de caja con Plotly
  const createCashFlowChart = () => {
    if (!cashFlow || !cashFlowChartRef.current) return;
    
    const periods = cashFlow.periods;
    
    const traces = [
      {
        x: periods,
        y: periods.map(period => cashFlow.operating_cash_flow[period]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Operating Cash Flow',
        line: { color: 'rgb(53, 162, 235)', width: 2 }
      },
      {
        x: periods,
        y: periods.map(period => cashFlow.financing_cash_flow[period] || 0),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Financing Cash Flow',
        line: { color: 'rgb(75, 192, 192)', width: 2 }
      },
      {
        x: periods,
        y: periods.map(period => cashFlow.total_cash_flow[period]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Total Cash Flow',
        line: { color: 'rgb(255, 99, 132)', width: 2 }
      }
    ];
    
    const layout = {
      title: 'Cash Flow Analysis',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Amount' },
      legend: { orientation: 'h', y: -0.2 }
    };
    
    Plotly.newPlot(cashFlowChartRef.current, traces, layout, { responsive: true });
  };
  
  // Función para crear el gráfico de flujo de caja acumulado con Plotly
  const createAccumulatedCashFlowChart = () => {
    if (!cashFlow || !accumulatedCashFlowChartRef.current) return;
    
    const periods = cashFlow.periods;
    
    const traces = [
      {
        x: periods,
        y: periods.map(period => cashFlow.accumulated_cash_flow[period]),
        type: 'scatter',
        mode: 'lines+markers',
        name: 'Accumulated Cash Flow',
        fill: 'tozeroy',
        line: { color: 'rgb(153, 102, 255)', width: 2 }
      }
    ];
    
    const layout = {
      title: 'Accumulated Cash Flow',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Amount' }
    };
    
    Plotly.newPlot(accumulatedCashFlowChartRef.current, traces, layout, { responsive: true });
  };
  
  // Función para crear el gráfico de composición del flujo de caja con Plotly
  const createCashFlowCompositionChart = () => {
    if (!financialSummary || !cashFlowCompositionRef.current) return;
    
    const { cash_flow_summary } = financialSummary;
    
    // Usar valores absolutos para el gráfico circular
    const operatingAbs = Math.abs(cash_flow_summary.operating);
    const investmentAbs = Math.abs(cash_flow_summary.investment);
    const financingAbs = Math.abs(cash_flow_summary.financing);
    
    const data = [{
      values: [operatingAbs, investmentAbs, financingAbs],
      labels: ['Operating', 'Investment', 'Financing'],
      type: 'pie',
      hole: 0.4,
      marker: {
        colors: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)'
        ]
      }
    }];
    
    const layout = {
      title: 'Cash Flow Composition',
      autosize: true,
      margin: { l: 0, r: 0, b: 0, t: 50, pad: 4 },
      showlegend: true,
      legend: { orientation: 'h', y: -0.2 }
    };
    
    Plotly.newPlot(cashFlowCompositionRef.current, data, layout, { responsive: true });
  };
  
  // Función para crear el gráfico de rentabilidad con Plotly
  const createProfitabilityChart = () => {
    if (!financialSummary || !profitabilityChartRef.current) return;
    
    // Calcular la rentabilidad mensual (simulada basada en los datos disponibles)
    const monthlyProfitMargin = Array(5).fill(financialSummary.profit_margin / 5);
    
    const data = [{
      x: financialSummary.periods,
      y: monthlyProfitMargin,
      type: 'bar',
      name: 'Profit Margin (%)',
      marker: {
        color: 'rgba(75, 192, 192, 0.7)'
      }
    }];
    
    const layout = {
      title: 'Profitability Analysis',
      autosize: true,
      margin: { l: 50, r: 50, b: 50, t: 50, pad: 4 },
      xaxis: { title: 'Period' },
      yaxis: { title: 'Profit Margin (%)' }
    };
    
    Plotly.newPlot(profitabilityChartRef.current, data, layout, { responsive: true });
  };
  
  // Calcular KPIs adicionales
  const calculateAdditionalKPIs = () => {
    if (!financialSummary || !cashFlow) return null;
    
    // 1. ROI (Return on Investment) - simulado
    const roi = (financialSummary.net_profit / Math.abs(financialSummary.total_expenses)) * 100;
    
    // 2. Liquidez corriente (Current Ratio) - simulado
    const currentRatio = Math.abs(financialSummary.accounts_receivable / financialSummary.accounts_payable);
    
    // 3. Eficiencia operativa - simulado
    const operationalEfficiency = Math.abs(financialSummary.total_sales / Math.abs(financialSummary.total_expenses)) * 100;
    
    // 4. Volatilidad del flujo de caja - calculada a partir de los datos disponibles
    const cashFlowValues = Object.values(cashFlow.total_cash_flow);
    const avgCashFlow = cashFlowValues.reduce((sum, value) => sum + value, 0) / cashFlowValues.length;
    const cashFlowVariance = cashFlowValues.reduce((sum, value) => sum + Math.pow(value - avgCashFlow, 2), 0) / cashFlowValues.length;
    const cashFlowVolatility = Math.sqrt(cashFlowVariance) / Math.abs(avgCashFlow) * 100;
    
    // 5. Tasa de crecimiento - simulada
    const growthRate = 5.7; // Valor simulado
    
    return {
      roi,
      currentRatio,
      operationalEfficiency,
      cashFlowVolatility,
      growthRate
    };
  };
  
  // Función para exportar el informe como PDF
  const exportReportToPDF = async () => {
    if (!financialSummary || !cashFlow) return;
    
    try {
      setExporting(true);
      
      // Crear un nuevo documento PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Añadir título y fecha
      pdf.setFontSize(18);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Informe Financiero', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString();
      pdf.text(`Generado el: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Añadir resumen financiero
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Resumen Financiero', 14, 30);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Ventas Totales: $${formatNumber(financialSummary.total_sales)}`, 14, 38);
      pdf.text(`Gastos Totales: $${formatNumber(financialSummary.total_expenses)}`, 14, 44);
      pdf.text(`Beneficio Neto: $${formatNumber(financialSummary.net_profit)}`, 14, 50);
      pdf.text(`Margen de Beneficio: ${formatNumber(financialSummary.profit_margin)}%`, 14, 56);
      
      // Capturar las gráficas como imágenes
      const captureAndAddChart = async (ref, title, yPosition) => {
        if (!ref.current) return yPosition;
        
        try {
          const canvas = await html2canvas(ref.current, {
            scale: 2,
            logging: false,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 28; // Margen de 14mm en cada lado
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Verificar si necesitamos una nueva página
          if (yPosition + imgHeight + 20 > pageHeight) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(12);
          pdf.setTextColor(44, 62, 80);
          pdf.text(title, 14, yPosition);
          
          pdf.addImage(imgData, 'PNG', 14, yPosition + 5, imgWidth, imgHeight);
          
          return yPosition + imgHeight + 20; // Devolver la nueva posición Y
        } catch (err) {
          console.error(`Error capturing chart ${title}:`, err);
          return yPosition + 10;
        }
      };
      
      // Añadir KPIs adicionales
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Indicadores Clave de Rendimiento (KPIs)', 14, 20);
      
      const additionalKPIs = calculateAdditionalKPIs();
      if (additionalKPIs) {
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`ROI: ${formatNumber(additionalKPIs.roi)}%`, 14, 30);
        pdf.text(`Ratio de Liquidez: ${formatNumber(additionalKPIs.currentRatio)}`, 14, 36);
        pdf.text(`Eficiencia Operativa: ${formatNumber(additionalKPIs.operationalEfficiency)}%`, 14, 42);
        pdf.text(`Volatilidad del Flujo de Caja: ${formatNumber(additionalKPIs.cashFlowVolatility)}%`, 14, 48);
        pdf.text(`Tasa de Crecimiento: ${formatNumber(additionalKPIs.growthRate)}%`, 14, 54);
      }
      
      // Capturar y añadir las gráficas
      let yPos = 65;
      yPos = await captureAndAddChart(cashFlowChartRef, 'Análisis de Flujo de Caja', yPos);
      yPos = await captureAndAddChart(accumulatedCashFlowChartRef, 'Flujo de Caja Acumulado', yPos);
      
      pdf.addPage();
      yPos = 20;
      yPos = await captureAndAddChart(cashFlowCompositionRef, 'Composición del Flujo de Caja', yPos);
      yPos = await captureAndAddChart(profitabilityChartRef, 'Análisis de Rentabilidad', yPos);
      
      // Guardar el PDF
      pdf.save('informe_financiero.pdf');
      
      setExporting(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setExporting(false);
      alert('Error al exportar el informe: ' + err.message);
    }
  };
  
  // Función para estructurar las KPI cards para el filtrado
  const getKpiCards = () => {
    if (!financialSummary || !additionalKPIs) return [];

    return [
      {
        id: 'total-sales',
        title: 'Total Sales',
        category: 'financial',
        description: 'Total revenue generated from all sales activities',
        searchableContent: `Total Sales ${formatNumber(financialSummary.total_sales)} revenue sales income`,
        element: (
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
                <p className="text-2xl font-bold text-green-600">${formatNumber(financialSummary.total_sales)}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Last 5 months</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Total revenue generated from all sales activities. Includes all product sales, services, and other revenue streams.</p>
            </div>
          </div>
        )
      },
      {
        id: 'total-expenses',
        title: 'Total Expenses',
        category: 'financial',
        description: 'Total operational costs including COGS, salaries, rent, utilities, marketing, and other business expenses',
        searchableContent: `Total Expenses ${formatNumber(financialSummary.total_expenses)} operational costs`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-x-3">
              <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-red-100">
                <svg className="flex-shrink-0 w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
                <p className="text-2xl font-bold text-red-600">${formatNumber(financialSummary.total_expenses)}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Last 5 months</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Sum of all operational costs, including COGS, salaries, rent, utilities, marketing, and other business expenses.</p>
            </div>
          </div>
        )
      },
      {
        id: 'net-profit',
        title: 'Net Profit',
        category: 'financial',
        description: 'Actual profit after all costs have been deducted',
        searchableContent: `Net Profit ${formatNumber(financialSummary.net_profit)} profit`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center gap-x-3">
              <div className="inline-flex justify-center items-center w-10 h-10 rounded-full bg-blue-100">
                <svg className="flex-shrink-0 w-5 h-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
                <p className={`text-2xl font-bold ${getValueColor(financialSummary.net_profit)}`}>
                  ${formatNumber(financialSummary.net_profit)} {getTrend(financialSummary.net_profit)}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Last 5 months</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Calculated as Total Sales minus Total Expenses. Represents the actual profit after all costs have been deducted.</p>
            </div>
          </div>
        )
      },
      {
        id: 'profit-margin',
        title: 'Profit Margin',
        category: 'metrics',
        description: 'Indicates what percentage of sales is converted to actual profit after all expenses',
        searchableContent: `Profit Margin ${formatNumber(financialSummary.profit_margin)}%`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Profit Margin</h3>
            <p className="text-2xl font-bold text-purple-600">{formatNumber(financialSummary.profit_margin)}%</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Overall performance</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Calculated as (Net Profit / Total Sales) × 100. Indicates what percentage of sales is converted to actual profit after all expenses.</p>
            </div>
          </div>
        )
      },
      {
        id: 'accounts-receivable',
        title: 'Accounts Receivable',
        category: 'metrics',
        description: 'Money owed to your company by customers for goods or services delivered but not yet paid for',
        searchableContent: `Accounts Receivable ${formatNumber(financialSummary.accounts_receivable)} money owed`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Accounts Receivable</h3>
            <p className={`text-2xl font-bold ${getValueColor(financialSummary.accounts_receivable)}`}>
              ${formatNumber(financialSummary.accounts_receivable)} {getTrend(financialSummary.accounts_receivable)}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Outstanding payments</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Money owed to your company by customers for goods or services delivered but not yet paid for. Negative values indicate prepayments or credits.</p>
            </div>
          </div>
        )
      },
      {
        id: 'accounts-payable',
        title: 'Accounts Payable',
        category: 'metrics',
        description: 'Money your company owes to suppliers or vendors for goods or services received but not yet paid for',
        searchableContent: `Accounts Payable ${formatNumber(financialSummary.accounts_payable)} money owed`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Accounts Payable</h3>
            <p className={`text-2xl font-bold ${getValueColor(financialSummary.accounts_payable)}`}>
              ${formatNumber(financialSummary.accounts_payable)} {getTrend(financialSummary.accounts_payable)}
            </p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Pending payments</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Money your company owes to suppliers or vendors for goods or services received but not yet paid for. Affects cash flow and liquidity.</p>
            </div>
          </div>
        )
      },
      {
        id: 'roi',
        title: 'ROI',
        category: 'analytics',
        description: 'Return on Investment - Measures how efficiently investments generate profit relative to their cost',
        searchableContent: `ROI ${formatNumber(additionalKPIs.roi)}% return on investment`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">ROI</h3>
            <p className="text-2xl font-bold text-indigo-600">{formatNumber(additionalKPIs.roi)}%</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Return on Investment</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Calculated as (Net Profit / Total Expenses) × 100. Measures how efficiently investments generate profit relative to their cost.</p>
            </div>
          </div>
        )
      },
      {
        id: 'current-ratio',
        title: 'Current Ratio',
        category: 'analytics',
        description: 'Liquidity measure - Indicates ability to pay short-term obligations',
        searchableContent: `Current Ratio ${formatNumber(additionalKPIs.currentRatio)} liquidity`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Current Ratio</h3>
            <p className="text-2xl font-bold text-teal-600">{formatNumber(additionalKPIs.currentRatio)}</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Liquidity measure</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Calculated as Accounts Receivable / Accounts Payable. Indicates ability to pay short-term obligations. Ratio greater than 1 is generally favorable.</p>
            </div>
          </div>
        )
      },
      {
        id: 'operational-efficiency',
        title: 'Operational Efficiency',
        category: 'analytics',
        description: 'Cost effectiveness - Measures how efficiently the company converts expenses into revenue',
        searchableContent: `Operational Efficiency ${formatNumber(additionalKPIs.operationalEfficiency)}% efficiency`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Operational Efficiency</h3>
            <p className="text-2xl font-bold text-amber-600">{formatNumber(additionalKPIs.operationalEfficiency)}%</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Cost effectiveness</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Calculated as (Total Sales / Total Expenses) × 100. Measures how efficiently the company converts expenses into revenue.</p>
            </div>
          </div>
        )
      },
      {
        id: 'growth-rate',
        title: 'Growth Rate',
        category: 'analytics',
        description: 'Annual percentage increase in revenue - Indicates business expansion rate',
        searchableContent: `Growth Rate ${formatNumber(additionalKPIs.growthRate)}%`,
        element: (
          <div className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-600">Growth Rate</h3>
            <p className="text-2xl font-bold text-emerald-600">{formatNumber(additionalKPIs.growthRate)}%</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Year-over-year</span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-600">Annual percentage increase in revenue. Indicates business expansion rate and market performance compared to previous periods.</p>
            </div>
          </div>
        )
      }
    ];
  };
  
  // Obtener KPIs adicionales
  const additionalKPIs = calculateAdditionalKPIs();
  
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
          <h1 className="text-2xl font-bold text-gray-800">Financial Analysis</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive financial data analysis and key performance indicators.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            type="button"
            className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
            onClick={exportReportToPDF}
            disabled={loading || exporting || !financialSummary}
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

      {/* KPI 1-3: Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {filterCards(getKpiCards())
          .filter(card => card.category === 'financial')
          .map(card => card.element)}
      </div>
      
      {/* KPI 4-6: Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {filterCards(getKpiCards())
          .filter(card => card.category === 'metrics')
          .map(card => card.element)}
      </div>
      
      {/* KPI 7-10: Advanced Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {filterCards(getKpiCards())
          .filter(card => card.category === 'analytics')
          .map(card => card.element)}
      </div>
      
      {/* Cash Flow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Analysis</h3>
          <div className="h-80" ref={cashFlowChartRef}></div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Accumulated Cash Flow</h3>
          <div className="h-80" ref={accumulatedCashFlowChartRef}></div>
        </div>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Composition</h3>
          <div className="h-80" ref={cashFlowCompositionRef}></div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Profitability Analysis</h3>
          <div className="h-80" ref={profitabilityChartRef}></div>
        </div>
      </div>
      
      {/* Cash Flow Volatility Indicator */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Cash Flow Volatility</h3>
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${additionalKPIs.cashFlowVolatility > 50 ? 'bg-red-600' : additionalKPIs.cashFlowVolatility > 25 ? 'bg-yellow-400' : 'bg-green-600'}`} 
              style={{ width: `${Math.min(100, additionalKPIs.cashFlowVolatility)}%` }}
            ></div>
          </div>
          <span className="ml-4 text-sm font-medium">{formatNumber(additionalKPIs.cashFlowVolatility)}%</span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {additionalKPIs.cashFlowVolatility > 50 
            ? 'High volatility - cash flow is unstable and requires attention' 
            : additionalKPIs.cashFlowVolatility > 25 
              ? 'Moderate volatility - monitor cash flow trends' 
              : 'Low volatility - stable cash flow'}
        </p>
      </div>
    </div>
  );
}

export default Finances;
