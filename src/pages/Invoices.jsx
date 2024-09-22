import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Invoices = () => {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceID] = useState(`INV-${Date.now()}`);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          const productsRef = collection(db, `users/${user.uid}/products`);
          const productSnapshot = await getDocs(productsRef);
          const userProducts = productSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(userProducts);
        } catch (error) {
          console.error("Error fetching products: ", error);
        }
      }
    };

    const fetchInvoices = async () => {
      if (user) {
        try {
          const invoicesRef = collection(db, `users/${user.uid}/invoices`);
          const invoiceSnapshot = await getDocs(invoicesRef);
          const userInvoices = invoiceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setInvoices(userInvoices);
        } catch (error) {
          console.error("Error fetching invoices: ", error);
        }
      }
    };

    fetchProducts();
    fetchInvoices();
  }, [user]);

  useEffect(() => {
    if (selectedProduct) {
      const price = selectedProduct.price;
      const newSubtotal = price * quantity;
      const newTax = newSubtotal * 0.18;
      setSubtotal(newSubtotal);
      setTax(newTax);
      setTotal(newSubtotal + newTax);
    }
  }, [selectedProduct, quantity]);

  const handlePrint = async (e) => {
    e.preventDefault();
    if (selectedProduct && customerName && customerAddress) {
      const invoiceData = {
        invoiceID,
        product: selectedProduct.name,
        quantity,
        customerName,
        customerAddress,
        subtotal,
        tax,
        total,
        date: new Date().toISOString().split('T')[0],
      };
      await addDoc(collection(db, `users/${user.uid}/invoices`), invoiceData);
      alert("Invoice saved successfully!");

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
          <html>
            <head>
              <title>Invoice</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .invoice { width: 80%; margin: auto; border: 1px solid #000; padding: 20px; }
                h1 { text-align: center; }
                .details { margin-bottom: 20px; }
                .details p { margin: 5px 0; }
                .total { font-size: 20px; color: red; text-align: right; }
              </style>
            </head>
            <body>
              <div class="invoice">
                <h1>WealthWare</h1>
                <div class="details">
                  <p><strong>Invoice ID:</strong> ${invoiceID}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                  <p><strong>Product:</strong> ${selectedProduct.name}</p>
                  <p><strong>Quantity:</strong> ${quantity}</p>
                  <p><strong>Customer Name:</strong> ${customerName}</p>
                  <p><strong>Customer Address:</strong> ${customerAddress}</p>
                  <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
                  <p><strong>Tax (18%):</strong> ₹${tax.toFixed(2)}</p>
                  <p class="total"><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
                </div>
              </div>
            </body>
          </html>
      `);
      printWindow.document.close();
      printWindow.print();
    } else {
      alert("Please fill out all required fields.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">WealthWare</h2>
      <form onSubmit={handlePrint} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice ID</label>
          <input type="text" value={invoiceID} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input type="text" value={new Date().toLocaleDateString()} readOnly className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Product</label>
          <select
            value={selectedProduct?.id || ""}
            onChange={(e) => setSelectedProduct(products.find(p => p.id === e.target.value))}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a product</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Customer Address</label>
          <input
            type="text"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
            required
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <p className="text-sm">Subtotal: <span className="font-bold">₹{subtotal.toFixed(2)}</span></p>
          <p className="text-sm">Tax (18%): <span className="font-bold">₹{tax.toFixed(2)}</span></p>
          <h3 className="text-lg font-bold">Total Amount: <span className="text-red-600">₹{total.toFixed(2)}</span></h3>
        </div>

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition duration-200">Print Invoice</button>
      </form>

      {/* Invoices Table */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Invoices</h3>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th className="border border-gray-200 p-2">Invoice ID</th>
              <th className="border border-gray-200 p-2">Product</th>
              <th className="border border-gray-200 p-2">Quantity</th>
              <th className="border border-gray-200 p-2">Customer Name</th>
              <th className="border border-gray-200 p-2">Total</th>
              <th className="border border-gray-200 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td className="border border-gray-200 p-2">{invoice.invoiceID}</td>
                <td className="border border-gray-200 p-2">{invoice.product}</td>
								<td className="border border-gray-200 p-2">{invoice.quantity}</td>
                <td className="border border-gray-200 p-2">{invoice.customerName}</td>
                <td className="border border-gray-200 p-2">₹{invoice.total.toFixed(2)}</td>
                <td className="border border-gray-200 p-2">{new Date(invoice.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;
