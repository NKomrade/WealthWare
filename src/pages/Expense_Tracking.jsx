import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { FaMoneyBill, FaHome, FaShoppingCart, FaUsers, FaBullhorn } from 'react-icons/fa';

export default function ExpenseTracker() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Total Expenses This Month</h3>
          <p className="text-3xl font-bold">₹5000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Budget Remaining</h3>
          <p className="text-3xl font-bold">₹2000</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Expense Distribution</h3>
          <div className="flex">
            <div className="w-1/2">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={60}
                    fill="#8884d8"
                    labelLine={false} // No label showing percentage
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-1/2 flex flex-col justify-center pl-4">
              {data.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center mb-2">
                  <div
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    className="w-4 h-4 rounded-full mr-2"
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 mt-6 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Category-wise Expenses</h3>
          <ul className="mt-4 space-y-2">
            <li>Utilities: ₹6000 (30%)</li>
            <li>Rent: ₹1440 (12%)</li>
            {/* Add more categories as needed */}
          </ul>
          <div className="mt-4 flex space-x-2">
            <button
              className="bg-blue-500 text-white p-2 rounded"
              onClick={() => setIsModalOpen(true)}
            >
              Add new expense
            </button>
            <button className="bg-gray-300 p-2 rounded">Download report</button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">Recent Expenses</h3>
          <table className="mt-4 w-full">
            <thead>
              <tr className="text-left">
                <th>ID</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Vendor</th>
                <th>Category</th>
                <th>Payment Method</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>01</td>
                <td>10/01/2023</td>
                <td>₹1200</td>
                <td>ABC Suppliers</td>
                <td>Supplies</td>
                <td>Card</td>
              </tr>
              {/* Add more expenses */}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && <ExpenseModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}

function ExpenseModal({ onClose }) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl font-semibold">Add New Expense</h3>
        <form className="mt-4 space-y-4">
          <input className="w-full p-2 border" type="date" placeholder="Date" />
          <select className="w-full p-2 border">
            <option>Expense</option>
            <option>Income</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <FaMoneyBill className="text-2xl mx-auto" />
              <p className="text-sm mt-2">Utilities</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <FaHome className="text-2xl mx-auto" />
              <p className="text-sm mt-2">Rent</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <FaShoppingCart className="text-2xl mx-auto" />
              <p className="text-sm mt-2">Supplies</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <FaUsers className="text-2xl mx-auto" />
              <p className="text-sm mt-2">Salaries</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <FaBullhorn className="text-2xl mx-auto" />
              <p className="text-sm mt-2">Marketing</p>
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white p-2 rounded col-span-2"
              onClick={() => setIsCategoryModalOpen(true)}
            >
              Add new category
            </button>
          </div>
          <input className="w-full p-2 border" type="text" placeholder="Vendor name" />
          <input className="w-full p-2 border" type="text" placeholder="Payment method" />
          <div className="flex justify-end space-x-4">
            <button type="button" className="bg-red-500 text-white p-2 rounded" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="bg-blue-500 text-white p-2 rounded">
              Save Expense
            </button>
          </div>
        </form>

        {/* Category Modal */}
        {isCategoryModalOpen && <CategoryModal onClose={() => setIsCategoryModalOpen(false)} />}
      </div>
    </div>
  );
}

function CategoryModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
        <h3 className="text-xl font-semibold">Select Category</h3>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <FaMoneyBill className="text-2xl mx-auto" />
            <p className="text-sm mt-2">Utilities</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <FaHome className="text-2xl mx-auto" />
            <p className="text-sm mt-2">Rent</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <FaShoppingCart className="text-2xl mx-auto" />
            <p className="text-sm mt-2">Supplies</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <FaUsers className="text-2xl mx-auto" />
            <p className="text-sm mt-2">Salaries</p>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <FaBullhorn className="text-2xl mx-auto" />
            <p className="text-sm mt-2">Marketing</p>
          </div>
          {/* Add more categories as needed */}
        </div>
        <div className="flex justify-end mt-4">
          <button type="button" className="bg-blue-500 text-white p-2 rounded" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}