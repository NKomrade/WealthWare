import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Invoices = () => {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [selectedItems, setSelectedItems] = useState([{ product: null, quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceID] = useState(`INV-${Date.now()}`);
  const [paymentMethod, setPaymentMethod] = useState("");

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          const productsRef = collection(db, `users/${user.uid}/products`);
          const productSnapshot = await getDocs(productsRef);
          const userProducts = productSnapshot.docs.map((doc) => ({
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
          const userInvoices = invoiceSnapshot.docs.map((doc) => ({
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
    const newSubtotal = selectedItems.reduce((acc, item) => {
      if (item.product) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 0);

    const newTax = newSubtotal * 0.18;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  }, [selectedItems]);

  const handleAddProduct = () => {
    setSelectedItems([...selectedItems, { product: null, quantity: 1 }]);
  };

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find((p) => p.id === productId);
    const updatedItems = [...selectedItems];
    updatedItems[index].product = selectedProduct;
    setSelectedItems(updatedItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = quantity;
    setSelectedItems(updatedItems);
  };

  const handlePrint = async (e) => {
    e.preventDefault();
    if (selectedItems.length && customerName && customerAddress && paymentMethod) {
      const invoiceData = {
        invoiceID,
        items: selectedItems.map((item) => ({
          product: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
        customerName,
        customerAddress,
        subtotal,
        tax,
        total,
        paymentMethod,
        date: new Date().toISOString().split("T")[0],
      };
  
      // Save the invoice data to Firestore
      await addDoc(collection(db, `users/${user.uid}/invoices`), invoiceData);
      alert("Invoice saved successfully!");
  
      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invoice</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .invoice-container { width: 80%; margin: auto; padding: 20px; border: 1px solid #ddd; }
                .header, .footer { display: flex; justify-content: space-between; align-items: center; }
                .invoice-details, .payment-details { margin-top: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { text-align: right; }
            </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Invoice</h1>
              <p><strong>Invoice ID:</strong> ${invoiceID}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="invoice-details">
              <p><strong>Customer Name:</strong> ${customerName}</p>
              <p><strong>Customer Address:</strong> ${customerAddress}</p>
            </div>
            <table>
              <thead>
                <tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${selectedItems
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.product.price}</td>
                    <td>₹${(item.product.price * item.quantity).toFixed(2)}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="total">
              <p><strong>Subtotal:</strong> ₹${subtotal.toFixed(2)}</p>
              <p><strong>Tax (18%):</strong> ₹${tax.toFixed(2)}</p>
              <p><strong>Total Amount:</strong> ₹${total.toFixed(2)}</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
            };
          </script>
        </body>
        </html>
      `);
  
      printWindow.document.close(); // Close the document stream for the new window
    } else {
      alert("Please fill out all required fields.");
    }
  };  

  return (
    <div className="flex flex-row space-x-4 p-6 bg-white shadow-lg rounded-lg">
      {/* Left Section - Invoice Form */}
      <div className="w-1/2 p-4 bg-white shadow-md rounded-md">
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

          {selectedItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  value={item.product?.id || ""}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(index, Number(e.target.value))}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Add More Products
          </button>

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
            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select payment method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700">Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-700">Tax (18%): ₹{tax.toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-700">Total Amount: ₹{total.toFixed(2)}</p>
          </div>

          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
            Print Invoice
          </button>
        </form>
      </div>

      {/* Right Section - Invoices List */}
      <div className="w-1/2 p-4 bg-white shadow-md rounded-md">
        <h3 className="text-xl font-semibold mb-4">Invoices List</h3>
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Invoice ID</th>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Customer</th>
              <th className="px-4 py-2 border-b">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-4 py-2 border-b">{invoice.invoiceID}</td>
                <td className="px-4 py-2 border-b">{invoice.date}</td>
                <td className="px-4 py-2 border-b">{invoice.customerName}</td>
                <td className="px-4 py-2 border-b">₹{invoice.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;