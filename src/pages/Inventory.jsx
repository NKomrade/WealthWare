import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';

const Inventory = () => {
  const [showModal, setShowModal] = useState(false); 
  const [showPOModal, setShowPOModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState(''); // Search query for inventory
  const [poSearchQuery, setPoSearchQuery] = useState('');

  const [productData, setProductData] = useState({
    skuId: '',
    name: '',
    companyName: '',
    price: '',
    quantity: '',
    description: '',
    purchaseDate: '',
  });

  const [poData, setPoData] = useState({
    poId: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
    companyName: '',
    supplierAddress: '',
    state: '',
    items: [{ brandName: '', brandProduct: '', quantity: '', costPrice: '' }],
  });

  const auth = getAuth();
  const [user, setUser] = useState(null);

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

  // Filter Inventory based on SKU ID, Company Name, or Product Name
  const filteredProducts = products.filter((product) =>
    product.skuId.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.companyName.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // Filter Purchase Orders based on PO ID, Company Name, or Supplier Address
  const filteredPurchaseOrders = purchaseOrders.filter((po) =>
    po.poId.toLowerCase().includes(poSearchQuery.toLowerCase()) ||
    po.companyName.toLowerCase().includes(poSearchQuery.toLowerCase()) ||
    po.supplierAddress.toLowerCase().includes(poSearchQuery.toLowerCase())
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

  const openModal = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    setProductData({
      ...productData,
      purchaseDate: todayDate,
    });
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
          <style>
              /* General Styles */
              body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
              .po-container { padding: 20px; }
              .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; margin-top: 10px; }
              
              /* Print Styles */
              @media print {
                  @page { size: A4 portrait; margin: 20mm; } /* Ensuring portrait mode */
                  body { margin: 0; }
                  .print-button { display: none; } /* Hide print button on print */
              }
          </style>
      </head>
      <body>
          <div class="po-container">
              <div class="header">
                  <h1>Purchase Order</h1>
                  <p>PO ID: ${poId}</p>
                  <p>Date: ${new Date().toLocaleDateString()}</p>
              </div>
              <p><strong>Company Name:</strong> ${companyName}</p>
              <p><strong>Supplier Address:</strong> ${supplierAddress}</p>
              <p><strong>State:</strong> ${state}</p>
              <table>
                  <thead>
                      <tr>
                          <th>Brand Name</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Cost Price</th>
                          <th>Total</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${items.map(item => `
                          <tr>
                              <td>${item.brandName}</td>
                              <td>${item.brandProduct}</td>
                              <td>${item.quantity}</td>
                              <td>₹${item.costPrice}</td>
                              <td>₹${(item.quantity * item.costPrice).toFixed(2)}</td>
                          </tr>`).join('')}
                  </tbody>
              </table>
              <div class="total">
                  <p>Subtotal: ₹${subtotal.toFixed(2)}</p>
                  <p>Tax (18%): ₹${tax.toFixed(2)}</p>
                  <p><strong>Total: ₹${total.toFixed(2)}</strong></p>
              </div>
          </div>

          <!-- Print Button -->
          <div class="print-button" style="text-align: center; margin-top: 20px;">
              <button onclick="printPDF()" style="padding: 10px 20px; font-size: 16px;">Print / Save as PDF</button>
          </div>

          <script>
              function printPDF() {
                  window.print(); // Opens the print dialog for print or save as PDF
              }
          </script>
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
      await addDoc(collection(db, `users/${user.uid}/products`), productData);
      setProducts([...products, productData]);
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
      console.error('Error adding product: ', error);
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
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-1 rounded">Search</button>
        </div>
      </div>
      <table className="w-full mt-4 border-collapse border border-gray-400">
        <thead className="bg-black text-white">
          <tr>
            <th className="border border-gray-300 p-2">SKU ID</th>
            <th className="border border-gray-300 p-2">Company Name</th>
            <th className="border border-gray-300 p-2">Product Name</th>
            <th className="border border-gray-300 p-2">Price</th>
            <th className="border border-gray-300 p-2">Quantity</th>
            <th className="border border-gray-300 p-2">Description</th>
            <th className="border border-gray-300 p-2">Purchase Date</th>
          </tr>
        </thead>
        <tbody className="bg-gray-100">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{product.skuId}</td>
                <td className="border border-gray-300 p-2">{product.companyName}</td>
                <td className="border border-gray-300 p-2">{product.name}</td>
                <td className="border border-gray-300 p-2">₹ {product.price}</td>
                <td className="border border-gray-300 p-2">{product.quantity}</td>
                <td className="border border-gray-300 p-2">{product.description}</td>
                <td className="border border-gray-300 p-2">{product.purchaseDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center p-2">
                No products available
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          {filteredPurchaseOrders.length > 0 ? (
            filteredPurchaseOrders.map((po, index) => (
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

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-2xl mb-4">Add Inventory</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">SKU ID</label>
                <input
                  name="skuId"
                  value={productData.skuId}
                  placeholder="Enter SKU ID"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
              <div>
                <label className="block mb-2">Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={productData.purchaseDate}
                  readOnly
                  className="border w-full p-2 bg-gray-100"
                />
              </div>
              <div>
                <label className="block mb-2">Company Name</label>
                <input
                  name="companyName"
                  placeholder="Enter company name"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
              <div>
                <label className="block mb-2">Product Name</label>
                <input
                  name="name"
                  placeholder="Enter product name"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
              <div>
                <label className="block mb-2">Price</label>
                <input
                  name="price"
                  placeholder="Enter price"
                  type="number"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
              <div>
                <label className="block mb-2">Quantity</label>
                <input
                  name="quantity"
                  placeholder="Enter quantity"
                  type="number"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
              <div className="col-span-2">
                <label className="block mb-2">Description</label>
                <textarea
                  name="description"
                  placeholder="Enter product description"
                  onChange={handleChange}
                  required
                  className="border w-full p-2"
                />
              </div>
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
                  Save
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