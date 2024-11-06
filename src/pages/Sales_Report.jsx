import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

function SalesReport() {
    const today = new Date();
    const oneMonthBefore = new Date();
    oneMonthBefore.setMonth(today.getMonth() - 1);

    const formatDate = (date) => date.toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(formatDate(oneMonthBefore));
    const [toDate, setToDate] = useState(formatDate(today));
    const [salesData, setSalesData] = useState([]);
    const [monthlySalesData, setMonthlySalesData] = useState([]);
    const [products, setProducts] = useState([]);
    const [paymentType, setPaymentType] = useState('All Payments');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    const auth = getAuth();
    const user = auth.currentUser;

    // Fetch products from Firestore
    const fetchProducts = useCallback(async () => {
        if (user) {
            try {
                const productsRef = collection(db, `users/${user.uid}/products`);
                const productSnapshot = await getDocs(productsRef);
                const fetchedProducts = productSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                console.log('Fetched Products:', fetchedProducts);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }
    }, [user]);

    // Fetch sales data from Firestore
    const fetchSalesData = useCallback(async () => {
        if (user) {
            try {
                let salesQuery = collection(db, `users/${user.uid}/invoices`);

                if (fromDate && toDate) {
                    salesQuery = query(salesQuery, where('date', '>=', fromDate), where('date', '<=', toDate));
                }

                const querySnapshot = await getDocs(salesQuery);
                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setSalesData(data);

                // Group data by month for bar chart
                const monthlyData = data.reduce((acc, sale) => {
                    const month = new Date(sale.date).toLocaleString('default', { month: 'short' });
                    if (!acc[month]) acc[month] = 0;
                    acc[month] += sale.total || 0;
                    return acc;
                }, {});

                setMonthlySalesData(Object.entries(monthlyData).map(([month, sales]) => ({ month, sales })));

            } catch (error) {
                console.error('Error fetching sales data:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [fromDate, toDate, user]);

    useEffect(() => {
        fetchProducts();
        fetchSalesData();
    }, [fetchProducts, fetchSalesData]);

    const getProductName = (productName) => {
        console.log('Looking for Product Name:', productName); // Debugging log
    
        const product = products.find((p) => p.name === productName);
        console.log('Found Product:', product); // Verify if the product is found
    
        // If product exists, return its SKU ID; otherwise, return 'Unknown Product'
        return product ? product.skuId : 'Unknown Product';
    };           
    
    const searchInvoices = (invoice) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesInvoiceID = invoice.invoiceID?.toLowerCase().includes(searchLower);
        const matchesCustomerName = invoice.customerName?.toLowerCase().includes(searchLower);

        const matchesProductID = invoice.items.some((item) => {
            const productID = getProductName(item.skuId);
            console.log('Product ID from SKU:', productID); // Debugging log
            return productID.toLowerCase().includes(searchLower);
        });

        return matchesInvoiceID || matchesCustomerName || matchesProductID;
    };

    const filteredSalesData = salesData.filter((sale) => {
        const matchesPaymentType =
            paymentType === 'All Payments' ||
            sale.paymentMethod.toLowerCase() === paymentType.toLowerCase();

        return matchesPaymentType && searchInvoices(sale);
    });

    const paymentMethodDistribution = salesData.reduce(
        (acc, sale) => {
            acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + 1;
            return acc;
        },
        { Cash: 0, Card: 0, UPI: 0 }
    );

    const pieData = [
        { name: 'Cash', value: paymentMethodDistribution.Cash },
        { name: 'Card', value: paymentMethodDistribution.Card },
        { name: 'UPI', value: paymentMethodDistribution.UPI },
    ];

    const colors = ['#4CAF50', '#FF9800', '#2196F3'];

    if (loading) {
        return <div className="text-center p-6">Loading...</div>;
    }

    return (
        <div className="p-2 bg-gray-100 flex space-x-6">
            <div className="flex-1 bg-white shadow-md rounded-md p-4 space-y-6">
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

                    <div className="flex justify-center mb-4 space-x-4">
                        <div className="flex items-center">
                            <label className="mr-2">From</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="border rounded-lg p-2"
                            />
                        </div>

                        <div className="flex items-center">
                            <label className="mr-2">To</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="border rounded-lg p-2"
                            />
                        </div>

                        <div className="flex items-center mx-4">
                            <label className="mr-2">Payment</label>
                            <select
                                value={paymentType}
                                onChange={(e) => setPaymentType(e.target.value)}
                                className="border rounded-lg p-2"
                            >
                                <option>All Payments</option>
                                <option>Cash</option>
                                <option>Card</option>
                                <option>UPI</option>
                            </select>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border rounded-lg-4 p-2"
                            />
                        </div>
                    </div>

                    <table className="min-w-full bg-white border border-gray-300">
                        <thead>
                            <tr className="bg-black text-white">
                                <th className="py-2 px-4 border">Invoice ID</th>
                                <th className="py-2 px-4 border">SKU ID</th>
                                <th className="py-2 px-4 border">Amount</th>
                                <th className="py-2 px-4 border">Payment Method</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSalesData.length > 0 ? (
                                filteredSalesData.map((invoice) => {
                                    // Collect all SKU IDs from the items in the invoice
                                    const productDetails = invoice.items
                                        .map((item) => getProductName(item.product)) // Call only once
                                        .join(', '); // Join product SKUs with a comma

                                    // Fetch the total amount directly from the invoice (if available)
                                    const totalAmount = invoice.total || 
                                        invoice.items.reduce(
                                            (acc, item) => acc + item.unitPrice * item.quantity,
                                            0
                                        );

                                    return (
                                        <tr key={invoice.id}>
                                            <td className="py-2 px-4 border">{invoice.invoiceID}</td>
                                            <td className="py-2 px-4 border">{productDetails}</td> {/* Corrected */}
                                            <td className="py-2 px-4 border">{`₹${totalAmount}`}</td> {/* Total Amount */}
                                            <td className="py-2 px-4 border">{invoice.paymentMethod}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-4">No data available.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Monthly Sales Bar Chart */}
                <div className="w-1/2 space-y-6">
                    <div className="bg-white shadow-md rounded-md p-4">
                        <h2 className="text-xl font-semibold mb-4 text-center">Monthly Sales</h2>
                        <BarChart width={400} height={300} data={monthlySalesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="sales" fill="#8884d8" />
                        </BarChart>
                    </div>
                    <div className="bg-white shadow-md rounded-md p-4">
                        <h2 className="text-xl font-semibold mb-4 text-center">Payment Method Distribution</h2>
                        <PieChart width={400} height={400}>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                                dataKey="value"
                                label={(entry) => `${entry.name}: ${entry.value}`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </div>
                </div>
        </div>
    );
}

export default SalesReport;