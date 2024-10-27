import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const data = [
  { month: 'Jan', value: 200 },
  { month: 'Feb', value: 250 },
  { month: 'Mar', value: 220 },
  { month: 'Apr', value: 300 },
  { month: 'May', value: 400 },
  { month: 'Jun', value: 450 },
  { month: 'Jul', value: 350 },
  { month: 'Aug', value: 280 },
  { month: 'Sep', value: 320 },
  { month: 'Oct', value: 250 },
  { month: 'Nov', value: 400 },
  { month: 'Dec', value: 450 },
];

export default function SalesOverview() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md w-[900px]"> {/* Set a fixed width */}
      <strong className="text-xl font-semibold text-gray-800">Sales Overview</strong>
      <div className="text-green-500 text-sm mb-4">(+5) more in 2021</div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4A90E2"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
