import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaMoneyBill, FaHome, FaShoppingCart, FaUsers, FaBullhorn } from 'react-icons/fa';
import { GiWallet} from 'react-icons/gi';
import { MdSavings, MdCategory } from "react-icons/md";

const data = [
  { name: 'Bills & Utilities', value: 27 },
  { name: 'Rent', value: 10 },
  { name: 'Supplies', value: 9 },
  { name: 'Salaries', value: 8 },
  { name: 'Marketing', value: 15 },
  { name: 'Transport', value: 5 },
  { name: 'Investment', value: 12 },
  { name: 'Other', value: 14 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#4BC0C0', '#F08080', '#90EE90'];

export default function ExpenseTracker() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="p-6 min-h-screen grid grid-cols-2 gap-6">
      {/* Overview Section */}
      <div className="grid grid-cols-4 gap-4 mb-6 col-span-2">
        <OverviewCard title="Total Expenses" value="₹5000" color="bg-white" icon={<FaMoneyBill />} />
        <OverviewCard title="Budget Remaining" value="₹2000" color="bg-white" icon={<GiWallet />} />
        <OverviewCard title="Total Savings" value="₹1000" color="bg-white" icon={<MdSavings />} />
        <OverviewCard title="Total Categories" value="8" color="bg-white" icon={<MdCategory />} />
      </div>

      {/* Pie Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="font-bold text-lg mb-4">Budgets</h1>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={60}
              label={({ name }) => name}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category-wise Expenses Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Category-wise Expenses</h2>
        <div className="space-y-2">
          {data.map((entry, index) => (
            <div key={index} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-lg mr-2">{entry.name}</span>
                <span className="text-sm text-gray-500">{`${entry.value} transactions`}</span>
              </div>
              <span className="text-red-500 font-semibold">{`${entry.value * 200} ₹`}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex space-x-2">
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
            onClick={() => setIsModalOpen(true)}
          >
            + Add new expense
          </button>
          <button className="bg-gray-300 px-3 py-2 rounded hover:bg-gray-400">
            Download report
          </button>
        </div>
      </div>

      {/* Transaction Summary Table */}
      <div className="col-span-2 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">Transaction Summary</h3>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">01</td>
              <td>10/01/2023</td>
              <td>₹1200</td>
              <td>ABC Suppliers</td>
              <td>Supplies</td>
              <td>Card</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add New Expense Modal */}
      {isModalOpen && <ExpenseModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function OverviewCard({ title, value, color, icon }) {
  return (
    <div className={`${color} p-4 rounded-lg shadow-md flex items-center space-x-4`}>
      <div className="text-3xl text-blue-500">{icon}</div>
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ExpenseModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl font-semibold mb-4">Add New Expense</h3>
        <form className="space-y-4">
          <input type="date" className="w-full p-2 border rounded-lg" />
          <select className="w-full p-2 border rounded-lg">
            <option>Expense</option>
            <option>Income</option>
          </select>
          <input type="text" className="w-full p-2 border rounded-lg" placeholder="Vendor Name" />
          <input type="text" className="w-full p-2 border rounded-lg" placeholder="Payment Method" />
          <div className="grid grid-cols-3 gap-2 mt-4">
            <CategoryIcon icon={<FaMoneyBill />} label="Utilities" />
            <CategoryIcon icon={<FaHome />} label="Rent" />
            <CategoryIcon icon={<FaShoppingCart />} label="Supplies" />
            <CategoryIcon icon={<FaUsers />} label="Salaries" />
            <CategoryIcon icon={<FaBullhorn />} label="Marketing" />
          </div>
          <div className="mt-4 flex justify-between">
            <button
              type="button"
              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600">
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CategoryIcon({ icon, label }) {
  return (
    <div className="bg-gray-100 p-2 rounded-lg text-center">
      <div className="text-2xl">{icon}</div>
      <p className="mt-1 text-sm">{label}</p>
    </div>
  );
}