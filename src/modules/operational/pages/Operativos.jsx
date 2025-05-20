import React, { useState, useEffect, useRef } from "react";
import { reinitPreline } from "../../../utils/preline";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Plotly from global window
const Plotly = window.Plotly;

function Operativos() {
  const [expensesData, setExpensesData] = useState(null);
  const [expensesByPeriod, setExpensesByPeriod] = useState(null);
  const [expensesBySupplier, setExpensesBySupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  // Reference to the main container for PDF export
  const reportContainerRef = useRef(null);

  // Define API URL with fallback in case environment variable is not available
  const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:5002";

  useEffect(() => {
    // Reinitialize Preline components when component mounts
    reinitPreline();

    // Function to fetch expenses data
    const fetchExpensesData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data from API URL:", API_URL);

        // Fetch expenses summary
        const expensesResponse = await fetch(`${API_URL}/api/kpis/expenses/`);
        if (!expensesResponse.ok) {
          throw new Error(
            `Error ${expensesResponse.status}: Could not fetch expenses data`
          );
        }
        const expensesData = await expensesResponse.json();
        setExpensesData(expensesData);

        // Fetch expenses by period
        const byPeriodResponse = await fetch(
          `${API_URL}/api/kpis/expenses/by-period`
        );
        if (!byPeriodResponse.ok) {
          throw new Error(
            `Error ${byPeriodResponse.status}: Could not fetch expenses by period`
          );
        }
        const byPeriodData = await byPeriodResponse.json();
        setExpensesByPeriod(byPeriodData);

        // Fetch expenses by supplier
        const bySupplierResponse = await fetch(
          `${API_URL}/api/kpis/expenses/by-supplier`
        );
        if (!bySupplierResponse.ok) {
          throw new Error(
            `Error ${bySupplierResponse.status}: Could not fetch expenses by supplier`
          );
        }
        const bySupplierData = await bySupplierResponse.json();
        setExpensesBySupplier(bySupplierData);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching expenses data:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchExpensesData();

    return () => {
      // Cleanup if needed
    };
  }, [API_URL]);

  // Initialize when component renders
  useEffect(() => {
    if (loading || !expensesData || !expensesByPeriod || !expensesBySupplier) {
      return;
    }

    // Small timeout to ensure DOM elements are ready
    const timer = setTimeout(() => {
      reinitPreline();
    }, 100);

    // Clean up timer on unmount
    return () => clearTimeout(timer);
  }, [loading, expensesData, expensesByPeriod, expensesBySupplier]);



  // Helper function to format numbers with commas and 2 decimal places
  const formatNumber = (number) => {
    if (number === null || number === undefined) return "N/A";

    // Handle very large numbers with units (t, b, m) instead of scientific notation
    if (Math.abs(number) >= 1e12) {
      return (number / 1e12).toFixed(2) + 't';
    } else if (Math.abs(number) >= 1e9) {
      return (number / 1e9).toFixed(2) + 'b';
    } else if (Math.abs(number) >= 1e6) {
      return (number / 1e6).toFixed(2) + 'm';
    }

    // Format regular numbers
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(number);
  };

  // Helper function to determine color based on value
  const getValueColor = (value) => {
    if (value === null || value === undefined) return "text-gray-600";
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  // Helper function to get trend indicator
  const getTrend = (value) => {
    if (value === null || value === undefined) return "";
    return value >= 0 ? (
      <span className="text-green-600 ml-1">↑</span>
    ) : (
      <span className="text-red-600 ml-1">↓</span>
    );
  };

  // Helper function to format period (YYYY-MM to Month YYYY)
  const formatPeriod = (period) => {
    if (!period) return "";

    const [year, month] = period.split("-");
    const date = new Date(year, parseInt(month) - 1);

    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Function to export report as PDF
  const exportToPDF = async () => {
    if (!reportContainerRef.current) return;

    try {
      setExporting(true);

      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("operational_expenses_report.pdf");

      setExporting(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      setExporting(false);
    }
  };

  // Placeholder for the component while data is loading
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Show error message if there was a problem fetching data
  if (error) {
    return (
      <div className="p-6">
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  // Calculate derived metrics for KPIs
  const calculateDerivedMetrics = () => {
    if (!expensesData || !expensesByPeriod) return {};

    const periods = expensesData.periods || [];
    const totalExpenses = expensesData.total_expenses_amount || 0;
    const expensesByMonth = expensesData.total_expenses || {};
    const expenses = expensesByPeriod.expenses || [];
    const topSuppliers = expensesData.top_suppliers || [];

    // Calculate monthly average (excluding extreme outliers)
    const filteredExpenses = expenses.filter((exp) => Math.abs(exp) < 1e12); // Filter out extreme values
    const monthlyAverage =
      filteredExpenses.length > 0
        ? filteredExpenses.reduce((sum, exp) => sum + exp, 0) /
          filteredExpenses.length
        : 0;

    // Calculate expense growth rate (last month vs previous month)
    const lastMonthExpense = expenses[expenses.length - 1] || 0;
    const previousMonthExpense = expenses[expenses.length - 2] || 1; // Avoid division by zero
    const growthRate =
      ((lastMonthExpense - previousMonthExpense) /
        Math.abs(previousMonthExpense)) *
      100;

    // Find largest monthly expense (absolute value)
    const largestExpense = Math.max(...expenses.map(Math.abs));

    // Calculate supplier concentration (top 3 suppliers as % of total)
    const top3Suppliers = topSuppliers.slice(0, 3);
    const top3Total = top3Suppliers.reduce(
      (sum, supplier) => sum + Math.abs(supplier.debit_movement),
      0
    );
    const supplierConcentration = (top3Total / Math.abs(totalExpenses)) * 100;

    // Calculate employee vs contact expenses
    const employeeExpenses = topSuppliers
      .filter((s) => s.third_party_type_id === "Employee")
      .reduce((sum, s) => sum + Math.abs(s.debit_movement), 0);

    const contactExpenses = topSuppliers
      .filter((s) => s.third_party_type_id === "Contact")
      .reduce((sum, s) => sum + Math.abs(s.debit_movement), 0);

    const employeeContactRatio = employeeExpenses / (contactExpenses || 1);

    // Calculate expense volatility (standard deviation / mean)
    const mean =
      filteredExpenses.reduce((sum, exp) => sum + exp, 0) /
      filteredExpenses.length;
    const squaredDiffs = filteredExpenses.map((exp) => Math.pow(exp - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, sqDiff) => sum + sqDiff, 0) /
      filteredExpenses.length;
    const stdDev = Math.sqrt(variance);
    const volatility = stdDev / Math.abs(mean || 1);

    // Simple expense forecast (linear trend)
    const lastThreeMonths = expenses.slice(-3);
    const avgChange =
      lastThreeMonths.length > 1
        ? (lastThreeMonths[lastThreeMonths.length - 1] - lastThreeMonths[0]) /
          (lastThreeMonths.length - 1)
        : 0;
    const forecast = lastMonthExpense + avgChange;

    // Expense efficiency metric (ratio of expenses to some business metric)
    // Since we don't have revenue data, we'll use a placeholder calculation
    const efficiencyMetric =
      Math.abs(totalExpenses) > 0 ? (100 / Math.abs(totalExpenses)) * 1e10 : 0;

    return {
      totalExpenses,
      monthlyAverage,
      growthRate,
      largestExpense,
      topSupplier: topSuppliers[0] || {},
      supplierConcentration,
      employeeContactRatio,
      volatility,
      forecast,
      efficiencyMetric,
    };
  };









  // Get derived metrics for KPIs
  const metrics = calculateDerivedMetrics();

  return (
    <div className="p-6" ref={reportContainerRef}>
      {/* Header with export button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Operational Expenses</h1>
          <p className="text-gray-600">
            Comprehensive expense analysis and key performance indicators.
          </p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {exporting ? "Exporting..." : "Export Report"}
        </button>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* KPI 1: Total Expenses */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Total Expenses</h3>
          <p
            className={`text-2xl font-bold ${getValueColor(
              metrics.totalExpenses
            )}`}
          >
            ${formatNumber(metrics.totalExpenses)}
            {getTrend(metrics.totalExpenses)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">All periods</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Total expenses across all analyzed periods.
            </p>
          </div>
        </div>

        {/* KPI 2: Monthly Average */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Monthly Average</h3>
          <p
            className={`text-2xl font-bold ${getValueColor(
              metrics.monthlyAverage
            )}`}
          >
            ${formatNumber(metrics.monthlyAverage)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Per month</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Average monthly expenses (excluding extreme outliers).
            </p>
          </div>
        </div>

        {/* KPI 3: Growth Rate */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Expense Growth Rate
          </h3>
          <p
            className={`text-2xl font-bold ${getValueColor(
              -metrics.growthRate
            )}`}
          >
            {formatNumber(metrics.growthRate)}%{getTrend(-metrics.growthRate)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              Last period vs previous
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Percentage change in expenses from previous to latest period.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* KPI 4: Largest Monthly Expense */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Largest Monthly Expense
          </h3>
          <p className="text-2xl font-bold text-red-600">
            ${formatNumber(metrics.largestExpense)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Peak expense</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Highest monthly expense amount recorded.
            </p>
          </div>
        </div>

        {/* KPI 5: Top Supplier */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">Top Supplier</h3>
          <p className="text-2xl font-bold text-blue-600">
            ID: {metrics.topSupplier.third_party_id || "N/A"}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              {metrics.topSupplier.third_party_type_id || "Unknown"} - $
              {formatNumber(metrics.topSupplier.debit_movement || 0)}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Supplier with the highest expense amount.
            </p>
          </div>
        </div>

        {/* KPI 6: Supplier Concentration */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Supplier Concentration
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatNumber(metrics.supplierConcentration)}%
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Top 3 suppliers</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Percentage of total expenses from top 3 suppliers.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* KPI 7: Employee/Contact Ratio */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Employee/Contact Ratio
          </h3>
          <p className="text-2xl font-bold text-teal-600">
            {formatNumber(metrics.employeeContactRatio)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Ratio</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Ratio of employee expenses to contact expenses.
            </p>
          </div>
        </div>

        {/* KPI 8: Expense Volatility */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Expense Volatility
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            {formatNumber(metrics.volatility)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">
              Coefficient of variation
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Measure of expense stability (lower is more stable).
            </p>
          </div>
        </div>

        {/* KPI 9: Expense Forecast */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Expense Forecast
          </h3>
          <p
            className={`text-2xl font-bold ${getValueColor(metrics.forecast)}`}
          >
            ${formatNumber(metrics.forecast)}
            {getTrend(metrics.forecast)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Next period (est.)</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Projected expenses for the next period based on trend.
            </p>
          </div>
        </div>

        {/* KPI 10: Expense Efficiency */}
        <div className="p-4 bg-white border rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-600">
            Expense Efficiency
          </h3>
          <p className="text-2xl font-bold text-indigo-600">
            {formatNumber(metrics.efficiencyMetric)}
          </p>
          <div className="mt-2">
            <span className="text-xs text-gray-500">Efficiency score</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Relative measure of expense efficiency (higher is better).
            </p>
          </div>
        </div>
      </div>



      {/* Table: Top Suppliers */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Top Suppliers Detail</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Expense Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expensesBySupplier &&
                  expensesBySupplier.top_suppliers &&
                  expensesBySupplier.top_suppliers
                    .slice(0, 10)
                    .map((supplier, index) => {
                      const totalExpAbs = Math.abs(metrics.totalExpenses || 1);
                      const percentage =
                        (Math.abs(supplier.debit_movement) / totalExpAbs) * 100;

                      return (
                        <tr
                          key={index}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {supplier.third_party_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {supplier.third_party_type_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${formatNumber(supplier.debit_movement)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatNumber(percentage)}%
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Operativos;
