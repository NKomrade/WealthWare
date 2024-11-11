import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaMoneyBill, FaHome, FaShoppingCart, FaUsers, FaBullhorn, FaTruck } from 'react-icons/fa';
import { GiWallet, GiReceiveMoney } from 'react-icons/gi';
import { MdSavings, MdCategory } from "react-icons/md";
import { useProfile } from '../context/contextProfile';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF6384', '#4BC0C0', '#F08080', '#90EE90'];

export default function ExpenseTracker() {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userId: contextUserId } = useProfile(); // Take userId from context if available
  const userId = contextUserId || auth.currentUser?.uid; // Fallback to auth.currentUser if needed

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
    }
  }, [userId]);

  const fetchExpenses = async (userId) => {
    console.log("Fetching expenses for userId:", userId);
    try {
      const expensesCollection = collection(db, 'users', userId, 'expenses');
      const expensesSnapshot = await getDocs(expensesCollection);
      const expensesData = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched expenses data:", expensesData);
      setData(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  const handleAddExpense = async (expenses) => {
    if (!userId) {
      console.log("No userId available for adding expenses.");
      return;
    }
  
    try {
      let updatedData = [...data]; // Local state copy to keep UI in sync
  
      for (let expense of expenses) {
        console.log("Processing expense:", expense);
  
        // Get the expenses collection for the current user
        const expensesCollection = collection(db, 'users', userId, 'expenses');
        const expenseSnapshot = await getDocs(expensesCollection);
        
        // Check if the category exists in Firestore
        const existingDoc = expenseSnapshot.docs.find(
          (doc) => doc.data().name === expense.name
        );
  
        if (existingDoc) {
          // Fetch existing value and add new value to it
          const existingValue = existingDoc.data().value || 0;
          const updatedValue = existingValue + expense.value;
  
          // Update the document in Firestore
          await existingDoc.ref.update({ value: updatedValue });
  
          // Update the local data array to reflect changes immediately
          updatedData = updatedData.map((item) =>
            item.name === expense.name ? { ...item, value: updatedValue } : item
          );
        } else {
          // If category does not exist, add a new document
          const newDocRef = await addDoc(expensesCollection, expense);
          
          // Add new expense to the local data array
          updatedData.push({ id: newDocRef.id, ...expense });
        }
      }
  
      // Update local state and re-fetch data to sync with Firestore
      setData(updatedData);
      fetchExpenses(userId); // Ensures latest data is fetched from Firestore
    } catch (error) {
      console.error("Error processing expenses:", error);
    }
  };
    

  const totalExpenses = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="p-6 min-h-screen grid grid-cols-2 gap-6">
      {/* Overview Section */}
      <div className="grid grid-cols-4 gap-4 mb-6 col-span-2">
        <OverviewCard title="Total Expenses" value={`₹${totalExpenses}`} color="bg-white" icon={<FaMoneyBill />} />
        <OverviewCard title="Budget Remaining" value="₹2000" color="bg-white" icon={<GiWallet />} />
        <OverviewCard title="Total Savings" value="₹1000" color="bg-white" icon={<MdSavings />} />
        <OverviewCard title="Total Categories" value={data.length} color="bg-white" icon={<MdCategory />} />
      </div>

      {/* Pie Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="font-bold text-lg mb-4">Budgets</h1>
        {data.length > 0 ? (
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%"> 
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  innerRadius={100} 
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
        ) : (
          <div className="flex justify-center items-center h-40 text-gray-500">
            <p>No data found</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">Category-wise Expenses</h2>
        <div className="space-y-2">
          {data.length > 0 ? (
            data.map((entry, index) => (
              <div key={index} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{entry.name}</span>
                  <span className="text-sm text-gray-500">1 transaction</span>
                </div>
                <span className="text-neutral-800 font-semibold">{`${entry.value} ₹`}</span>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500">No data found</div>
          )}
        </div>
        <div className="mt-10 flex space-x-2">
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
              onClick={() => setIsModalOpen(true)}
            >
              + Add expenses
            </button>
            <button className="text-white bg-red-500 px-3 py-2 rounded hover:bg-red-600">
              Download report
            </button>
          </div>
      </div>

      {/* Transaction Summary Table */}
      <div className={`col-span-2 bg-white p-4 rounded-lg shadow-md ${data.length === 0 ? 'h-32' : ''}`}>
        <h3 className="text-xl font-semibold mb-2">Transaction Summary</h3>
        {data.length > 0 ? (
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
              {data.map((entry, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{index + 1}</td>
                  <td>{entry.date || 'N/A'}</td>
                  <td>{`${entry.value} ₹`}</td>
                  <td>{entry.vendor || 'N/A'}</td>
                  <td>{entry.name}</td>
                  <td>{entry.paymentMethod || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center text-gray-500">No data found</div>
        )}
      </div>

      {/* Add New Expense Modal */}
      {isModalOpen && (
        <ExpenseModal
          onClose={() => setIsModalOpen(false)}
          onAddExpense={(newExpense) => handleAddExpense(newExpense)}
        />
      )}
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

function ExpenseModal({ onClose, onAddExpense }) {
  const today = new Date().toISOString().split('T')[0]; 
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categoryValues, setCategoryValues] = useState({});
  const [date, setDate] = useState(today);
  const [vendor, setVendor] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const categories = [
    { name: 'Bills & Utilities', icon: <FaMoneyBill /> },
    { name: 'Rent', icon: <FaHome /> },
    { name: 'Supplies', icon: <FaShoppingCart /> },
    { name: 'Transport', icon: <FaTruck /> },
    { name: 'Salaries', icon: <FaUsers /> },
    { name: 'Marketing', icon: <FaBullhorn /> },
    { name: 'Investment', icon: <GiWallet /> },
    { name: 'Other', icon: <GiReceiveMoney /> }
  ];

  const toggleCategorySelection = (categoryName) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter(name => name !== categoryName));
      setCategoryValues(prev => {
        const updatedValues = { ...prev };
        delete updatedValues[categoryName];
        return updatedValues;
      });
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const handleCategoryValueChange = (categoryName, value) => {
    setCategoryValues({
      ...categoryValues,
      [categoryName]: Number(value),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expenses = selectedCategories.map(categoryName => ({
      date,
      name: categoryName,
      value: categoryValues[categoryName] || 0,
      vendor,
      paymentMethod
    }));
    onAddExpense(expenses);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Add Multiple Expenses</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="date"
            className="w-full p-2 border rounded-lg"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          
          {/* Category Selection with Icons */}
          <div className="border rounded-lg p-4">
            <h4 className="text-md font-semibold mb-2">Select Categories</h4>
            <div className="grid grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.name}
                  type="button"
                  className={`flex flex-col items-center p-2 rounded-lg border ${
                    selectedCategories.includes(category.name) ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                  }`}
                  onClick={() => toggleCategorySelection(category.name)}
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-sm text-center">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields for Selected Categories */}
          {selectedCategories.length > 0 && (
            <div className="space-y-4 mt-4">
              <h4 className="text-md font-semibold">Enter Values for Selected Categories</h4>
              {selectedCategories.map((categoryName) => (
                <div key={categoryName} className="flex items-center space-x-2">
                  <label className="w-1/3">{categoryName}:</label>
                  <input
                    type="number"
                    className="w-2/3 p-2 border rounded-lg"
                    placeholder="Amount"
                    value={categoryValues[categoryName] || ''}
                    onChange={(e) => handleCategoryValueChange(categoryName, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <input
            type="text"
            className="w-full p-2 border rounded-lg"
            placeholder="Vendor Name"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
          />
          <select
            className="w-full p-2 border rounded-lg"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save Expenses
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}