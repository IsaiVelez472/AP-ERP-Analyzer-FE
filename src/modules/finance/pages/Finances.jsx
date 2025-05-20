import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { reinitPreline } from '../../../utils/preline';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Finances() {
  const [financialSummary, setFinancialSummary] = useState(null);
  const [cashFlow, setCashFlow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reinicializar componentes de Preline cuando el componente se monta
    reinitPreline();
    
    // Función para obtener los datos financieros
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Obtener resumen financiero
        const summaryResponse = await fetch('http://127.0.0.1:5002/api/kpis/financial/summary');
        if (!summaryResponse.ok) {
          throw new Error('Failed to fetch financial summary');
        }
        const summaryData = await summaryResponse.json();
        
        // Obtener datos de flujo de caja
        const cashFlowResponse = await fetch('http://127.0.0.1:5002/api/kpis/financial/cash-flow');
        if (!cashFlowResponse.ok) {
          throw new Error('Failed to fetch cash flow data');
        }
        const cashFlowData = await cashFlowResponse.json();
        
        setFinancialSummary(summaryData);
        setCashFlow(cashFlowData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        
        // Para desarrollo, cargar datos de ejemplo si la API falla
        console.error('Error fetching data:', err);
        loadMockData();
      }
    };
    
    fetchFinancialData();
  }, []);
  
  // Función para cargar datos de ejemplo si la API falla
  const loadMockData = () => {
    setFinancialSummary({
      "periods": ["2024-02", "2024-03", "2024-04", "2024-05", "2024-06"],
      "total_sales": 2513313541.16,
      "total_expenses": -2841960946116.7417,
      "net_profit": 2844474259657.902,
      "profit_margin": 113176.25966973692,
      "accounts_receivable": -14630534.937858462,
      "accounts_payable": 1012669254.2006252,
      "days_sales_outstanding": 0.0,
      "days_payables_outstanding": 0.0,
      "cash_flow_summary": {
        "operating": -1155857392804.5535,
        "investment": 0,
        "financing": 178247288739.31,
        "total": -977610104065.2435
      }
    });
    
    setCashFlow({
      "periods": ["2024-02", "2024-03", "2024-04", "2024-05", "2024-06"],
      "operating_cash_flow": {
        "2024-02": 18454339.836924,
        "2024-03": -2132147698.779016,
        "2024-04": -1152208119564.8735,
        "2024-05": -1448791866.276364,
        "2024-06": -86788014.46147203
      },
      "investment_cash_flow": {},
      "financing_cash_flow": {
        "2024-02": 9668482.68,
        "2024-03": 191248872.3,
        "2024-04": 178926328001.22,
        "2024-05": -928419366.8900003,
        "2024-06": 48462750.0
      },
      "accumulated_cash_flow": {
        "2024-02": 28122822.516924,
        "2024-03": -1912776003.9620922,
        "2024-04": -975194567567.6156,
        "2024-05": -977571778800.782,
        "2024-06": -977610104065.2434
      },
      "total_cash_flow": {
        "2024-02": 28122822.516924,
        "2024-03": -1940898826.479016,
        "2024-04": -973281791563.6536,
        "2024-05": -2377211233.1663647,
        "2024-06": -38325264.461472034
      }
    });
    
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
  
  // Preparar datos para el gráfico de flujo de caja
  const prepareCashFlowChartData = () => {
    if (!cashFlow) return null;
    
    return {
      labels: cashFlow.periods,
      datasets: [
        {
          label: 'Operating Cash Flow',
          data: cashFlow.periods.map(period => cashFlow.operating_cash_flow[period]),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Financing Cash Flow',
          data: cashFlow.periods.map(period => cashFlow.financing_cash_flow[period] || 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
        {
          label: 'Total Cash Flow',
          data: cashFlow.periods.map(period => cashFlow.total_cash_flow[period]),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        }
      ]
    };
  };
  
  // Preparar datos para el gráfico de flujo de caja acumulado
  const prepareAccumulatedCashFlowChartData = () => {
    if (!cashFlow) return null;
    
    return {
      labels: cashFlow.periods,
      datasets: [
        {
          label: 'Accumulated Cash Flow',
          data: cashFlow.periods.map(period => cashFlow.accumulated_cash_flow[period]),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          fill: true,
        }
      ]
    };
  };
  
  // Preparar datos para el gráfico de composición del flujo de caja
  const prepareCashFlowCompositionData = () => {
    if (!financialSummary) return null;
    
    const { cash_flow_summary } = financialSummary;
    
    // Usar valores absolutos para el gráfico circular
    const operatingAbs = Math.abs(cash_flow_summary.operating);
    const investmentAbs = Math.abs(cash_flow_summary.investment);
    const financingAbs = Math.abs(cash_flow_summary.financing);
    
    return {
      labels: ['Operating', 'Investment', 'Financing'],
      datasets: [
        {
          data: [operatingAbs, investmentAbs, financingAbs],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Preparar datos para el gráfico de rentabilidad
  const prepareProfitabilityChartData = () => {
    if (!financialSummary) return null;
    
    // Calcular la rentabilidad mensual (simulada basada en los datos disponibles)
    const monthlyProfitMargin = Array(5).fill(financialSummary.profit_margin / 5);
    
    return {
      labels: financialSummary.periods,
      datasets: [
        {
          label: 'Profit Margin (%)',
          data: monthlyProfitMargin,
          backgroundColor: 'rgba(75, 192, 192, 0.7)',
        }
      ]
    };
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
    <div className="p-4">
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
          >
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
          </button>
        </div>
      </header>

      {/* KPI 1-3: Financial Summary Cards */}
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
              <p className="text-2xl font-bold text-green-600">${formatNumber(financialSummary.total_sales)}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Last 5 months</span>
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
              <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-600">${formatNumber(financialSummary.total_expenses)}</p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Last 5 months</span>
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
              <h3 className="text-sm font-medium text-gray-600">Net Profit</h3>
              <p className={`text-2xl font-bold ${getValueColor(financialSummary.net_profit)}`}>
                ${formatNumber(financialSummary.net_profit)} {getTrend(financialSummary.net_profit)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Last 5 months</span>
          </div>
        </div>
      </div>
      
      {/* KPI 4-6: Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Profit Margin</h3>
          <p className="text-2xl font-bold text-purple-600">{formatNumber(financialSummary.profit_margin)}%</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Overall performance</span>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Accounts Receivable</h3>
          <p className={`text-2xl font-bold ${getValueColor(financialSummary.accounts_receivable)}`}>
            ${formatNumber(financialSummary.accounts_receivable)} {getTrend(financialSummary.accounts_receivable)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Outstanding payments</span>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Accounts Payable</h3>
          <p className={`text-2xl font-bold ${getValueColor(financialSummary.accounts_payable)}`}>
            ${formatNumber(financialSummary.accounts_payable)} {getTrend(financialSummary.accounts_payable)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Pending payments</span>
          </div>
        </div>
      </div>
      
      {/* KPI 7-10: Advanced Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">ROI</h3>
          <p className="text-2xl font-bold text-indigo-600">{formatNumber(additionalKPIs.roi)}%</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Return on Investment</span>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Current Ratio</h3>
          <p className="text-2xl font-bold text-teal-600">{formatNumber(additionalKPIs.currentRatio)}</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Liquidity measure</span>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Operational Efficiency</h3>
          <p className="text-2xl font-bold text-amber-600">{formatNumber(additionalKPIs.operationalEfficiency)}%</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Cost effectiveness</span>
          </div>
        </div>
        
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Growth Rate</h3>
          <p className="text-2xl font-bold text-emerald-600">{formatNumber(additionalKPIs.growthRate)}%</p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Year-over-year</span>
          </div>
        </div>
      </div>
      
      {/* Cash Flow Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Analysis</h3>
          <div className="h-80">
            {cashFlow && <Line data={prepareCashFlowChartData()} options={{ maintainAspectRatio: false, responsive: true }} />}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Accumulated Cash Flow</h3>
          <div className="h-80">
            {cashFlow && <Line data={prepareAccumulatedCashFlowChartData()} options={{ maintainAspectRatio: false, responsive: true }} />}
          </div>
        </div>
      </div>
      
      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Composition</h3>
          <div className="h-80 flex justify-center items-center">
            {financialSummary && (
              <div style={{ width: '70%', height: '70%' }}>
                <Doughnut 
                  data={prepareCashFlowCompositionData()} 
                  options={{ 
                    maintainAspectRatio: true, 
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'bottom',
                      }
                    }
                  }} 
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Profitability Analysis</h3>
          <div className="h-80">
            {financialSummary && <Bar data={prepareProfitabilityChartData()} options={{ maintainAspectRatio: false, responsive: true }} />}
          </div>
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
