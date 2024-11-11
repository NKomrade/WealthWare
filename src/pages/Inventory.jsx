import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';

const Inventory = () => {
  const [showModal, setShowModal] = useState(false); 
  const [showPOModal, setShowPOModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isExistingSKU, setIsExistingSKU] = useState(false);
  const [filteredInv, setFilteredInv] = useState([]);
  const [poSearchQuery, setPoSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPOPage, setCurrentPOPage] = useState(1);
  const itemsPerPage = 5;
  const [productData, setProductData] = useState({
    skuId: '',
    name: '',
    companyName: '',
    price: '',
    quantity: '',
    description: '',
    purchaseDate: '',
  });
  const [editProductId, setEditProductId] = useState(null); // Track if editing a product

  const [poData, setPoData] = useState({
    poId: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName: '',
    supplierAddress: '',
    state: '',
    items: [{ brandName: '', brandProduct: '', quantity: '', costPrice: '' }],
  });

  const auth = getAuth();
  const [user, setUser] = useState(null);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handlePONextPage = () => {
    if (currentPOPage < totalPOTotalPages) {
      setCurrentPOPage(currentPOPage + 1);
    }
  };
  
  const handlePOPreviousPage = () => {
    if (currentPOPage > 1) {
      setCurrentPOPage(currentPOPage - 1);
    }
  };

  // Paginate the filtered products
  const paginatedProducts = filteredInv.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = (query) => {
    const filtered = products.filter((product) =>
      product.skuId.toLowerCase().includes(query.toLowerCase()) ||
      product.companyName.toLowerCase().includes(query.toLowerCase()) ||
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredInv(filtered);
    setCurrentPage(1); 
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProducts(currentUser);
        fetchPurchaseOrders(currentUser);
      } else {
        console.warn('No user is currently logged in.');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchProducts = async (currentUser) => {
    try {
      const productsRef = collection(db, `users/${currentUser.uid}/products`);
      const querySnapshot = await getDocs(productsRef);
      const userProducts = querySnapshot.docs.map((doc) => doc.data());
      setProducts(userProducts);
      setFilteredInv(userProducts);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  const fetchPurchaseOrders = async (currentUser) => {
    try {
      const poRef = collection(db, `users/${currentUser.uid}/purchaseOrders`);
      const querySnapshot = await getDocs(poRef);
      const userPOs = querySnapshot.docs.map((doc) => doc.data());
      setPurchaseOrders(userPOs);
    } catch (error) {
      console.error('Error fetching purchase orders: ', error);
    }
  };

  // Filter Purchase Orders based on PO ID, Company Name, or Supplier Address
  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    po.poId.toLowerCase().includes(poSearchQuery.toLowerCase()) ||
    po.companyName.toLowerCase().includes(poSearchQuery.toLowerCase()) ||
    po.supplierAddress.toLowerCase().includes(poSearchQuery.toLowerCase())
  );

  const totalPOTotalPages = Math.ceil(filteredPurchaseOrders.length / itemsPerPage);

  const paginatedPurchaseOrders = filteredPurchaseOrders.slice(
    (currentPOPage - 1) * itemsPerPage,
    currentPOPage * itemsPerPage
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handlePOChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...poData.items];
    items[index][name] = value;
    setPoData({ ...poData, items });
  };

  const addMoreItems = () => {
    setPoData({
      ...poData,
      items: [...poData.items, { brandName: '', brandProduct: '', quantity: '', costPrice: '' }],
    });
  };

  const removeItem = (index) => {
    const items = [...poData.items];
    if (items.length > 1) items.splice(index, 1);
    setPoData({ ...poData, items });
  };

  useEffect(() => {
    if (productData.companyName && productData.name) {
      const existingProduct = products.find(
        (product) =>
          product.companyName.toLowerCase() === productData.companyName.toLowerCase() &&
          product.name.toLowerCase() === productData.name.toLowerCase()
      );
  
      if (existingProduct) {
        // Populate product data with existing details, but leave quantity blank for new input
        setProductData((prevData) => ({
          ...prevData,
          skuId: existingProduct.skuId,
          price: existingProduct.price,
          description: existingProduct.description,
          purchaseDate: existingProduct.purchaseDate,
          quantity: '', // Leave quantity empty for user input
        }));
        setIsExistingSKU(true);
        setEditProductId(existingProduct.id); // Use existing product ID to trigger an update
      } else {
        setProductData((prevData) => ({
          ...prevData,
          skuId: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        }));
        setIsExistingSKU(false);
        setEditProductId(null); // Reset if no existing product found
      }
    }
  }, [productData.companyName, productData.name, products]);
  
  const openModal = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    setProductData({
      skuId: '', // Reset SKU ID to be empty each time the modal opens
      name: '',
      companyName: '',
      price: '',
      quantity: '',
      description: '',
      purchaseDate: todayDate,
    });
    setIsExistingSKU(false);
    setEditProductId(null);
    setShowModal(true);
  };  

  const closeModal = () => setShowModal(false);
  const openPOModal = () => setShowPOModal(true);
  const closePOModal = () => setShowPOModal(false);

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('No user logged in.');
      return;
    }
    try {
      // Save PO data to Firebase
      await addDoc(collection(db, `users/${user.uid}/purchaseOrders`), poData);
      setPurchaseOrders([...purchaseOrders, poData]);
  
      // Generate the PDF and open the print dialog
      generatePDF(poData); 
    } catch (error) {
      console.error('Error adding purchase order: ', error);
    }
  };
  
  const handleView = async (poId) => {
    try {
      const poRef = collection(db, `users/${user.uid}/purchaseOrders`);
      const querySnapshot = await getDocs(poRef);
      const poData = querySnapshot.docs
        .map((doc) => doc.data())
        .find((po) => po.poId === poId);
  
      if (poData) {
        generatePDF(poData); // Generate and show the PDF
      } else {
        alert('Purchase Order not found.');
      }
    } catch (error) {
      console.error('Error fetching PO: ', error);
    }
  };

  const handleDelete = async (poId) => {
    if (!user) {
      console.error('No user logged in.');
      return;
    }
    try {
      // Reference to the purchase orders collection
      const poRef = collection(db, `users/${user.uid}/purchaseOrders`);
      const querySnapshot = await getDocs(poRef);
      const docToDelete = querySnapshot.docs.find((doc) => doc.data().poId === poId);
  
      if (docToDelete) {
        await deleteDoc(docToDelete.ref); // Use deleteDoc() from Firestore
        // Update the state to reflect the change in UI
        setPurchaseOrders(purchaseOrders.filter((po) => po.poId !== poId));
        alert('Purchase order deleted successfully!');
      } else {
        console.warn('No matching purchase order found.');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
    }
  };    
  
  const generatePDF = (poData) => {
    const { poId, companyName, supplierAddress, state, items } = poData;
    const subtotal = items.reduce((acc, item) => acc + item.quantity * item.costPrice, 0);
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
  
    const newWindow = window.open('', '_blank');
    newWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Order - ${poId}</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-gray-100 font-sans">
          <div class="po-container w-4/5 mx-auto p-6 bg-white border border-gray-300 rounded-lg mt-10">
              <div class="header flex justify-between items-center mb-6">
                  <h1 class="text-3xl font-bold">Purchase Order</h1>
                  <div class="text-right space-y-1">
                      <p><span class="font-semibold">PO ID:</span> ${poId}</p>
                      <p class="ml-2"><span class="font-semibold">Date:</span> ${new Date().toLocaleDateString()}</p>
                  </div>
              </div>
              <p><span class="font-semibold">Company Name:</span> ${companyName}</p>
              <p><span class="font-semibold">Supplier Address:</span> ${supplierAddress}</p>
              <p><span class="font-semibold">State:</span> ${state}</p>
              
              <table class="w-full border-collapse mt-6">
                  <thead>
                      <tr>
                          <th class="border border-gray-300 px-4 py-2 bg-black text-white text-left">Brand Name</th>
                          <th class="border border-gray-300 px-4 py-2 bg-black text-white text-left">Product</th>
                          <th class="border border-gray-300 px-4 py-2 bg-black text-white text-left">Quantity</th>
                          <th class="border border-gray-300 px-4 py-2 bg-black text-white text-left">Cost Price</th>
                          <th class="border border-gray-300 px-4 py-2 bg-black text-white text-left">Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${items.map(item => `
                          <tr>
                              <td class="border border-gray-300 px-4 py-2">${item.brandName}</td>
                              <td class="border border-gray-300 px-4 py-2">${item.brandProduct}</td>
                              <td class="border border-gray-300 px-4 py-2">${item.quantity}</td>
                              <td class="border border-gray-300 px-4 py-2">₹${item.costPrice}</td>
                              <td class="border border-gray-300 px-4 py-2">₹${(item.quantity * item.costPrice).toFixed(2)}</td>
                          </tr>`).join('')}
                  </tbody>
              </table>

              <div class="total text-right mt-4 space-y-1">
                  <p><span class="font-semibold">Subtotal:</span> ₹${subtotal.toFixed(2)}</p>
                  <p><span class="font-semibold">Tax (18%):</span> ₹${tax.toFixed(2)}</p>
                  <p><span class="font-semibold text-lg">Total:</span> ₹${total.toFixed(2)}</p>
              </div>
          </div>

          <!-- Print Button -->
          <div class="print-button text-center mt-6">
              <button onclick="printPDF()" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  Print / Save as PDF
              </button>
          </div>

          <script>
              function printPDF() {
                  window.print(); // Opens the print dialog for print or save as PDF
              }
          </script>

          <style>
              @media print {
                  .print-button {
                      display: none; /* Hide print button on print */
                  }

                  body {
                      -webkit-print-color-adjust: exact; /* Ensure colors are printed accurately */
                      margin: 0;
                      padding: 0;
                  }

                  .po-container {
                      width: 100%; /* Utilize full width for print */
                      border: none;
                  }

                  /* Set page orientation to portrait */
                  @page {
                      size: A4 portrait; /* Set A4 paper size in portrait orientation */
                      margin: 20mm;
                  }
              }
          </style>
      </body>
      </html>
    `);
  };      

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error('No user logged in.');
      return;
    }
  
    try {
      if (editProductId) {
        // Get the existing product and calculate new quantity
        const existingProduct = products.find((product) => product.id === editProductId);
        const newQuantity = parseInt(existingProduct.quantity) + parseInt(productData.quantity);
  
        // Update the product in Firestore with new data, adding the quantities
        const productRef = doc(db, `users/${user.uid}/products`, editProductId);
        await updateDoc(productRef, {
          ...productData,
          quantity: newQuantity, // Sum of prior and new quantity
        });
  
        // Update local state to reflect changes immediately in UI
        setProducts(products.map((product) =>
          product.id === editProductId ? { ...productData, quantity: newQuantity, id: editProductId } : product
        ));
  
        setEditProductId(null); // Reset after updating
      } else {
        // Add a new product if it doesn't exist
        const docRef = await addDoc(collection(db, `users/${user.uid}/products`), productData);
        setProducts([...products, { ...productData, id: docRef.id }]); // Update local state directly
      }
  
      // Reset form and close modal
      setProductData({
        skuId: '',
        name: '',
        companyName: '',
        price: '',
        quantity: '',
        description: '',
        purchaseDate: '',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding or updating product: ', error);
    }
  };
  
  const handleEdit = (product) => {
    setProductData(product);
    setEditProductId(product.id); // Set the product ID to edit
    setIsExistingSKU(true); // SKU ID is pre-existing and should appear in green
    setShowModal(true);
  };

  const handleProductDelete = async (skuId) => {
    if (!user) {
      console.error('No user logged in.');
      return;
    }
  
    try {
      const productsRef = collection(db, `users/${user.uid}/products`);
      const q = query(productsRef, where("skuId", "==", skuId));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await deleteDoc(docRef);
  
        // Fetch products after deleting
        fetchProducts(user); // Refreshes products to update the UI
        alert('Product deleted successfully!');
      } else {
        console.error('No product found with the specified SKU ID.');
      }
    } catch (error) {
      console.error('Error deleting product: ', error);
    }
  };    

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
      <div className="mb-4">
        <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded mr-4">
          Add Inventory
        </button>
        <button onClick={openPOModal} className="bg-green-500 text-white px-4 py-2 rounded">
          Generate PO
        </button>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold">Inventory List</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search Inventory..."
            className="border px-2 py-1 rounded"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Search</button>
        </div>
      </div>
      <table className="w-full mt-4 border-collapse border border-gray-400">
        <thead className="bg-black text-white">
          <tr>
            <th className="border border-gray-300 p-2">SKU ID</th>
            <th className="border border-gray-300 p-2">Brand Name</th>
            <th className="border border-gray-300 p-2">Product Name</th>
            <th className="border border-gray-300 p-2">Selling Price</th>
            <th className="border border-gray-300 p-2">Quantity</th>
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Purchase Date</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100">
          {paginatedProducts.length > 0 ? (
            paginatedProducts.map((product, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{product.skuId}</td>
                <td className="border border-gray-300 p-2">{product.companyName}</td>
                <td className="border border-gray-300 p-2">{product.name}</td>
                <td className="border border-gray-300 p-2">₹ {product.price}</td>
                <td className="border border-gray-300 p-2">{product.quantity}</td>
                <td className="border border-gray-300 p-2">{product.description}</td>
                <td className="border border-gray-300 p-2">{product.purchaseDate}</td>
                <td className="border border-gray-300 p-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-4"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleProductDelete(product.skuId)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center p-2">
                No products available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {filteredInv.length >= 5 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="text-lg">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
      )}

      {/* Purchase Order Section */}
      <div className="mb-4 flex justify-between items-center pt-10">
        <h3 className="text-xl font-semibold">Purchase Orders</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search Purchase Orders..."
            className="border px-2 py-1 rounded"
            value={poSearchQuery}
            onChange={(e) => setPoSearchQuery(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Search</button>
        </div>
      </div>
      <table className="w-full mt-4 border-collapse border border-gray-400">
        <thead className="bg-black text-white">
          <tr>
            <th className="border border-gray-300 p-2">PO ID</th>
            <th className="border border-gray-300 p-2">Company Name</th>
            <th className="border border-gray-300 p-2">Supplier Address</th>
            <th className="border border-gray-300 p-2">State</th>
            <th className="border border-gray-300 p-2">Action</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100">
          {paginatedPurchaseOrders.length > 0 ? (
            paginatedPurchaseOrders.map((po, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{po.poId}</td>
                <td className="border border-gray-300 p-2">{po.companyName}</td>
                <td className="border border-gray-300 p-2">{po.supplierAddress}</td>
                <td className="border border-gray-300 p-2">{po.state}</td>
                <td className="border border-gray-300 p-2">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                      onClick={() => handleView(po.poId)}
                    >
                      View
                    </button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => handleDelete(po.poId)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-2">
                No purchase orders available
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination controls for Purchase Orders */}
      {filteredPurchaseOrders.length >= 5 && (
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={handlePOPreviousPage}
            disabled={currentPOPage === 1}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="text-lg">
            {currentPOPage} / {totalPOTotalPages}
          </span>
          <button
            onClick={handlePONextPage}
            disabled={currentPOPage === totalPOTotalPages}
            className="bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            {">"}
          </button>
        </div>
        )}

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-2xl mb-4">{editProductId ? 'Edit Inventory' : 'Add Inventory'}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Purchase Date */}
              <div className="col-span-2">
                <label className="block mb-2">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={productData.purchaseDate}
                  onChange={handleChange}
                  className="border w-full p-2 bg-gray-100"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block mb-2">Brand Name</label>
                <input
                  name="companyName"
                  value={productData.companyName}
                  placeholder="Enter brand name"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block mb-2">Product Name</label>
                <input
                  name="name"
                  value={productData.name}
                  placeholder="Enter product name"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>

              {/* SKU ID (read-only for editing) */}
              <div className="col-span-2">
                <label className="block mb-2">SKU ID</label>
                <input
                  name="skuId"
                  value={productData.skuId}
                  placeholder="SKU ID will auto-fill if product exists"
                  readOnly
                  className={`border w-full p-2 ${isExistingSKU ? 'text-green-500' : 'text-black'}`}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block mb-2">Price</label>
                <input
                  name="price"
                  value={productData.price}
                  placeholder="Enter price"
                  type="number"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block mb-2">Quantity</label>
                <input
                  name="quantity"
                  value={productData.quantity}
                  placeholder="Enter quantity"
                  type="number"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  value={productData.description}
                  placeholder="Enter product description"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>

              {/* Form Buttons */}
              <div className="col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  {editProductId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPOModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/2">
            <h2 className="text-2xl mb-4">Generate Purchase Order</h2>
            <form onSubmit={handlePOSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">PO ID</label>
                <input className="border p-2 w-full bg-gray-100" value={poData.poId} readOnly />
              </div>
              <div>
                <label className="block mb-2">Company Name</label>
                <input
                  className="border p-2 w-full"
                  placeholder="Enter company name"
                  value={poData.companyName}
                  onChange={(e) => setPoData({ ...poData, companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2">Supplier Address</label>
                <input
                  className="border p-2 w-full"
                  placeholder="Enter supplier address"
                  value={poData.supplierAddress}
                  onChange={(e) => setPoData({ ...poData, supplierAddress: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-2">State</label>
                <input
                  className="border p-2 w-full"
                  placeholder="Enter state"
                  value={poData.state}
                  onChange={(e) => setPoData({ ...poData, state: e.target.value })}
                />
              </div>

              {poData.items.map((item, index) => (
                <div key={index} className="col-span-2">
                  <div className="grid grid-cols-5 gap-2 items-end">
                    <input
                      className="border p-2"
                      placeholder="Brand Name"
                      value={item.brandName}
                      onChange={(e) => handlePOChange(index, e)}
                      name="brandName"
                    />
                    <input
                      className="border p-2"
                      placeholder="Product"
                      value={item.brandProduct}
                      onChange={(e) => handlePOChange(index, e)}
                      name="brandProduct"
                    />
                    <input
                      className="border p-2"
                      placeholder="Quantity"
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handlePOChange(index, e)}
                      name="quantity"
                    />
                    <input
                      className="border p-2"
                      placeholder="Cost Price"
                      type="number"
                      value={item.costPrice}
                      onChange={(e) => handlePOChange(index, e)}
                      name="costPrice"
                    />
                    <button
                      type="button"
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => removeItem(index)}
                    >
                      -
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addMoreItems}
                className="bg-blue-500 text-white px-4 py-2 mt-2"
              >
                Add More
              </button>

              <div className="col-span-2 flex justify-end mt-4">
                <button
                  type="button"
                  onClick={closePOModal}
                  className="bg-red-500 text-white px-4 py-2 mr-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-green-500 text-white px-4 py-2">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;