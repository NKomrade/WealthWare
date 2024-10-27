import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FaUserCircle } from 'react-icons/fa';
import { useProfile } from '../context/contextProfile'; // Profile context

function Profile({ ownerName }) {
  const { profileData: contextData, setProfileData } = useProfile(); // Use context state
  const [isEditable, setIsEditable] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Local state for profile data, initialized with context values
  const [profileData, setLocalProfileData] = useState({
    fullName: contextData.ownerName || ownerName || 'Owner Name',
    email: '',
    shopName: '',
    profileImage: contextData.profileImage || '',
    gender: '',
    state: '',
    phone: '',
    typeofshop: '',
  });

  // Fetch profile data from Firestore on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDoc);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const updatedProfile = {
              fullName: data.name || ownerName || 'Owner Name',
              email: data.email || 'person@gmail.com',
              shopName: data.shopname || 'Shop Name',
              profileImage: data.shoplogo || '',
              gender: data.gender || '',
              state: data.state || '',
              phone: data.phone || '',
              typeofshop: data.typeofshop || '',
            };

            // Update both local state and context
            setLocalProfileData(updatedProfile);
            setProfileData({
              ownerName: updatedProfile.fullName,
              profileImage: updatedProfile.profileImage,
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchProfileData();
  }, [ownerName, setProfileData]);

  // Handle input changes for form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalProfileData({ ...profileData, [name]: value });
  };

  // Handle Save Profile
  const handleSaveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          name: profileData.fullName,
          shopname: profileData.shopName,
          gender: profileData.gender,
          state: profileData.state,
          phone: profileData.phone,
          typeofshop: profileData.typeofshop,
          shoplogo: profileData.profileImage,
        });

        // Sync context with updated data
        setProfileData({
          ownerName: profileData.fullName,
          profileImage: profileData.profileImage,
        });

        console.log('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsEditable(!isEditable);
  };

  // Handle Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = auth.currentUser;
    const newImageRef = ref(storage, `users/${user.uid}/profile.jpg`);
    setUploading(true);

    try {
      await uploadBytes(newImageRef, file);
      const downloadURL = await getDownloadURL(newImageRef);

      await updateDoc(doc(db, 'users', user.uid), { shoplogo: downloadURL });
      setLocalProfileData((prev) => ({ ...prev, profileImage: downloadURL }));

      // Update context with the new image
      setProfileData((prev) => ({ ...prev, profileImage: downloadURL }));

      console.log('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Handle Image Deletion
  const handleImageDelete = async () => {
    const user = auth.currentUser;
    const imageRef = ref(storage, `users/${user.uid}/profile.jpg`);

    try {
      await deleteObject(imageRef);
      await updateDoc(doc(db, 'users', user.uid), { shoplogo: '' });

      setLocalProfileData((prev) => ({ ...prev, profileImage: '' }));
      setProfileData((prev) => ({ ...prev, profileImage: '' }));

      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-lg p-8">
        {/* Profile Header */}
        <div className="relative w-full h-40 bg-gradient-to-r from-blue-400 to-yellow-200 rounded-t-lg flex items-center p-4">
          <div className="flex items-center">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="rounded-full border-4 border-white shadow-md w-24 h-24 object-cover"
              />
            ) : (
              <FaUserCircle className="text-gray-400 text-6xl" />
            )}
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {profileData.fullName}
              </h2>
              <p className="text-gray-600">{profileData.email}</p>
              <label className="mt-2 cursor-pointer bg-blue-500 text-white py-1 px-3 rounded-lg text-sm hover:bg-blue-600">
                {uploading ? 'Uploading...' : 'Change Photo'}
                <input type="file" onChange={handleImageUpload} className="hidden" />
              </label>
              <button
                onClick={handleImageDelete}
                className="bg-red-500 text-white mt-2 ml-2 py-1 px-3 rounded-lg text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="mt-20 grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full ${
                isEditable ? 'border-blue-500' : 'bg-gray-100'
              }`}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Shop Name</label>
            <input
              type="text"
              name="shopName"
              value={profileData.shopName}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full ${
                isEditable ? 'border-blue-500' : 'bg-gray-100'
              }`}
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
              <option value="Bihar">Bihar</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Goa">Goa</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Haryana">Haryana</option>
              <option value="Himachal Pradesh">Himachal Pradesh</option>
              <option value="Jharkhand">Jharkhand</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Manipur">Manipur</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Telangana">Telangana</option>
              <option value="Tripura">Tripura</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Uttarakhand">Uttarakhand</option>
              <option value="West Bengal">West Bengal</option>
            </select>
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-gray-600">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
          <div>
            <label htmlFor="typeofshop" className="text-sm font-medium text-gray-600">Type of Shop</label>
            <input 
              type="text" 
              name="typeofshop"
              value={profileData.typeofshop}
              onChange={handleChange}
              disabled={!isEditable}
              className={`mt-2 p-3 border rounded-lg w-full focus:outline-none ${isEditable ? 'border-blue-500' : 'bg-gray-100 border-gray-300'}`}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveProfile}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600"
          >
            {isEditable ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
