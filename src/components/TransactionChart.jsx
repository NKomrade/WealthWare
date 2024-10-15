import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';

const data = [
  { name: 'Jan', uv: 200, pv: 240 },
  { name: 'Feb', uv: 250, pv: 300 },
  { name: 'Mar', uv: 300, pv: 380 },
  { name: 'Apr', uv: 400, pv: 410 },
  { name: 'May', uv: 500, pv: 490 },
  { name: 'Jun', uv: 350, pv: 320 },
  { name: 'Jul', uv: 300, pv: 250 },
  { name: 'Aug', uv: 250, pv: 230 },
  { name: 'Sep', uv: 200, pv: 210 },
  { name: 'Oct', uv: 220, pv: 240 },
  { name: 'Nov', uv: 240, pv: 260 },
  { name: 'Dec', uv: 260, pv: 300 }
];

export default function TransactionChart() {
  return (
    <div className="bg-white p-10 rounded-xl shadow-md w-[900px]"> {/* Increased width */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Sales and Profit Overview</h2>
      <p className="text-sm text-gray-600 mb-2">( +10 ) more in 2021</p>
      <div className="mt-3 w-full h-[20rem]"> {/* Adjusted height */}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#007bff" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#007bff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00c49f" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#00c49f" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-30} textAnchor="end" />
            <YAxis domain={[0, 600]} tickCount={5} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="uv" stroke="#007bff" dot={{ stroke: '#007bff', strokeWidth: 2, r: 5 }} />
            <Line type="monotone" dataKey="pv" stroke="#00c49f" dot={{ stroke: '#00c49f', strokeWidth: 2, r: 5 }} />
            <Area type="monotone" dataKey="uv" stroke="#007bff" fill="url(#salesGradient)" fillOpacity={0.2} />
            <Area type="monotone" dataKey="pv" stroke="#00c49f" fill="url(#profitGradient)" fillOpacity={0.2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
