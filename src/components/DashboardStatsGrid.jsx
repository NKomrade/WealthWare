import React from 'react';
import { IoBagHandle, IoPieChart, IoPeople, IoCart } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', Expense: 4000, Income: 2400 },
  { name: 'Feb', Expense: 3000, Income: 1398 },
  { name: 'Mar', Expense: 2000, Income: 9800 },
  { name: 'Apr', Expense: 2780, Income: 3908 },
  { name: 'May', Expense: 1890, Income: 4800 },
  { name: 'Jun', Expense: 2390, Income: 3800 },
  { name: 'July', Expense: 3490, Income: 4300 },
  { name: 'Aug', Expense: 2000, Income: 9800 },
  { name: 'Sep', Expense: 2780, Income: 3908 },
  { name: 'Oct', Expense: 1890, Income: 4800 },
  { name: 'Nov', Expense: 2390, Income: 3800 },
  { name: 'Dec', Expense: 3490, Income: 4300 },
];

export default function DashboardStatsGrid() {
  const navigate = useNavigate();

  // Function to handle card click navigation
  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex gap-6">
      {/* Sales Stats Section */}
      <div className="w-1/2 bg-white p-4 rounded-xl shadow-md h-full"> {/* Adjusted padding */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<IoBagHandle className="text-3xl text-white" />}
            label="Total Sales"
            value="₹1000"
            change="+8% from yesterday"
            bgColor="bg-blue-100"
            textColor="text-blue-500"
            onClick={() => handleCardClick('/sales')}
          />
          <StatCard
            icon={<IoPieChart className="text-3xl text-white" />}
            label="Total Expense"
            value="₹300"
            change="+5% from yesterday"
            bgColor="bg-purple-100"
            textColor="text-purple-500"
            onClick={() => handleCardClick('/expenses')}
          />
          <StatCard
            icon={<IoCart className="text-3xl text-white" />}
            label="Product Sold"
            value="5"
            change="+1.2% from yesterday"
            bgColor="bg-blue-50"
            textColor="text-blue-500"
            onClick={() => handleCardClick('/products')}
          />
          <StatCard
            icon={<IoPeople className="text-3xl text-white" />}
            label="Total Customers"
            value="8"
            change="+0.5% from yesterday"
            bgColor="bg-purple-50"
            textColor="text-purple-500"
            onClick={() => handleCardClick('/customers')}
          />
        </div>
      </div>

      {/* Transaction Chart Section */}
      <div className="w-1/2 bg-white p-4 rounded-xl shadow-md"> {/* Adjusted padding */}
        <strong className="text-xl font-semibold text-gray-800 mb-4">Transactions</strong>
        <div className="mt-3 w-full h-[20rem]"> {/* Adjusted height */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 10,
                left: -10,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3 0 0" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Income" fill="#71C12A" />
              <Bar dataKey="Expense" fill="#C12A2A" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, change, bgColor, textColor, onClick }) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-sm cursor-pointer ${bgColor} ${textColor} hover:shadow-md transition-shadow duration-300`} // Fixed className
      onClick={onClick}
    >
      <div className="rounded-full bg-blue-500 h-12 w-12 flex items-center justify-center mb-2"> {/* Adjusted margin */}
        {icon}
      </div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xs text-green-500">{change}</div>
    </div>
  );
}