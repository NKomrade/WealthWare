import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../firebase'; // Import Firebase instance

function Profile({ ownerName }) {
  const [isEditable, setIsEditable] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: ownerName || "Owner Name",  // Fetch owner name from the header
    email: '',
    shopName: "",
    profileImage: "", // Placeholder for profile image URL
    gender: "",
    state: ""
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDoc);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData({
              fullName: data.name || ownerName || "Owner Name",  // Owner name fallback
              email: data.email || "person@gmail.com",  // Email from Firestore
              shopName: data.shopname || "Shop Name",
              profileImage: data.shoplogo || "https://via.placeholder.com/100", 
              gender: "",
              state: ""
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchProfileData();
  }, [ownerName]);

  const handleEditClick = () => {
    setIsEditable(!isEditable);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-8">
        {/* Header Section */}
        <div className="relative w-full h-40 bg-gradient-to-r from-blue-200 to-yellow-200 rounded-t-lg flex items-center p-4">
          <div className="flex items-center">
            <img 
              src={profileData.profileImage}  // Use profile image from Firestore or placeholder
              alt="Profile"
              className="rounded-full border-4 border-white shadow-md w-24 h-24 object-cover"
            />
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">{profileData.fullName}</h2>
              <p className="text-gray-600">{profileData.email}</p>  {/* Email fetched from Firestore */}
              <button className="bg-blue-500 text-white mt-2 py-1 px-3 rounded-lg text-sm">Upload</button>
              <button className="bg-red-500 text-white mt-2 ml-2 py-1 px-3 rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="mt-20 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="text-sm font-medium text-gray-600">Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
          <div>
            <label htmlFor="shopName" className="text-sm font-medium text-gray-600">Shop Name</label>
            <input 
              type="text" 
              name="shopName"
              value={profileData.shopName}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
          <div>
            <label htmlFor="gender" className="text-sm font-medium text-gray-600">Gender</label>
            <select 
              name="gender"
              value={profileData.gender}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            >
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label htmlFor="state" className="text-sm font-medium text-gray-600">State</label>
            <select 
              name="state"
              value={profileData.state}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            >
              <option value="">Select State</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
              <option value="Assam">Assam</option>
              {/* Add all other states here */}
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>
        </div>

        {/* Edit Button */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleEditClick}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            {isEditable ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;