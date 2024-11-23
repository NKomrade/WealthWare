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
    const newSubtotal = selectedItems.reduce((acc, item) => {
      if (item.product) {
        return acc + item.product.price * item.quantity;
      }
      return acc;
    }, 0);
  
    const taxAmount = newSubtotal * (tax / 100);
    const discountAmount = (newSubtotal + taxAmount) * (discount / 100); // Calculate discount based on total
  
    // Set subtotal, tax, and total directly
    setSubtotal(newSubtotal);
    setTotal(newSubtotal + taxAmount - discountAmount); // Update total directly with discount applied
  }, [selectedItems, tax, discount]);
  

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
      discount,
      total,
      paymentMethod,
      date: new Date().toISOString().split("T")[0],
    };
  
    try {
      const invoicesRef = collection(db, `users/${user.uid}/invoices`);
      const newInvoiceRef = await addDoc(invoicesRef, invoiceData);

      // Add the newly created invoice to the local state
      setInvoices((prevInvoices) => [
        ...prevInvoices,
        { id: newInvoiceRef.id, ...invoiceData },
      ]);
  
      for (const [index, item] of selectedItems.entries()) {
        if (item.product) {
          await updateProductQuantity(index, item.quantity);
        }
      }
  
      alert("Invoice saved successfully!");
      generatePDF(invoiceData);
    } catch (error) {
      console.error("Error processing invoice:", error);
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
      total,
      discount, // Fetch discount directly from the database
      date, // Fetch the date directly from the database
    } = invoice;
  
    const discountAmount = (subtotal + tax) * (discount / 100);
  
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
                <p class="ml-2"><span class="font-semibold">Date:</span> ${date || "N/A"}</p> <!-- Fetch date from database -->
              </div>
            </div>
            <p><span class="font-semibold">Customer Name:</span> ${customerName}</p>
            <p><span class="font-semibold">Customer Address:</span> ${customerAddress}</p>
            
            <table class="w-full border-collapse mt-6">
              <thead>
                <tr>
                  <th class="border border-gray-300 px-4 py-2 bg-black text-left text-white">Item</th>
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
              <p><span class="font-semibold">Tax (${tax}%):</span> ₹${(subtotal * (tax / 100)).toFixed(2)}</p>
              <p><span class="font-semibold">Discount (${discount}%):</span> -₹${discountAmount.toFixed(2)}</p> <!-- Fetch discount from database -->
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
  
    // Open a new window and write the PDF content to it
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
            <p className="text-sm font-medium text-gray-700">Tax ({tax}%): ₹{tax.toFixed(2)}</p>
            <p className="text-sm font-medium text-gray-700">Discount: {discount}%</p>
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

        {/* Product selection and quantity inputs with fixed height and scrollable content */}
        <div className="flex-1 max-h-[calc(100vh-150px)] overflow-y-auto border border-gray-300 p-4 rounded-md">
          {selectedItems.map((item, index) => (
            <div key={index} className="space-y-2 w-full">
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
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddProduct}
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4"
          >
            Add More Products
          </button>
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