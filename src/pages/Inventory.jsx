import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';

const Inventory = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({
    id: '',
    name: '',
    price: '',
    quantity: '',
    description: '',
  });

  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProducts(currentUser);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const openModal = () => {
    const uniqueId = `PROD-${Math.floor(1000 + Math.random() * 9000)}`;
    setProductData({ ...productData, id: uniqueId });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      console.error('No user logged in.');
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/products`), {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        quantity: productData.quantity,
      });

      setProducts([...products, productData]);
      setProductData({
        id: '',
        name: '',
        price: '',
        quantity: '',
        description: '',
      });
      setShowModal(false);
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleGeneratePO = (e) => {
    e.preventDefault();

    if (!products.length) {
      alert("No products available to generate a PO.");
      return;
    }

    const purchaseDate = new Date().toLocaleDateString();

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Purchase Order</title>
          <style>
              body { font-family: Arial, sans-serif; }
              .po-container { width: 80%; margin: auto; padding: 20px; border: 1px solid #ddd; }
              .header, .footer { display: flex; justify-content: space-between; align-items: center; }
              .po-details, .purchase-details { margin-top: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { text-align: right; }
          </style>
      </head>
      <body>
        <div class="po-container">
          <div class="header">
            <h1>Purchase Order</h1>
            <p><strong>Purchase Date:</strong> ${purchaseDate}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Price Per Unit</th>
                <th>Total Price</th>
              </tr>
            </thead>
            <tbody>
              ${products
                .map(
                  (product) => `
                <tr>
                  <td>${product.id}</td>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>₹${product.price}</td>
                  <td>₹${(product.price * product.quantity).toFixed(2)}</td>
                </tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="total">
            <p><strong>Total Amount:</strong> ₹${products
              .reduce((acc, product) => acc + product.price * product.quantity, 0)
              .toFixed(2)}</p>
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
    alert("Purchase Order generated successfully!");
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-semibold">Added Inventory</h2>
        <div className="space-x-4">
          <button onClick={openModal} className="bg-blue-500 text-white px-4 py-2 rounded">
            Add Inventory
          </button>
          <button onClick={handleGeneratePO} className="bg-red-500 text-white px-4 py-2 rounded">
            Generate PO
          </button>
        </div>
      </div>

      <div className="flex justify-between items-start mb-6 space-x-4">
        <div className="w-2/3">
          <table className="border-collapse border border-gray-400 w-full mb-6">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">InventoryID</th>
                <th className="border border-gray-400 p-2">Name of Inventory</th>
                <th className="border border-gray-400 p-2">Price Per Unit</th>
                <th className="border border-gray-400 p-2">Quantity</th>
                <th className="border border-gray-400 p-2">Description</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">{product.id}</td>
                    <td className="border border-gray-400 p-2">{product.name}</td>
                    <td className="border border-gray-400 p-2 text-green-500">₹ {product.price}</td>
                    <td className="border border-gray-400 p-2">{product.quantity}</td>
                    <td className="border border-gray-400 p-2">{product.description}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-400 p-2 text-center">
                    No products added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="w-1/3 bg-blue-100 p-4 rounded shadow-md h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold">Inventory Information</h3>
          <div className="mt-4">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div key={index} className="bg-white p-4 rounded-lg mb-4">
                  <p>
                    <strong>{product.name}</strong>
                    <span className="text-sm text-gray-500 ml-2">Product ID: {product.id}</span>
                  </p>
                  <p>Price: ₹{product.price}</p>
                  <p>Quantity: {product.quantity}</p>
                  <div className="flex justify-between mt-2">
                    <button className="text-red-500">DELETE</button>
                    <button className="text-blue-500">EDIT</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No products available</p>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Order Modal */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Purchase Order Modal</h3>
        <form>
          <div className="flex justify-between">
            <input
              className="border p-2 w-1/2 mr-4"
              type="text"
              placeholder="Supplier Name"
            />
            <input
              className="border p-2 w-1/2"
              type="text"
              placeholder="Delivery Address"
            />
          </div>
          <table className="mt-6 w-full border-collapse border border-gray-400">
            <thead>
              <tr>
                <th className="border border-gray-400 p-2">Product ID</th>
                <th className="border border-gray-400 p-2">Name</th>
                <th className="border border-gray-400 p-2">Quantity</th>
                <th className="border border-gray-400 p-2">Price (in Rs.)</th>
                <th className="border border-gray-400 p-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2">{product.id}</td>
                    <td className="border border-gray-400 p-2">{product.name}</td>
                    <td className="border border-gray-400 p-2">{product.quantity}</td>
                    <td className="border border-gray-400 p-2 text-green-500">₹ {product.price}</td>
                    <td className="border border-gray-400 p-2">₹ {product.quantity * product.price}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="border border-gray-400 p-2 text-center">
                    No products added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </div>

      {/* Modal Window for Adding Products */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h2 className="text-2xl mb-4">Add Product</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block mb-1">Product ID</label>
                <input
                  type="text"
                  name="id"
                  value={productData.id}
                  readOnly
                  className="border p-2 w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={productData.name}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Price (in Rs.)</label>
                <input
                  type="number"
                  name="price"
                  value={productData.price}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={productData.quantity}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Description</label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                ></textarea>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-red-500 text-white p-2 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                  Save
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