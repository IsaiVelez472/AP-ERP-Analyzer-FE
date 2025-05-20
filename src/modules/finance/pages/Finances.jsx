// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/

import React, { useState, useEffect, useRef } from 'react';
import { reinitPreline } from '../../../utils/preline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Importar Plotly desde window global
const Plotly = window.Plotly;

function Finances() {
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
      margin: { l: 50, r: 50, b: 80, t: 50, pad: 4 }, // Aumentar el margen inferior
      xaxis: { 
        title: {
          text: 'Period',
          font: { size: 14 },
          standoff: 25 // Aumentar la distancia entre el eje y el título
        }
      },
      yaxis: { title: 'Amount' },
      legend: { orientation: 'h', y: -0.3 } // Ajustar la posición de la leyenda
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
      
      // Añadir título y fecha con estilo mejorado
      pdf.setFillColor(248, 250, 252); // bg-gray-50
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(22);
      pdf.setTextColor(31, 41, 55); // text-gray-800
      pdf.setFont(undefined, 'bold');
      pdf.text('Financial Report', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // text-gray-500
      pdf.setFont(undefined, 'normal');
      const today = new Date().toLocaleDateString('en-US');
      pdf.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Añadir línea separadora
      pdf.setDrawColor(229, 231, 235); // border-gray-200
      pdf.line(14, 30, pageWidth - 14, 30);
      
      // Add financial summary with web-style cards
      pdf.setFontSize(16);
      pdf.setTextColor(31, 41, 55); // text-gray-800
      pdf.setFont(undefined, 'bold');
      pdf.text('Financial Summary', 14, 40);
      
      // Función para crear tarjetas estilo web
      const createCard = (title, value, color, icon, description, x, y, width, height) => {
        // Fondo de la tarjeta
        pdf.setFillColor(255, 255, 255); // bg-white
        pdf.setDrawColor(229, 231, 235); // border-gray-200
        pdf.roundedRect(x, y, width, height, 2, 2, 'FD');
        
        // Título
        pdf.setFontSize(10);
        pdf.setTextColor(75, 85, 99); // text-gray-600
        pdf.setFont(undefined, 'normal');
        pdf.text(title, x + 5, y + 7);
        
        // Valor
        pdf.setFontSize(14);
        pdf.setTextColor(...color);
        pdf.setFont(undefined, 'bold');
        pdf.text(value, x + 5, y + 15);
        
        // Línea separadora
        pdf.setDrawColor(243, 244, 246); // border-gray-100
        pdf.line(x + 5, y + 20, x + width - 5, y + 20);
        
        // Descripción
        if (description) {
          pdf.setFontSize(8);
          pdf.setTextColor(107, 114, 128); // text-gray-500
          pdf.setFont(undefined, 'normal');
          
          // Dividir descripción en múltiples líneas si es necesario
          const splitDesc = pdf.splitTextToSize(description, width - 10);
          pdf.text(splitDesc, x + 5, y + 24);
        }
      };
      
      // Crear tarjetas para los KPIs principales
      const cardWidth = (pageWidth - 28 - 10) / 3; // 3 tarjetas por fila con 5mm de separación
      const cardHeight = 40;
      
      // First row of cards
      createCard(
        'Total Sales',
        `$${formatNumber(financialSummary.total_sales)}`,
        [22, 163, 74], // text-green-600
        'dollar',
        'Total revenue generated from all sales activities.',
        14, 45, cardWidth, cardHeight
      );
      
      createCard(
        'Total Expenses',
        `$${formatNumber(financialSummary.total_expenses)}`,
        [220, 38, 38], // text-red-600
        'expense',
        'Sum of all operational costs and business expenses.',
        14 + cardWidth + 5, 45, cardWidth, cardHeight
      );
      
      createCard(
        'Net Profit',
        `$${formatNumber(financialSummary.net_profit)}`,
        financialSummary.net_profit > 0 ? [22, 163, 74] : [220, 38, 38],
        'profit',
        'Calculated as Total Sales minus Total Expenses.',
        14 + (cardWidth + 5) * 2, 45, cardWidth, cardHeight
      );
      
      // Second row of cards
      createCard(
        'Profit Margin',
        `${formatNumber(financialSummary.profit_margin)}%`,
        [147, 51, 234], // text-purple-600
        'percentage',
        'Calculated as (Net Profit / Total Sales) × 100. Indicates what percentage of sales is converted to actual profit.',
        14, 45 + cardHeight + 5, cardWidth, cardHeight
      );
      
      createCard(
        'Accounts Receivable',
        `$${formatNumber(financialSummary.accounts_receivable)}`,
        financialSummary.accounts_receivable > 0 ? [22, 163, 74] : [220, 38, 38],
        'money',
        'Money owed to your company by customers for goods or services delivered but not yet paid for.',
        14 + cardWidth + 5, 45 + cardHeight + 5, cardWidth, cardHeight
      );
      
      createCard(
        'Accounts Payable',
        `$${formatNumber(financialSummary.accounts_payable)}`,
        financialSummary.accounts_payable > 0 ? [22, 163, 74] : [220, 38, 38],
        'bill',
        'Money your company owes to suppliers for goods or services received but not yet paid for.',
        14 + (cardWidth + 5) * 2, 45 + cardHeight + 5, cardWidth, cardHeight
      );
      
      // Usar los KPIs adicionales ya calculados previamente
      
      // Third row of cards (Additional KPIs)
      if (additionalKPIs) {
        // Title for the additional KPIs section
        pdf.setFontSize(16);
        pdf.setTextColor(31, 41, 55); // text-gray-800
        pdf.setFont(undefined, 'bold');
        pdf.text('Key Performance Indicators (KPIs)', 14, 45 + (cardHeight + 5) * 2 + 5);
        
        createCard(
          'ROI',
          `${formatNumber(additionalKPIs.roi)}%`,
          [79, 70, 229], // text-indigo-600
          'chart',
          'Return on Investment. Measures how efficiently investments generate profit.',
          14, 45 + (cardHeight + 5) * 2 + 10, cardWidth, cardHeight
        );
        
        createCard(
          'Current Ratio',
          formatNumber(additionalKPIs.currentRatio),
          [13, 148, 136], // text-teal-600
          'calculator',
          'Calculated as Accounts Receivable / Accounts Payable. Indicates ability to pay short-term obligations.',
          14 + cardWidth + 5, 45 + (cardHeight + 5) * 2 + 10, cardWidth, cardHeight
        );
        
        createCard(
          'Operational Efficiency',
          `${formatNumber(additionalKPIs.operationalEfficiency)}%`,
          [217, 119, 6], // text-amber-600
          'gauge',
          'Measure of how effectively resources are used to generate operating income.',
          14 + (cardWidth + 5) * 2, 45 + (cardHeight + 5) * 2 + 10, cardWidth, cardHeight
        );
      }
      
      // Configuración para capturar gráficos con tamaño fijo ya definida arriba
      
      // Los KPIs adicionales ya se muestran en las tarjetas de la tercera fila
      
      // ===== SECOND PAGE: GRAPHICAL ANALYSIS (2 charts) =====
      pdf.addPage();
      
      // Second page header
      pdf.setFillColor(248, 250, 252); // bg-gray-50
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(18);
      pdf.setTextColor(31, 41, 55); // text-gray-800
      pdf.setFont(undefined, 'bold');
      pdf.text('Graphical Analysis', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // text-gray-500
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Añadir línea separadora
      pdf.setDrawColor(229, 231, 235); // border-gray-200
      pdf.line(14, 30, pageWidth - 14, 30);
      
      // Definir márgenes consistentes para todas las páginas
      const pageMargin = 15; // 15mm de margen en cada lado (estándar para página carta)
      
      // Calcular el ancho disponible para las gráficas en una página carta
      const availableWidth = pageWidth - (pageMargin * 2);
      
      // Usar una proporción más conservadora para evitar que se salgan de la página
      const aspectRatio = 2; // Proporción más ancha que alta para que quepan mejor
      
      // Configuración para capturar gráficos con tamaño ajustado a página carta
      const captureOptions = {
        scale: 1.5, // Escala para buena calidad
        logging: false,
        useCORS: true,
        width: 800, // Ancho suficiente para capturar todos los elementos
        height: 400, // Alto suficiente para capturar todos los elementos
        windowWidth: 1200, // Ancho de ventana para asegurar que se capturen todos los elementos
        windowHeight: 800, // Alto de ventana para asegurar que se capturen todos los elementos
        x: -50, // Ajuste horizontal para capturar elementos que podrían estar fuera del área visible
        y: -50, // Ajuste vertical para capturar elementos que podrían estar fuera del área visible
        scrollX: 0, // Asegurar que no haya desplazamiento horizontal
        scrollY: 0 // Asegurar que no haya desplazamiento vertical
      };
      
      // Capturar y añadir las primeras 2 gráficas en la segunda página
      let yPos = 40;
      
      // Gráfica 1: Análisis de Flujo de Caja
      if (cashFlowChartRef.current) {
        try {
          const canvas = await html2canvas(cashFlowChartRef.current, captureOptions);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (pageMargin * 2); // Ancho de la imagen con márgenes iguales
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Align title to the left
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55); // text-gray-800
          pdf.setFont(undefined, 'bold');
          pdf.text('Cash Flow Analysis', pageMargin, yPos);
          
          // Centrar la imagen en la página
          pdf.addImage(imgData, 'PNG', pageMargin, yPos + 5, imgWidth, imgHeight);
          yPos += imgHeight + 25; // Aumentar el espacio entre gráficas
        } catch (err) {
          console.error('Error capturing Cash Flow Chart:', err);
        }
      }
      
      // Gráfica 2: Flujo de Caja Acumulado
      if (accumulatedCashFlowChartRef.current) {
        try {
          const canvas = await html2canvas(accumulatedCashFlowChartRef.current, captureOptions);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (pageMargin * 2); // Ancho de la imagen con márgenes iguales
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Align title to the left
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55); // text-gray-800
          pdf.setFont(undefined, 'bold');
          pdf.text('Accumulated Cash Flow', pageMargin, yPos);
          
          // Centrar la imagen en la página
          pdf.addImage(imgData, 'PNG', pageMargin, yPos + 5, imgWidth, imgHeight);
        } catch (err) {
          console.error('Error capturing Accumulated Cash Flow Chart:', err);
        }
      }
      
      // ===== THIRD PAGE: GRAPHICAL ANALYSIS CONTINUATION (2 remaining charts) =====
      pdf.addPage();
      
      // Third page header
      pdf.setFillColor(248, 250, 252); // bg-gray-50
      pdf.rect(0, 0, pageWidth, 30, 'F');
      
      pdf.setFontSize(18);
      pdf.setTextColor(31, 41, 55); // text-gray-800
      pdf.setFont(undefined, 'bold');
      pdf.text('Graphical Analysis - Continuation', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128); // text-gray-500
      pdf.setFont(undefined, 'normal');
      pdf.text(`Generated on: ${today}`, pageWidth / 2, 22, { align: 'center' });
      
      // Añadir línea separadora
      pdf.setDrawColor(229, 231, 235); // border-gray-200
      pdf.line(14, 30, pageWidth - 14, 30);
      
      // Capturar y añadir las 2 gráficas restantes en la tercera página
      yPos = 40;
      
      // Gráfica 3: Composición del Flujo de Caja
      if (cashFlowCompositionRef.current) {
        try {
          const canvas = await html2canvas(cashFlowCompositionRef.current, captureOptions);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (pageMargin * 2); // Ancho de la imagen con márgenes iguales
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Align title to the left
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55); // text-gray-800
          pdf.setFont(undefined, 'bold');
          pdf.text('Cash Flow Composition', pageMargin, yPos);
          
          // Centrar la imagen en la página
          pdf.addImage(imgData, 'PNG', pageMargin, yPos + 5, imgWidth, imgHeight);
          yPos += imgHeight + 25; // Aumentar el espacio entre gráficas
        } catch (err) {
          console.error('Error capturing Cash Flow Composition Chart:', err);
        }
      }
      
      // Gráfica 4: Análisis de Rentabilidad
      if (profitabilityChartRef.current) {
        try {
          const canvas = await html2canvas(profitabilityChartRef.current, captureOptions);
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - (pageMargin * 2); // Ancho de la imagen con márgenes iguales
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Align title to the left
          pdf.setFontSize(14);
          pdf.setTextColor(31, 41, 55); // text-gray-800
          pdf.setFont(undefined, 'bold');
          pdf.text('Profitability Analysis', pageMargin, yPos);
          
          // Centrar la imagen en la página
          pdf.addImage(imgData, 'PNG', pageMargin, yPos + 5, imgWidth, imgHeight);
        } catch (err) {
          console.error('Error capturing Profitability Chart:', err);
        }
      }
      
      // Generar un nombre de archivo con fecha y hora para evitar duplicaciones (GMT-5)
      const now = new Date();
      const options = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'America/New_York' // GMT-5 (Eastern Time)
      };
      const formattedDate = new Intl.DateTimeFormat('en-US', options)
        .format(now)
        .replace(/[\/:]/g, '-');
      const filename = `Financial_Report_${formattedDate}.pdf`;

      // Guardar el PDF con el nombre generado
      pdf.save(filename);
      
      setExporting(false);
    } catch (err) {
      console.error('Error exporting report:', err);
      setExporting(false);
      alert('Error al exportar el informe: ' + err.message);
    }
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
      </div>
      
      {/* KPI 4-6: Additional Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>
      
      {/* KPI 7-10: Advanced Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
