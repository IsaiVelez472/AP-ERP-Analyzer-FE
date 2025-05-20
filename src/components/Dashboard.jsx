import React from "react";
import StatCards from "./StatCards";
import RecentTransactions from "./RecentTransactions";
import SalesChart from "./SalesChart";
import TopProducts from "./TopProducts";

function Dashboard() {
  return (
    <>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-5 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor key metrics, check reports and review performance.
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
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <line x1="12" x2="12" y1="8" y2="16" />
              <line x1="8" x2="16" y1="12" y2="12" />
            </svg>
            Add report
          </button>
        </div>
      </header>

      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <StatCards />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
          <div className="lg:col-span-2">
            <SalesChart />
          </div>

          <div>
            <TopProducts />
          </div>
        </div>

        <div className="mt-6">
          <RecentTransactions />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
