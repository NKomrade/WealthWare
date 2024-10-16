import React, { useState, useEffect } from 'react';

function SalesReport() {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [salesData, setSalesData] = useState([]);
    
    const fetchSalesData = async () => {
        // Replace with your API endpoint
        const response = await fetch(`/api/sales?from=${fromDate}&to=${toDate}`);
        const data = await response.json();
        setSalesData(data);
    };

    useEffect(() => {
        if (fromDate && toDate) {
            fetchSalesData();
        }
    }, [fromDate, toDate]);

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Sales Report from <span className="text-blue-600">{fromDate || 'dd/mm/yyyy'}</span> to <span className="text-blue-600">{toDate || 'dd/mm/yyyy'}</span>
            </h1>
            <div className="flex justify-center mb-4">
                <div className="flex items-center">
                    <label className="mr-2">From</label>
                    <input 
                        type="date" 
                        value={fromDate} 
                        onChange={(e) => setFromDate(e.target.value)} 
                        className="border rounded-lg p-2" 
                    />
                </div>
                <div className="flex items-center mx-4">
                    <label className="mr-2">To</label>
                    <input 
                        type="date" 
                        value={toDate} 
                        onChange={(e) => setToDate(e.target.value)} 
                        className="border rounded-lg p-2" 
                    />
                </div>
                <div className="flex items-center mx-4">
                    <label className="mr-2">Payment Type</label>
                    <select className="border rounded-lg p-2">
                        <option>All Payments</option>
                        <option>Cash</option>
                        <option>Credit Card</option>
                        <option>UPI</option>
                    </select>
                </div>
                <div className="flex items-center mx-4">
                    <input 
                        type="text" 
                        placeholder="Search" 
                        className="border rounded-lg p-2" 
                    />
                </div>
                <button className="bg-blue-600 text-white rounded-lg px-4 py-2">Search</button>
            </div>

            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 border">Invoice ID</th>
                        <th className="py-2 px-4 border">Customer Name</th>
                        <th className="py-2 px-4 border">Product ID</th>
                        <th className="py-2 px-4 border">Amount</th>
                        <th className="py-2 px-4 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {salesData.length > 0 ? (
                        salesData.map((sale) => (
                            <tr key={sale.invoiceId}>
                                <td className="py-2 px-4 border">{sale.invoiceId}</td>
                                <td className="py-2 px-4 border">{sale.customerName}</td>
                                <td className="py-2 px-4 border">{sale.productId}</td>
                                <td className="py-2 px-4 border">{`$${sale.amount}`}</td>
                                <td className="py-2 px-4 border">{sale.status}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-4">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SalesReport;