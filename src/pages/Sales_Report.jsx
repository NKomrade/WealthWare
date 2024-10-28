import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore instance

function SalesReport() {
    // Calculate today's date and 1 month before
    const today = new Date();
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(today.getMonth() - 1);

    // Format dates to 'YYYY-MM-DD' for input elements
    const formatDate = (date) => date.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(formatDate(oneMonthBefore));
    const [toDate, setToDate] = useState(formatDate(today));
    const [salesData, setSalesData] = useState([]);
    const [paymentType, setPaymentType] = useState('All Payments');
    const [searchTerm, setSearchTerm] = useState('');

    // Convert string date to Firestore Timestamp
    const convertToTimestamp = (date) => {
        return Timestamp.fromDate(new Date(date));
    };

    // Fetch sales data with memoized function to avoid unnecessary re-renders
    const fetchSalesData = useCallback(async () => {
        console.log('Fetching sales data...');  // Track function calls
        try {
            let q = collection(db, 'invoices');
    
            if (fromDate && toDate) {
                const fromTimestamp = convertToTimestamp(fromDate);
                const toTimestamp = convertToTimestamp(toDate);
                console.log('From:', fromTimestamp.toDate(), 'To:', toTimestamp.toDate());
    
                q = query(
                    q,
                    where('date', '>=', fromTimestamp),
                    where('date', '<=', toTimestamp)
                );
            }
    
            const querySnapshot = await getDocs(q);
    
            if (querySnapshot.empty) {
                console.log('No matching documents found.');
                setSalesData([]);  // Explicitly set empty array
                return;
            }
    
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            console.log('Fetched Sales Data:', data);  // Debugging log
            setSalesData(data);
        } catch (error) {
            console.error('Error fetching sales data:', error);
        }
    }, [fromDate, toDate]);    

    // Fetch data whenever fromDate or toDate changes
    useEffect(() => {
        fetchSalesData();
    },);

    // Filter sales data based on payment type and search term
    const filteredSalesData = salesData.filter((sale) => {
        const matchesPaymentType =
            paymentType === 'All Payments' || 
            sale.items.some((item) => item.paymentMethod === paymentType);

        const matchesSearch = sale.customerName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());

        return matchesPaymentType && matchesSearch;
    });

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4 text-center">
                Sales Report from{' '}
                <span className="text-blue-600">
                    {fromDate.split('-').reverse().join('/')}
                </span>{' '}
                to{' '}
                <span className="text-blue-600">
                    {toDate.split('-').reverse().join('/')}
                </span>
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
                    <select
                        value={paymentType}
                        onChange={(e) => setPaymentType(e.target.value)}
                        className="border rounded-lg p-2"
                    >
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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg p-2"
                    />
                </div>
                <button
                    onClick={fetchSalesData}
                    className="bg-blue-600 text-white rounded-lg px-4 py-2"
                >
                    Search
                </button>
            </div>

            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="py-2 px-4 border">Invoice ID</th>
                        <th className="py-2 px-4 border">Customer Name</th>
                        <th className="py-2 px-4 border">Product</th>
                        <th className="py-2 px-4 border">Quantity</th>
                        <th className="py-2 px-4 border">Amount</th>
                        <th className="py-2 px-4 border">Payment Method</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSalesData.length > 0 ? (
                        filteredSalesData.map((sale) =>
                            sale.items.map((item, index) => (
                                <tr key={`${sale.id}-${index}`}>
                                    <td className="py-2 px-4 border">{sale.invoiceID}</td>
                                    <td className="py-2 px-4 border">{sale.customerName}</td>
                                    <td className="py-2 px-4 border">{item.product}</td>
                                    <td className="py-2 px-4 border">{item.quantity}</td>
                                    <td className="py-2 px-4 border">{`₹${item.unitPrice}`}</td>
                                    <td className="py-2 px-4 border">{item.paymentMethod}</td>
                                </tr>
                            ))
                        )
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-4">
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SalesReport;