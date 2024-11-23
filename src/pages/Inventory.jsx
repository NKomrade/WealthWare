import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState(''); // User-entered password
  const [setCorrectPassword] = useState(null); // Fetched password
  const [selectedAction, setSelectedAction] = useState(null); // Tracks "edit" or "delete"
  const [selectedProduct, setSelectedProduct] = useState(null); // Product being edited or deleted
  const itemsPerPage = 5;
  const [productData, setProductData] = useState({
    skuId: '',
    name: '',
    companyName: '',
    price: '',
    quantity: '',
    description: '',
  });
  const [editProductId, setEditProductId] = useState(null); // Track if editing a product

  const [poData, setPoData] = useState({
    poId: '', 
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
  }, [auth]); // Add `auth` to the dependency array  

  useEffect(() => {
    if (user) {
      fetchUserPassword().then((password) => {
        setCorrectPassword(password); // Store the fetched password for validation
      });
    }
  }, [user]);  

  
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

  const fetchUserPassword = async () => {
    try {
      if (!user || !user.uid) {
        console.error('User is not logged in or UID is missing.');
        return null;
      }
  
      const userDocRef = doc(db, 'users', user.uid); // Reference the user's document
      const userDocSnap = await getDoc(userDocRef);
  
      if (userDocSnap.exists()) {
        return userDocSnap.data().actionPassword || null; // Fetch the action password field
      } else {
        console.error('User document does not exist.');
        return null;
      }
    } catch (error) {
      console.error('Error fetching password:', error);
      return null;
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
    const fetchNextSkuId = async () => {
      if (!user) {
        console.error("No user logged in.");
        return;
      }
  
      try {
        const productsRef = collection(db, `users/${user.uid}/products`);
        const querySnapshot = await getDocs(productsRef);
  
        // Extract and parse all numeric SKU IDs, removing the "SKU-" prefix
        const skus = querySnapshot.docs
          .map((doc) => doc.data().skuId?.replace("SKU-", "")) // Remove prefix
          .map((sku) => parseInt(sku, 10)) // Convert to number
          .filter((sku) => !isNaN(sku)); // Filter out invalid or NaN values
  
        // Find the maximum SKU ID or fallback to 0
        const maxSku = skus.length > 0 ? Math.max(...skus) : 0;
  
        // Increment max SKU and format it as a 9-digit number with the "SKU-" prefix
        const nextSku = `SKU-${(maxSku + 1).toString().padStart(9, "0")}`;
  
        // Set the next SKU in product data
        setProductData((prevData) => ({
          ...prevData,
          skuId: nextSku,
        }));
      } catch (error) {
        console.error("Error generating next SKU ID: ", error);
        setProductData((prevData) => ({
          ...prevData,
          skuId: "SKU-000000001", // Fallback SKU
        }));
      }
    };
  
    if (productData.companyName && productData.name) {
      const existingProduct = products.find(
        (product) =>
          product.companyName.toLowerCase() === productData.companyName.toLowerCase() &&
          product.name.toLowerCase() === productData.name.toLowerCase()
      );
  
      if (existingProduct) {
        // Populate product data with existing details, including the same SKU ID
        setProductData((prevData) => ({
          ...prevData,
          skuId: existingProduct.skuId,
          price: existingProduct.price,
          description: existingProduct.description,
          quantity: '', // Leave quantity empty for user input
        }));
        setIsExistingSKU(true);
        setEditProductId(existingProduct.id); // Use existing product ID to trigger an update
      } else {
        setIsExistingSKU(false);
        setEditProductId(null); // Reset if no existing product found
        fetchNextSkuId(); // Fetch the next sequential SKU ID
      }
    }
  }, [productData.companyName, productData.name, products, user]);  
  
  const openModal = () => {
    setProductData({
      skuId: '', // Reset SKU ID to be empty each time the modal opens
      name: '',
      companyName: '',
      price: '',
      quantity: '',
      description: '',
    });
    setIsExistingSKU(false);
    setEditProductId(null);
    setShowModal(true);
  };  

  const openEditModal = (product) => {
    setProductData({
      skuId: product.skuId,
      name: product.name,
      companyName: product.companyName,
      price: product.price,
      quantity: product.quantity,
      description: product.description,
    });
    setEditProductId(product.id); // Set the ID for tracking the edit operation
    setIsExistingSKU(true); // Indicate that this SKU already exists
    setShowModal(true); // Open the modal
  };  

  const closeModal = () => setShowModal(false);
  
  const openPOModal = async () => {
    if (!user) {
      console.error("No user logged in.");
      return;
    }
  
    try {
      const poRef = collection(db, `users/${user.uid}/purchaseOrders`);
      const querySnapshot = await getDocs(poRef);
  
      // Extract and parse all numeric PO IDs, removing the "PO-" prefix
      const poIds = querySnapshot.docs
        .map((doc) => doc.data().poId?.replace("PO-", "")) // Remove "PO-" prefix
        .map((id) => parseInt(id, 10)) // Convert to integer
        .filter((id) => !isNaN(id)); // Filter out invalid or NaN values
  
      // Find the maximum PO ID or fallback to 0
      const maxPoId = poIds.length > 0 ? Math.max(...poIds) : 0;
  
      // Generate the next PO ID
      const nextPoId = `PO-${(maxPoId + 1).toString().padStart(9, "0")}`;
  
      // Set the PO ID and open the modal
      setPoData((prevData) => ({
        ...prevData,
        poId: nextPoId,
      }));
      setShowPOModal(true); // Open the modal
    } catch (error) {
      console.error("Error generating PO-ID: ", error);
  
      // Fallback for first PO ID if an error occurs
      setPoData((prevData) => ({
        ...prevData,
        poId: 'PO-000000001',
      }));
      setShowPOModal(true); // Open the modal
    }
  };  

  const closePOModal = () => setShowPOModal(false);

  const handlePOSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      console.error("No user logged in.");
      return;
    }
  
    try {
      // Reference the purchase orders collection
      const poRef = collection(db, `users/${user.uid}/purchaseOrders`);
      
      // Get all existing purchase orders to calculate the next PO-ID
      const querySnapshot = await getDocs(poRef);
      
      // Extract and parse all numeric PO IDs, removing the "PO-" prefix
      const poIds = querySnapshot.docs
        .map((doc) => doc.data().poId?.replace("PO-", "")) // Remove prefix
        .map((id) => parseInt(id, 10)) // Convert to number
        .filter((id) => !isNaN(id)); // Filter out invalid or NaN values
  
      // Find the maximum PO ID or fallback to 0 for the first PO
      const maxPoId = poIds.length > 0 ? Math.max(...poIds) : 0;
  
      // Increment max PO ID and format it as a 9-digit number with the "PO-" prefix
      const nextPoId = `PO-${(maxPoId + 1).toString().padStart(9, "0")}`;
  
      // Prepare the PO data with the calculated next PO ID
      const newPoData = { ...poData, poId: nextPoId };
  
      // Save the new purchase order to Firestore
      await addDoc(poRef, newPoData);
  
      // Update local state with the new purchase order
      setPurchaseOrders([...purchaseOrders, newPoData]);
  
      // Reset form and close modal
      setPoData({
        poId: "", // Clear for the next use (will be recalculated)
        companyName: "",
        supplierAddress: "",
        state: "",
        items: [{ brandName: "", brandProduct: "", quantity: "", costPrice: "" }],
      });
      setShowPOModal(false);
  
      // Generate the PDF (if required)
      generatePDF(newPoData);
    } catch (error) {
      console.error("Error adding purchase order: ", error);
      alert("An error occurred while generating the PO. Please try again.");
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
      
      // Query the Firestore collection to find the document with the matching poId
      const querySnapshot = await getDocs(poRef);
      const docToDelete = querySnapshot.docs.find((doc) => doc.data().poId === poId);
  
      if (docToDelete) {
        // Delete the document using its Firestore document reference
        await deleteDoc(doc(db, `users/${user.uid}/purchaseOrders`, docToDelete.id));
        
        // Update the state to reflect the change in UI
        setPurchaseOrders((prev) => prev.filter((po) => po.poId !== poId));
  
        alert('Purchase order deleted successfully!');
      } else {
        console.warn('No matching purchase order found.');
        alert('No matching purchase order found.');
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('An error occurred while deleting the purchase order. Please try again.');
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
        // Update existing product
        const existingProduct = products.find((product) => product.id === editProductId);
        const newQuantity = parseInt(existingProduct.quantity) + parseInt(productData.quantity);
  
        const productRef = doc(db, `users/${user.uid}/products`, editProductId);
        await updateDoc(productRef, {
          ...productData,
          quantity: newQuantity,
        });
  
        // Update local state
        setProducts(products.map((product) =>
          product.id === editProductId ? { ...productData, quantity: newQuantity, id: editProductId } : product
        ));
        setFilteredInv(filteredInv.map((product) =>
          product.id === editProductId ? { ...productData, quantity: newQuantity, id: editProductId } : product
        ));
  
        setEditProductId(null);
      } else {
        // Add new product
        const docRef = await addDoc(collection(db, `users/${user.uid}/products`), productData);
        const newProduct = { ...productData, id: docRef.id };
  
        // Update local state
        setProducts([...products, newProduct]);
        setFilteredInv([...filteredInv, newProduct]);
      }
  
      // Reset form and close modal
      setProductData({
        skuId: '',
        name: '',
        companyName: '',
        price: '',
        quantity: '',
        description: '',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding or updating product: ', error);
    }
  };  
  
  const handleEdit = async (product) => {
    setSelectedAction("edit"); 
    setSelectedProduct(product);
    setShowPasswordModal(true); 
  };       
  
  const handlePasswordSubmit = async () => {
    try {
      if (!user) {
        alert("User not logged in.");
        return;
      }
  
      // Create a credential object using the user's email and entered password
      const credential = EmailAuthProvider.credential(user.email, password);
  
      // Reauthenticate the user
      await reauthenticateWithCredential(user, credential);
      alert("Correct Password! Can edit the product details now.");
  
      setShowPasswordModal(false); // Close the password modal
      setPassword(""); // Clear the password input
  
      // Perform the action after successful reauthentication
      if (selectedAction === "edit") {
        openEditModal(selectedProduct); // Call the delete product function
      } 
    } catch (error) {
      console.error("Incorrect Password:", error);
      alert("Please check your password and try again.");
      setPassword(""); // Clear the input
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
            className="border px-2 py-1 w-100% rounded"
            onChange={(e) => handleSearch(e.target.value)}
          />
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
                <td className="border border-gray-300 p-2">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-4"
                    >
                      Edit
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
            className="border px-2 py-1 w-100% rounded"
            value={poSearchQuery}
            onChange={(e) => setPoSearchQuery(e.target.value)}
          />
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

      {showPasswordModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-xl font-semibold mb-4">Enter Password</h2>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border w-full p-2 mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
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