import React from 'react';

function RecentTransactions() {
  // Mock data for recent transactions
  const transactions = [
    {
      id: "#3066",
      customer: "John Smith",
      email: "john.smith@example.com",
      date: "May 19, 2025",
      amount: "$259.43",
      status: "Paid",
      statusColor: "green"
    },
    {
      id: "#3065",
      customer: "Emma Johnson",
      email: "emma.johnson@example.com",
      date: "May 18, 2025",
      amount: "$125.00",
      status: "Paid",
      statusColor: "green"
    },
    {
      id: "#3064",
      customer: "Michael Brown",
      email: "michael.brown@example.com",
      date: "May 18, 2025",
      amount: "$89.95",
      status: "Pending",
      statusColor: "orange"
    },
    {
      id: "#3063",
      customer: "Sarah Davis",
      email: "sarah.davis@example.com",
      date: "May 17, 2025",
      amount: "$312.50",
      status: "Paid",
      statusColor: "green"
    },
    {
      id: "#3062",
      customer: "Robert Wilson",
      email: "robert.wilson@example.com",
      date: "May 17, 2025",
      amount: "$75.25",
      status: "Failed",
      statusColor: "red"
    },
    {
      id: "#3061",
      customer: "Jennifer Taylor",
      email: "jennifer.taylor@example.com",
      date: "May 16, 2025",
      amount: "$189.99",
      status: "Paid",
      statusColor: "green"
    }
  ];

  const getStatusClass = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-100 text-green-800';
      case 'orange':
        return 'bg-orange-100 text-orange-800';
      case 'red':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col bg-white border shadow-sm rounded-xl">
      <div className="p-4 md:p-5">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-lg font-bold text-gray-800">
            Recent Transactions
          </h3>
          <button type="button" className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none">
            View all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="p-4 md:p-5">
          <div className="flex flex-col">
            <div className="-m-1.5 overflow-x-auto">
              <div className="p-1.5 min-w-full inline-block align-middle">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th scope="col" className="px-6 py-3 text-end text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                            <div className="flex items-center gap-x-2">
                              <div className="inline-flex items-center justify-center h-[2.375rem] w-[2.375rem] rounded-full bg-blue-100">
                                <span className="font-medium text-blue-600">{transaction.customer.charAt(0)}</span>
                              </div>
                              <div className="grow">
                                <span className="block text-sm font-semibold text-gray-800">{transaction.customer}</span>
                                <span className="block text-sm text-gray-500">{transaction.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{transaction.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{transaction.amount}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-xs font-medium ${getStatusClass(transaction.statusColor)}`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-end text-sm font-medium">
                            <button type="button" className="inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 hover:underline font-medium">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecentTransactions;
