import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firebase storage
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
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

  // Fetch Products and Invoices from Firestore
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

  // Calculate subtotal, tax, and total whenever selected items change
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

  const handleRemoveProduct = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
  };

  const handleProductChange = async (index, skuId) => {
    const selectedProductDoc = await searchProductById(skuId);
    if (!selectedProductDoc) return;
  
    const selectedProduct = selectedProductDoc.data();
    const updatedItems = [...selectedItems];
    updatedItems[index].product = selectedProduct;
    setSelectedItems(updatedItems);
  };    

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...selectedItems];
    const product = updatedItems[index].product;
    if (product && quantity > product.quantity) {
      alert("Entered quantity exceeds available stock.");
    } else {
      updatedItems[index].quantity = quantity;
      setSelectedItems(updatedItems);
    }
  };

  const searchProductById = async (skuId) => {
    try {
      const q = query(collection(db, `users/${user.uid}/products`), where("skuId", "==", skuId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.error(`Product with SKU ID ${skuId} not found.`);
        return null;
      }
  
      const productDoc = querySnapshot.docs[0];
      console.log("Found Product:", productDoc.data());
      return productDoc;
    } catch (error) {
      console.error("Error searching for product by SKU ID:", error);
    }
  };

  const updateProductQuantity = async (index, quantity) => {
    const item = selectedItems[index];
    const product = item.product;
  
    if (!product) {
      console.error(`Invalid product at index ${index}`);
      return;
    }
  
    const skuId = product.skuId; // Use the correct field name
    console.log(`Searching for product with SKU ID: ${skuId}`);
  
    try {
      const productDoc = await searchProductById(skuId);
  
      if (!productDoc) {
        console.error(`Product with SKU ID ${skuId} not found.`);
        return;
      }
  
      const productData = productDoc.data();
      const availableQuantity = parseInt(productData.quantity);
      const newQuantity = availableQuantity - quantity;
  
      if (newQuantity < 0) {
        alert("Not enough stock available.");
        return;
      }
  
      await updateDoc(productDoc.ref, { quantity: newQuantity });
      console.log(`Updated ${product.name} to new quantity: ${newQuantity}`);
    } catch (error) {
      console.error("Error updating product quantity:", error);
    }
  };        
  
  const handleViewInvoice = async (invoiceID) => {
    try {
      // Query the invoices collection by matching the provided invoiceID
      const invoicesRef = collection(db, `users/${user.uid}/invoices`);
      const q = query(invoicesRef, where("invoiceID", "==", invoiceID));
      const querySnapshot = await getDocs(q);
  
      // If no matching invoice is found, alert the user
      if (querySnapshot.empty) {
        alert("No invoice found with this ID.");
        return;
      }
  
      // Get the first matching invoice document and its data
      const invoiceData = querySnapshot.docs[0].data();
  
      console.log("Invoice Data:", invoiceData); // Optional: For debugging purposes
  
      // Generate PDF with the fetched invoice data
      generatePDF(invoiceData);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      alert("Failed to fetch the invoice. Please try again.");
    }
  };   

  const handleDeleteInvoice = async (id) => {
    if (user) {
      await deleteDoc(doc(db, `users/${user.uid}/invoices`, id));
      setInvoices(invoices.filter((invoice) => invoice.id !== id));
      alert("Invoice deleted successfully!");
    }
  };

  const handlePrint = async (e) => {
    e.preventDefault();
  
    // Validate form fields
    if (!selectedItems.length || !customerName || !customerAddress || !paymentMethod) {
      alert("Please fill out all required fields.");
      return;
    }
  
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
  
    try {
      // Save the invoice data to Firestore
      const invoiceRef = await addDoc(
        collection(db, `users/${user.uid}/invoices`),
        invoiceData
      );
  
      // Update product quantities in Firestore
      for (const [index, item] of selectedItems.entries()) {
        if (item.product) {
          await updateProductQuantity(index, item.quantity);
        }
      }
  
      alert("Invoice saved successfully!");
  
      // Generate the invoice PDF in a new tab
      const printWindow = window.open("", "_blank");
      printWindow.document.write(generatePDF(invoiceData));
      printWindow.document.close();
    } catch (error) {
      console.error("Error processing invoice:", error);
      alert(`Error: ${error.message}`);
    }
  };
  
  const generatePDF = (invoice) => {
    const { invoiceID, customerName, customerAddress, items, subtotal, tax, total } = invoice;
  
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice - ${invoiceID}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
            }

            .invoice-container {
              width: 80%;
              margin: auto;
              padding: 20px;
              border: 1px solid #ddd;
            }

            .header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }

            th {
              background-color: #f2f2f2;
            }

            .total {
              text-align: right;
              margin-top: 10px;
            }

            .print-button {
              margin-top: 20px;
              text-align: center;
            }

            /* CSS for printing */
            @media print {
              .print-button {
                display: none; /* Hide print button when printing */
              }

              body {
                -webkit-print-color-adjust: exact; /* Ensure colors are printed accurately */
                margin: 0;
                padding: 0;
              }

              .invoice-container {
                width: 100%; /* Utilize full width for print */
                border: none;
              }

              th {
                background-color: #f2f2f2 !important; /* Ensure table headers print correctly */
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Invoice</h1>
              <p><strong>Invoice ID:</strong> ${invoiceID}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>Customer Address:</strong> ${customerAddress}</p>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                    <tr>
                      <td>${item.product}</td>
                      <td>${item.quantity}</td>
                      <td>₹${item.unitPrice}</td>
                      <td>₹${(item.unitPrice * item.quantity).toFixed(2)}</td>
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
            <div class="print-button">
              <button onclick="printPDF()" style="padding: 10px 20px; font-size: 16px;">
                Print / Save as PDF
              </button>
            </div>
          </div>

          <script>
            function printPDF() {
              window.print(); // Opens the print dialog for printing or saving as PDF
            }
          </script>
        </body>
      </html>
    `;
  
    const newWindow = window.open("", "_blank");
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };       

  return (
    <div className="flex flex-row space-x-4 p-6 bg-white shadow-lg rounded-lg">
      {/* Left Section - Invoice Form */}
      <div className="w-1/2 p-4 bg-white shadow-md rounded-md">
        <h2 className="text-2xl font-bold mb-4 text-center">WealthWare</h2>
        <form onSubmit={handlePrint} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Invoice ID</label>
            <input
              type="text"
              value={invoiceID}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="text"
              value={new Date().toLocaleDateString()}
              readOnly
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
  
          {selectedItems.map((item, index) => (
            <div key={index} className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product</label>
                <select
                  value={item.product?.skuId || ""}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.skuId} value={product.skuId}>
                      {product.name} - ₹{product.price} (SKU: {product.skuId}, Available: {product.quantity})
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
  
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded-md"
                >
                  -
                </button>
              )}
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
          <table className="min-w-full border border-gray-300 table-fixed">
            <thead>
              <tr>
                <th className="px-2 py-1 border-b text-sm font-medium text-gray-700">Invoice ID</th>
                <th className="px-2 py-1 border-b text-sm font-medium text-gray-700">Date</th>
                <th className="px-2 py-1 border-b text-sm font-medium text-gray-700">Customer</th>
                <th className="px-2 py-1 border-b text-sm font-medium text-gray-700">Total Amount</th>
                <th className="px-2 py-1 border-b text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="text-sm">
                  <td className="px-2 py-1 border-b text-center truncate">{invoice.invoiceID}</td>
                  <td className="px-2 py-1 border-b text-center truncate">{invoice.date}</td>
                  <td className="px-2 py-1 border-b text-center truncate">{invoice.customerName}</td>
                  <td className="px-2 py-1 border-b text-center truncate">₹{invoice.total.toFixed(2)}</td>
                  <td className="px-2 py-1 border-b text-center">
                    <button
                      onClick={() => handleViewInvoice(invoice.invoiceID)}
                      className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs mr-2"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-md text-xs -ml-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      </div>
    </div>
  );  
};

export default Invoices;