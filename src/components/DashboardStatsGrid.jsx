import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import { useState } from 'react';

// Data for Bar Chart
const data = [
  { name: 'Mon', Income: 4000, Expense: 2400 },
  { name: 'Tue', Income: 3000, Expense: 1398 },
  { name: 'Wed', Income: 2000, Expense: 9800 },
  { name: 'Thu', Income: 2780, Expense: 3908 },
  { name: 'Fri', Income: 1890, Expense: 4800 },
  { name: 'Sat', Income: 1200, Expense: 1000 },
  { name: 'Sun', Income: 1300, Expense: 800 },
];

// Helper function to format date with an ordinal suffix
function getFormattedDate(date) {
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th'; // Special case for teens
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const suffix = getOrdinalSuffix(day);
  return `${day}${suffix} ${month}, ${year}`;
}

export default function Dashboard() {
  const [date, setDate] = useState(new Date()); // Calendar state
  const today = getFormattedDate(date); // Get today's formatted date

  const handleCardClick = (route) => {
    console.log(`Navigating to: ${route}`);
    // Use your navigation logic here
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stat Cards Section */}
      <div className="flex flex-wrap gap-6 justify-around">
        <StatCard
          imageSrc="https://img.freepik.com/free-psd/business-statistics-bar-graph_53876-12055.jpg?t=st=1730008007~exp=1730011607~hmac=722393365ca63abd649e441c499088189e4e48f22127b2b7c73251c7a4ce7907&w=900"
          label="Total Sales"
          value="₹1000"
          change="+8% from yesterday"
          onClick={() => handleCardClick('/salesreport')}
        />
        <StatCard
          imageSrc="https://img.freepik.com/premium-vector/climbing-coins-graph-growth-arrow_961875-487012.jpg?w=1060"
          label="Profit"
          value="₹300"
          change="+2% from yesterday"
          onClick={() => handleCardClick('/expensetracking')}
        />
        <StatCard
          imageSrc="https://images.pexels.com/photos/953864/pexels-photo-953864.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          label="Products Sold"
          value="5"
          change="+1.5% from yesterday"
          onClick={() => handleCardClick('/inventory')}
        />
      </div>

      {/* Graph and Calendar Section */}
      <div className="flex gap-6">
        {/* Graph Section */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md min-h-[25rem]">
          <strong className="text-xl font-semibold text-gray-800 mb-4">Transactions</strong>
          <div className="mt-3 h-[20rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Income" fill="#0075FF" />
                <Bar dataKey="Expense" fill="#CEA2FD" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="bg-white p-6 rounded-xl shadow-md min-w-[20rem]">
          <strong className="text-xl font-semibold text-gray-800 mb-4">{today}</strong>
          <Calendar onChange={setDate} value={date} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ imageSrc, label, value, change, onClick }) {
  return (
    <div
      className="flex-grow bg-white p-6 rounded-xl shadow-md gap-6 hover:shadow-lg transition-shadow duration-300 cursor-pointer max-w-[35rem]"
      onClick={onClick}
    >
      {/* Image Section */}
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <img src={imageSrc} alt="stat icon" className="object-cover rounded-md w-full h-full" />
        </div>

        {/* Text Section */}
        <div className="flex flex-col justify-between">
          <div className="text-gray-600 text-sm font-semibold">{label}</div>
          <div className="text-3xl font-bold text-gray-800 mt-2">{value}</div>
          <div className="text-xs text-green-500 mt-1">{change}</div>
        </div>
      </div>
    </div>
  );
}