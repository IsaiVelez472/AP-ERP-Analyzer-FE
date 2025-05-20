// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import React from 'react';

function StatCards() {
  // Mock data for statistics
  const stats = [
    {
      title: "Total Sales",
      value: "$45,231.89",
      change: "+20.1%",
      isPositive: true,
      icon: (
        <svg className="flex-shrink-0 w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      )
    },
    {
      title: "Active Users",
      value: "2,862",
      change: "+10.6%",
      isPositive: true,
      icon: (
        <svg className="flex-shrink-0 w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      title: "Conversion Rate",
      value: "3.8%",
      change: "-1.2%",
      isPositive: false,
      icon: (
        <svg className="flex-shrink-0 w-8 h-8 text-orange-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )
    },
    {
      title: "Avg. Order Value",
      value: "$58.39",
      change: "+4.3%",
      isPositive: true,
      icon: (
        <svg className="flex-shrink-0 w-8 h-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      )
    }
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col bg-white border shadow-sm rounded-xl">
          <div className="p-4 md:p-5 flex gap-x-4">
            <div className="flex-shrink-0">
              <span className="inline-flex justify-center items-center w-[46px] h-[46px] rounded-full border-4 border-blue-50 bg-blue-100">
                {stat.icon}
              </span>
            </div>

            <div className="grow">
              <p className="text-xs uppercase tracking-wide font-medium text-gray-500">
                {stat.title}
              </p>
              <div className="flex items-center gap-x-2">
                <h3 className="text-xl sm:text-2xl font-medium text-gray-800">
                  {stat.value}
                </h3>
                <span className={`inline-flex items-center gap-x-1 py-0.5 px-2 rounded-full text-xs font-medium ${stat.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <svg className={`w-3 h-3 ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {stat.isPositive ? (
                      <path d="m18 15-6-6-6 6" />
                    ) : (
                      <path d="m6 9 6 6 6-6" />
                    )}
                  </svg>
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default StatCards;
