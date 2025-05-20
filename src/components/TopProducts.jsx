// Copyright 2025 Anti-Patrones
// This work is licensed under a Creative Commons Attribution-ShareAlike 4.0 International License.
// http://creativecommons.org/licenses/by-sa/4.0/
import React from 'react';

function TopProducts() {
  // Mock data for top products
  const products = [
    {
      name: "Laptop Pro X1",
      category: "Electronics",
      sales: 1823,
      change: "+12.5%",
      isPositive: true
    },
    {
      name: "Wireless Earbuds",
      category: "Audio",
      sales: 1456,
      change: "+8.3%",
      isPositive: true
    },
    {
      name: "Smart Watch Series 7",
      category: "Wearables",
      sales: 952,
      change: "-2.1%",
      isPositive: false
    },
    {
      name: "Ultra HD Monitor",
      category: "Displays",
      sales: 841,
      change: "+5.7%",
      isPositive: true
    },
    {
      name: "Ergonomic Keyboard",
      category: "Accessories",
      sales: 675,
      change: "+3.9%",
      isPositive: true
    }
  ];

  return (
    <div className="flex flex-col bg-white border shadow-sm rounded-xl">
      <div className="p-4 md:p-5">
        <h3 className="text-lg font-bold text-gray-800">
          Top Products
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Best selling products this month
        </p>
      </div>
      <div className="p-4 md:p-5">
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={index} className="flex items-center gap-x-3">
              <div className="grow">
                <div className="flex justify-between items-center gap-x-3">
                  <div>
                    <span className="block text-sm font-semibold text-gray-800">{product.name}</span>
                    <span className="block text-sm text-gray-500">{product.category}</span>
                  </div>
                  <div className="flex items-center gap-x-2">
                    <span className="text-sm font-semibold text-gray-800">{product.sales}</span>
                    <span className={`inline-flex items-center gap-x-1 py-0.5 px-2 rounded-full text-xs font-medium ${product.isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <svg className={`w-3 h-3 ${product.isPositive ? 'text-green-500' : 'text-red-500'}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {product.isPositive ? (
                          <path d="m18 15-6-6-6 6" />
                        ) : (
                          <path d="m6 9 6 6 6-6" />
                        )}
                      </svg>
                      {product.change}
                    </span>
                  </div>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full" 
                    style={{ width: `${(product.sales / 2000) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopProducts;
