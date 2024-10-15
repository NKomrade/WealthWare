import React from 'react';
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

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="flex gap-5 flex-wrap">
      <div className="flex-1 bg-white p-2 rounded-xl shadow-md h-full">
        <div className="grid grid-cols-3">
          <StatCard
            label="Total Sales"
            value="₹1000"
            change="+8% from yesterday"
            onClick={() => handleCardClick('/salesreport')}
          />
          <StatCard
            label="Profit"
            value="₹300"
            change="+2% from yesterday"
            onClick={() => handleCardClick('/expensetracking')}
          />
          <StatCard
            label="Products Sold"
            value="₹5"
            change="+1.2% from yesterday"
            onClick={() => handleCardClick('/inventory')}
          />
        </div>
      </div>
      <div className="flex-1 bg-white p-6 rounded-xl shadow-md min-h-[25rem]">
        <strong className="text-xl font-semibold text-gray-800 mb-4">Transactions</strong>
        <div className="mt-3 h-[20rem]">
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
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

function StatCard({ label, value, change, onClick, graph }) {
  return (
    <div
      className={`flex flex-col justify-between bg-white shadow-sm p-4 rounded-xl transition-shadow duration-300 hover:shadow-lg cursor-pointer`}
      onClick={onClick}
    >
      <div className="text-gray-600 text-sm font-semibold">{label}</div>
      <div className="text-2xl font-bold text-gray-800 mt-2">{value}</div>
      {graph ? (
        <div className="h-8 w-full mt-2">
          {/* You can add a small placeholder graph here */}
          <svg width="100%" height="100%">
            <line x1="0" y1="20" x2="100" y2="0" stroke="#4A90E2" strokeWidth="2" />
            <line x1="100" y1="0" x2="200" y2="20" stroke="#4A90E2" strokeWidth="2" />
            <line x1="200" y1="20" x2="300" y2="5" stroke="#4A90E2" strokeWidth="2" />
          </svg>
        </div>
      ) : (
        <div className="text-xs text-green-500 mt-1">{change}</div>
      )}
    </div>
  );
}
