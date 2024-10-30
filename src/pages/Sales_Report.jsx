import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
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
                setProducts(fetchedProducts);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        }
    }, [user]);

    // Fetch invoices from Firestore
    const fetchSalesData = useCallback(async () => {
        if (user) {
            try {
                console.log('Fetching sales data...');
                let q = collection(db, `users/${user.uid}/invoices`);

                if (fromDate && toDate) {
                    console.log('From:', fromDate, 'To:', toDate);
                    q = query(q, where('date', '>=', fromDate), where('date', '<=', toDate));
                }

                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    console.log('No matching documents found.');
                    setSalesData([]);
                    return;
                }

                const data = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                console.log('Fetched Sales Data:', data);
                setSalesData(data);
            } catch (error) {
                console.error('Error fetching invoices:', error);
            } finally {
                setLoading(false);
            }
        }
    }, [fromDate, toDate, user]);

    useEffect(() => {
        fetchProducts(); 
        fetchSalesData(); 
    }, [fetchProducts, fetchSalesData]);

    const getProductID = (productName) => {
        const product = products.find((p) => p.name === productName);
        return product ? product.id : 'N/A';
    };

    const searchInvoices = (invoice) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesInvoiceID = invoice.invoiceID?.toLowerCase().includes(searchLower);
        const matchesCustomerName = invoice.customerName?.toLowerCase().includes(searchLower);

        const matchesProductID = invoice.items.some((item) => {
            const productID = getProductID(item.product);
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

    const toggleStatus = async (invoiceId) => {
        const invoiceRef = doc(db, `users/${user.uid}/invoices`, invoiceId);
        const invoice = salesData.find((sale) => sale.id === invoiceId);
        const newStatus = invoice.status === 'Pending' ? 'Delivered' : 'Pending';

        try {
            await updateDoc(invoiceRef, { status: newStatus });
            setSalesData((prevSalesData) =>
                prevSalesData.map((sale) =>
                    sale.id === invoiceId ? { ...sale, status: newStatus } : sale
                )
            );
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    if (loading) {
        return <div className="text-center p-6">Loading...</div>;
    }

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
                        <option>Card</option>
                        <option>UPI</option>
                    </select>
                </div>

                <div className="flex items-center mx-4">
                    <input
                        type="text"
                        placeholder="Search by Invoice ID, Product ID, or Customer Name"
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
                        <th className="py-2 px-4 border">Product ID</th>
                        <th className="py-2 px-4 border">Amount</th>
                        <th className="py-2 px-4 border">Payment Method</th>
                        <th className="py-2 px-4 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSalesData.length > 0 ? (
                        filteredSalesData.map((invoice) =>
                            invoice.items.map((item, index) => (
                                <tr key={`${invoice.id}-${index}`}>
                                    <td className="py-2 px-4 border">{invoice.invoiceID}</td>
                                    <td className="py-2 px-4 border">{invoice.customerName}</td>
                                    <td className="py-2 px-4 border">{getProductID(item.product)}</td>
                                    <td className="py-2 px-4 border">{`₹${item.unitPrice * item.quantity}`}</td>
                                    <td className="py-2 px-4 border">{invoice.paymentMethod}</td>
                                    <td
                                        className="py-2 px-4 border cursor-pointer"
                                        onClick={() => toggleStatus(invoice.id)}
                                    >
                                        {invoice.status || 'Pending'}
                                    </td>
                                </tr>
                            ))
                        )
                    ) : (
                        <tr>
                            <td colSpan="6" className="text-center py-4">
                                No data available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default SalesReport;