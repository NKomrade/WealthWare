import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // Import Firebase storage
import { collection, getDocs, deleteDoc, addDoc, doc, query, where, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Invoices = () => {
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [selectedItems, setSelectedItems] = useState([{ product: null, quantity: 1 }]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const [invoiceID] = useState(`INV-${Date.now()}`);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ productId: "", quantity: 1 });

  const auth = getAuth();
  const user = auth.currentUser;

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceID.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Show modal for invoices
  const openInvoiceModal = () => setShowInvoiceModal(true);
  const closeInvoiceModal = () => setShowInvoiceModal(false);

  // Calculate subtotal, tax, and total whenever selected items change
  useEffect(() => {
    // Recalculate tax and discount based on the updated subtotal
    const taxAmount = subtotal * (tax / 100);
    const discountAmount = subtotal * (discount / 100);
  
    setTotal(subtotal + taxAmount - discountAmount);
  }, [subtotal, tax, discount]);
  
  const handleAddProduct = () => {
    const selectedProduct = products.find((p) => p.id === newProduct.productId);
  
    if (!selectedProduct) {
      alert("Please select a valid product.");
      return;
    }
  
    if (newProduct.quantity > selectedProduct.quantity) {
      alert("Entered quantity exceeds available stock.");
      return;
    }
  
    const newItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      companyName: selectedProduct.companyName || "N/A",
      selectedQuantity: newProduct.quantity,
      price: selectedProduct.price, // Ensure price is added
      skuId: selectedProduct.skuId,
      quantity: selectedProduct.quantity - newProduct.quantity, // Deduct from available quantity
    };
  
    setSelectedItems((prevItems) => [...prevItems, newItem]); // Add the new item to the list
    setNewProduct({ productId: "", quantity: 1 }); // Reset form
    setSubtotal((prevSubtotal) => prevSubtotal + selectedProduct.price * newProduct.quantity); // Update subtotal
  };
  
  const handleRemoveProduct = async (index) => {
    const updatedItems = [...selectedItems];
    const removedItem = updatedItems.splice(index, 1)[0];
  
    if (removedItem) {
      // Ensure price and selectedQuantity are valid numbers
      const price = Number(removedItem.price) || 0;
      const quantity = Number(removedItem.selectedQuantity) || 0;
  
      // Update the subtotal safely
      setSubtotal((prevSubtotal) => prevSubtotal - price * quantity);
    }
  
    if (removedItem?.id) {
      try {
        const productRef = doc(db, `users/${user.uid}/products`, removedItem.id);
        const updatedQuantity = (removedItem.quantity || 0) + (removedItem.selectedQuantity || 0);
        await updateDoc(productRef, { quantity: updatedQuantity });
        console.log("Stock updated successfully!");
      } catch (error) {
        console.error("Error updating stock:", error);
      }
    }
  
    setSelectedItems(updatedItems);
  };
  
  const handleEditProduct = (index) => {
    const itemToEdit = selectedItems[index];
    setNewProduct({ productId: itemToEdit.id, quantity: itemToEdit.selectedQuantity });
    handleRemoveProduct(index); // Temporarily remove the item to allow editing
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
  
    if (!selectedItems.length || !customerName || !customerAddress || !paymentMethod) {
      alert("Please fill out all required fields.");
      return;
    }
  
    const invoiceData = {
      invoiceID,
      items: selectedItems.map((item) => ({
        companyName: item.companyName,
        product: item.name,
        skuId: item.skuId,
        quantity: item.selectedQuantity,
        unitPrice: item.price,
      })),
      customerName,
      customerAddress,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
    };
  
    try {
      const invoicesRef = collection(db, `users/${user.uid}/invoices`);
      await addDoc(invoicesRef, invoiceData); // Remove assignment to `newInvoiceRef`
  
      // Update stock in Firestore
      for (const item of selectedItems) {
        const productRef = doc(db, `users/${user.uid}/products`, item.id);
        const newQuantity = item.quantity - item.selectedQuantity;
        if (newQuantity < 0) {
          throw new Error(`Insufficient stock for ${item.name}.`);
        }
        await updateDoc(productRef, { quantity: newQuantity });
      }
  
      alert("Invoice saved successfully!");
  
      // Redirect to the generated PDF
      generatePDF(invoiceData);
    } catch (error) {
      console.error("Error saving invoice:", error);
      alert(`Error: ${error.message}`);
    }
  };
  
  // Updated generatePDF function
  const generatePDF = (invoice) => {
    const {
      invoiceID,
      customerName,
      customerAddress,
      items,
      subtotal,
      tax,
      discount,
      total,
      date,
    } = invoice;
  
    const taxAmount = subtotal * (tax / 100); // Calculate tax
    const discountAmount = subtotal * (discount / 100); // Calculate discount
  
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Invoice - ${invoiceID}</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 font-sans">
          <div class="invoice-container w-4/5 mx-auto p-6 bg-white border border-gray-300 rounded-lg mt-10">
            <div class="header flex justify-between items-center mb-6">
              <h1 class="text-3xl font-bold">Invoice</h1>
              <div class="text-right space-y-1">
                <p><span class="font-semibold">Invoice ID:</span> ${invoiceID}</p>
                <p><span class="font-semibold">Date:</span> ${date || "N/A"}</p>
              </div>
            </div>
            <p><span class="font-semibold">Customer Name:</span> ${customerName}</p>
            <p><span class="font-semibold">Customer Address:</span> ${customerAddress}</p>
            
            <table class="w-full border-collapse mt-6">
              <thead>
                <tr>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Item</th>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Brand Name</th>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Quantity</th>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Unit Price</th>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Total</th>
                </tr>
              </thead>
              <tbody>
                ${items
                  .map(
                    (item) => `
                    <tr>
                      <td class="border border-gray-300 px-4 py-2">${item.product}</td>
                      <td class="border border-gray-300 px-4 py-2">${item.companyName || "N/A"}</td>
                      <td class="border border-gray-300 px-4 py-2">${item.quantity}</td>
                      <td class="border border-gray-300 px-4 py-2">₹${item.unitPrice}</td>
                      <td class="border border-gray-300 px-4 py-2">₹${(item.unitPrice * item.quantity).toFixed(2)}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
  
            <div class="total text-right mt-4 space-y-1">
              <p><span class="font-semibold">Subtotal:</span> ₹${subtotal.toFixed(2)}</p>
              <p><span class="font-semibold">Tax (${tax}%):</span> ₹${taxAmount.toFixed(2)}</p>
              <p><span class="font-semibold">Discount (${discount}%):</span> ₹${discountAmount.toFixed(2)}</p>
              <p><span class="font-semibold text-lg">Total Amount:</span> ₹${total.toFixed(2)}</p>
            </div>
          </div>
          <div class="print-button text-center mt-6">
            <button onclick="window.print()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Print / Save as PDF
            </button>
          </div>
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Tax</label>
            <select
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              required
            >
              <option value={0}>0%</option>
              <option value={5}>5%</option>
              <option value={12}>12%</option>
              <option value={18}>18%</option>
              <option value={28}>28%</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Discount</label>
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
              <span className="ml-2">%</span>
            </div>
          </div>

          {/* Customer and Payment information */}
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
            <p className="text-sm font-medium text-gray-700">Tax ({tax}%): ₹{(subtotal * (tax / 100)).toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-700">Discount ({discount}%): ₹{(subtotal * (discount / 100)).toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-700">Total Amount: ₹{total.toFixed(2)}</p>
          </div>
  
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600">
            Print Invoice
          </button>
        </form>
      </div>

      {/* Right Section - Product Selection and "See Invoices" Button */}
      <div className="w-1/2 p-4 bg-white shadow-md rounded-md flex flex-col relative">
        {/* See Invoices Button at the top right */}
        <button
          onClick={openInvoiceModal}
          className="absolute top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          See Invoices
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Products</h2>


          {/* New Product Selection Section */}
          <div className="flex flex-col mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <select
                value={newProduct.productId || ""}
                onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.skuId} - {product.companyName} {product.name} (Available: {product.quantity})
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                min="1"
                max={products.find((p) => p.id === newProduct.productId)?.quantity || 0}
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 mt-4"
            >
              ✓
            </button>
          </div>

          {/* Canvas Area for Added Products */}
          <div className="flex-1 max-h-[calc(100vh-150px)] overflow-y-auto border border-gray-300 p-4 rounded-md">
            {selectedItems.length > 0 ? (
              <ul className="space-y-4">
                {selectedItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded-md">
                    <span>
                      <strong>{item.name}</strong> ({item.companyName}): {item.selectedQuantity} pcs
                    </span>
                    {selectedItems.length > 0 && ( // Only show buttons when items exist
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditProduct(index)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded-md"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded-md"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500">No products added yet.</p>
            )}
          </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-3/4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Invoices List</h3>
              <button onClick={closeInvoiceModal} className="text-gray-500 hover:text-black text-xl font-bold">
                X
              </button>
            </div>

            {/* Search Bar in Modal */}
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                placeholder="Search by Invoice ID or Customer Name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border px-2 py-1 rounded w-full"
              />
              <button className="bg-blue-500 text-white px-4 py-1 rounded">Search</button>
            </div>

            {/* Invoices Table */}
            <table className="w-full border-collapse border border-gray-400 table-fixed">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-2 py-1 border-b text-sm font-medium">Invoice ID</th>
                  <th className="px-2 py-1 border-b text-sm font-medium">Date</th>
                  <th className="px-2 py-1 border-b text-sm font-medium">Customer</th>
                  <th className="px-2 py-1 border-b text-sm font-medium">Total Amount</th>
                  <th className="px-2 py-1 border-b text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-100">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;