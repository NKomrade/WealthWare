import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from "firebase/firestore"; // Import Firestore functions
import { getAuth } from "firebase/auth"; // Import Firebase Auth
import { db } from '../firebase'; // Your Firestore instance

const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState({
		id: '',
		name: '',
		price: '',
		quantity: '',
		description: '',
		purchaseDate: '',
		expiryDate: '', 
	});
	

  // Get the current user from Firebase Auth
  const auth = getAuth();
  const user = auth.currentUser;

  // Function to handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  // Function to open modal and generate unique product ID
  const openModal = () => {
    const uniqueId = `PROD-${Math.floor(1000 + Math.random() * 9000)}`; 
    setProductData({ ...productData, id: uniqueId });
    setShowModal(true);
  };

  // Function to close modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Fetch Products from Firestore when the component loads
  useEffect(() => {
    const fetchProducts = async () => {
      if (user) {
        try {
          // Reference to the user's product subcollection
          const productsRef = collection(db, `users/${user.uid}/products`);
          const querySnapshot = await getDocs(productsRef);
          
          // Extract data from each document in the products subcollection
          const userProducts = querySnapshot.docs.map(doc => doc.data());
          setProducts(userProducts); // Set the products state with the fetched data
        } catch (error) {
          console.error("Error fetching products: ", error);
        }
      }
    };

    fetchProducts();
  }, [user]); // Trigger only when the user is available

  // Function to handle form submission and save to Firestore under user's collection
  const handleSubmit = async (e) => {
		e.preventDefault();
	
		if (!user) {
			console.error("No user logged in.");
			return;
		}
	
		try {
			// Save to the current user's products subcollection
			await addDoc(collection(db, `users/${user.uid}/products`), {
				id: productData.id,
				name: productData.name,
				price: productData.price,
				description: productData.description,
				purchaseDate: productData.purchaseDate,
				expiryDate: productData.expiryDate,
				quantity: productData.quantity,  // Save quantity to Firestore
			});
	
			// Add product to local state
			setProducts([...products, productData]);
	
			// Reset form and close modal
			setProductData({ id: '', name: '', price: '', quantity: '' , description: '', purchaseDate: '', expiryDate: ''});
			setShowModal(false);
		} catch (error) {
			console.error("Error adding document: ", error);
		}
	};

  return (
    <div>
      {/* Add Product Button */}
      <button onClick={openModal} className="bg-blue-500 text-white p-2 rounded">Add Products</button>

      {/* Product Table */}
      <table className="mt-4 border-collapse border border-gray-400 w-full">
        <thead>
          <tr>
            <th className="border border-gray-400 p-2">Product ID</th>
            <th className="border border-gray-400 p-2">Name</th>
            <th className="border border-gray-400 p-2 text-green-500">Price (in Rs.)</th>
            <th className="border border-gray-400 p-2">Quantity</th>
						<th className="border border-gray-400 p-2">Description</th>
            <th className="border border-gray-400 p-2">Date of Purchase</th>
            <th className="border border-gray-400 p-2 text-red-500">Expiry Date</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product, index) => (
              <tr key={index}>
                <td className="border border-gray-400 p-2">{product.id}</td>
                <td className="border border-gray-400 p-2">{product.name}</td>
                <td className="border border-gray-400 p-2 text-green-500">{product.price}</td>
                <td className="border border-gray-400 p-2">{product.quantity}</td>
								<td className="border border-gray-400 p-2">{product.description}</td>
                <td className="border border-gray-400 p-2">{product.purchaseDate}</td>
                <td className="border border-gray-400 p-2 text-red-500">{product.expiryDate}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="border border-gray-400 p-2 text-center">
                No products added yet
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
              <div className="mb-4">
                <label className="block mb-1">Date of Purchase</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={productData.purchaseDate}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={productData.expiryDate}
                  onChange={handleChange}
                  className="border p-2 w-full"
                  required
                />
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

export default Products;
