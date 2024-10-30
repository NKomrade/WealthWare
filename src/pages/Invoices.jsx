import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase"; // Import Firebase storage
import { collection, getDocs, addDoc, deleteDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Firebase storage methods
import { jsPDF } from "jspdf";
import "jspdf-autotable";

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

  const handleProductChange = (index, productId) => {
    const selectedProduct = products.find((p) => p.id === productId);
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

  const searchProductByID = async (productId) => {
    try {
      const q = query(collection(db, `users/${user.uid}/products`), where("id", "==", productId));
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.error(`Product with ID ${productId} not found.`);
        return null;
      }
  
      const productDoc = querySnapshot.docs[0];
      console.log("Found Product:", productDoc.data());
      return productDoc;
    } catch (error) {
      console.error("Error searching for product by ID:", error);
    }
  };

  const updateProductQuantity = async (index, quantity) => {
    const item = selectedItems[index];
    const product = item.product;
  
    if (!product) {
      console.error(`Invalid product at index ${index}`);
      return;
    }
  
    const productId = product.id; // Example: 'PROD-1454'
    console.log(`Searching for product with ID: ${productId}`);
  
    try {
      // Use a query to search by product 'id' field if necessary
      const productDoc = await searchProductByID(productId);
  
      if (!productDoc) {
        console.error(`Product with ID ${productId} not found.`);
        return;
      }
  
      const productData = productDoc.data();
      console.log("Fetched Product Data:", productData);
  
      const availableQuantity = productData.quantity;
      const newQuantity = availableQuantity - quantity;
  
      await updateDoc(productDoc.ref, { quantity: newQuantity });
      console.log(`Updated ${product.name} to new quantity: ${newQuantity}`);
    } catch (error) {
      console.error("Error updating product quantity:", error);
    }
  };      
  
  const handleViewInvoice = async (invoice) => {
    try {
      const pdfURL = invoice.pdfURL;
      if (pdfURL) {
        window.open(pdfURL, "_blank");
      } else {
        alert("No PDF found for this invoice.");
      }
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

  const generatePDF = async (invoiceData) => {
    const pdf = new jsPDF({ format: "a4", unit: "pt", orientation: "portrait" });
  
    // Set default font throughout the PDF
    pdf.setFont("helvetica", "normal");
  
    // Set Header Section
    pdf.setFontSize(20);
    pdf.text("Invoice", 40, 40);
  
    pdf.setFontSize(12);
    pdf.text(`Invoice ID: ${invoiceData.invoiceID}`, 400, 40);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 400, 60);
  
    // Customer Details
    pdf.setFontSize(14);
    pdf.text(`Customer Name: ${invoiceData.customerName}`, 40, 100);
    pdf.text(`Customer Address: ${invoiceData.customerAddress}`, 40, 120);
  
    // Prepare Items Table
    const items = invoiceData.items.map((item) => [
      item.product,
      item.quantity,
      `₹${item.unitPrice}`,
      `₹${(item.quantity * item.unitPrice).toFixed(2)}`,
    ]);
  
    // Add Items Table with black column headers and consistent font
    pdf.autoTable({
      startY: 160,
      head: [["Item", "Quantity", "Unit Price", "Total"]],
      body: items,
      theme: "grid",
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }, // Black header with white text
      bodyStyles: { font: "helvetica", fontStyle: "normal" }, // Consistent font for table content
    });
  
    // Calculate the Y position after the table
    const finalY = pdf.lastAutoTable.finalY + 20;
  
    // Add Totals Section with consistent font and size
    pdf.setFontSize(12); // Set font size for totals section
    pdf.setFont("helvetica", "normal"); // Ensure consistent font
  
    pdf.text(`Subtotal: ₹${invoiceData.subtotal.toFixed(2)}`, 400, finalY);
    pdf.text(`Tax (18%): ₹${invoiceData.tax.toFixed(2)}`, 400, finalY + 20);
    pdf.text(`Total Amount: ₹${invoiceData.total.toFixed(2)}`, 400, finalY + 40);
  
    // Generate PDF Blob and Upload to Firebase Storage
    const pdfBlob = pdf.output("blob");
    const pdfRef = ref(storage, `invoices/${invoiceData.invoiceID}.pdf`);
    await uploadBytes(pdfRef, pdfBlob);
    const pdfURL = await getDownloadURL(pdfRef);
  
    return pdfURL;
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

      try {
        const pdfURL = await generatePDF(invoiceData);
        const invoiceWithPDF = { ...invoiceData, pdfURL };
        await addDoc(collection(db, `users/${user.uid}/invoices`), invoiceWithPDF);

        for (const [index, item] of selectedItems.entries()) {
          if (item.product) {
            await updateProductQuantity(index, item.quantity);
          }
        }

        alert("Invoice saved successfully!");
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
        printWindow.document.close();
      } catch (error) {
        console.error("Error processing invoice:", error);
        alert(`Error: ${error.message}`);
      }
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
                  value={item.product?.id || ""}
                  onChange={(e) => handleProductChange(index, e.target.value)}
                  required
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price} (Available: {product.quantity})
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
                      onClick={() => handleViewInvoice(invoice)}
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