import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { FaUserCircle } from 'react-icons/fa';
import { useProfile } from '../context/contextProfile'; // Profile context

function Profile({ ownerName }) {
  const { profileData: contextData, setProfileData } = useProfile(); // Use context state
  const [uploading, setUploading] = useState(false);

  const [profileData, setLocalProfileData] = useState({
    fullName: contextData.ownerName || ownerName || 'Owner Name',
    email: '',
    shopName: '',
    profileImage: contextData.profileImage || '',
    gender: '',
    state: '',
    phone: '',
    typeofshop: '',
    address: '',
    gstNumber: '',
  });

  // Fetch profile data from Firestore on mount
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
              address: data.address || '',
              gstNumber: data.gstNumber || '',
            };

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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 overflow-hidden">
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
          {Object.entries(profileData).map(([key, value]) =>
            key !== 'profileImage' && key !== 'password' ? (
              <div key={key}>
                <label className="text-sm font-medium text-gray-600">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                </label>
                <input
                  type="text"
                  value={value}
                  disabled
                  className="mt-2 p-3 border rounded-lg w-full bg-gray-100"
                />
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;