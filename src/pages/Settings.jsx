import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useProfile } from '../context/contextProfile';

const Settings = () => {
  const { profileData, setProfileData } = useProfile();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditable, setIsEditable] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [errors, setErrors] = useState({}); // For validation errors
  const [isOtherShop, setIsOtherShop] = useState(false); // Track if "Other" is selected

  const [details, setDetails] = useState({
    fullName: '',
    email: '',
    gender: '',
    phone: '',
    state: '',
    shopName: '',
    shopType: '',
    otherShopType: '', // To handle custom "Other" type input
    address: '',
    gstNumber: '',
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
            setDetails({
              fullName: data.name || '',
              email: data.email || '',
              gender: data.gender || '',
              phone: data.phone || '',
              state: data.state || '',
              shopName: data.shopname || '',
              shopType: data.typeofshop || '',
              otherShopType: '',
              address: data.address || '',
              gstNumber: data.gstNumber || '',
            });

            setProfileData((prev) => ({
              ...prev,
              ownerName: data.name || '',
              profileImage: data.shoplogo || prev.profileImage,
            }));
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    fetchProfileData();
  }, [setProfileData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: '' }));

    if (name === 'shopType') {
      setIsOtherShop(value === 'others');
      if (value !== 'others') {
        setDetails((prev) => ({ ...prev, otherShopType: '' })); // Clear "Other" input
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!/^[a-zA-Z\s]+$/.test(details.fullName)) {
      newErrors.fullName = 'Name can only contain letters and spaces.';
    }
    if (!/^\d{10}$/.test(details.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits.';
    }
    if (isOtherShop && !details.otherShopType.trim()) {
      newErrors.otherShopType = 'Please specify the type of shop.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          name: details.fullName,
          gender: details.gender,
          phone: details.phone,
          state: details.state,
          shopname: details.shopName,
          typeofshop: isOtherShop ? details.otherShopType : details.shopType,
          address: details.address,
          gstNumber: details.gstNumber,
        });

        setProfileData((prev) => ({
          ...prev,
          ownerName: details.fullName,
        }));
        setPopupMessage('Profile updated successfully.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setPopupMessage('Failed to update profile.');
    }
    setIsEditable(false);
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, details.email);
      setPopupMessage('Reset password link has been sent to your registered email.');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      setPopupMessage('Failed to send password reset link. Try again later.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <div className="ml-4">
          <h2 className="text-2xl font-bold">{details.fullName || 'Owner Name'}</h2>
          <p className="text-gray-500">{details.email || 'No Email ID found'}</p>
        </div>
      </div>

      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 ${activeTab === 'personal' ? 'border-b-2 border-black font-bold' : ''}`}
          onClick={() => setActiveTab('personal')}
        >
          Personal Details
        </button>
        <button
          className={`py-2 px-4 ${activeTab === 'shop' ? 'border-b-2 border-black font-bold' : ''}`}
          onClick={() => setActiveTab('shop')}
        >
          Shop Details
        </button>
      </div>

      <form className="space-y-4">
        {activeTab === 'personal' && (
          <>
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                name="fullName"
                type="text"
                value={details.fullName}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border-2 bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              />
            </div>
            <div>
              <label className="block mb-1">Gender</label>
              <select
                name="gender"
                value={details.gender}
                onChange={handleChange}
                disabled={!isEditable}
                className="border p-2 rounded text-black w-full"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Phone Number</label>
              <input
                name="phone"
                type="tel"
                value={details.phone}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              />
            </div>
            <div>
              <label htmlFor="state" className="text-sm font-medium text-gray-600">State</label>
              <select
                name="state"
                value={details.state}
                onChange={handleChange}
                disabled={!isEditable}
                className={`mt-2 p-3 bg-white border rounded-lg w-full focus:outline-none ${isEditable ? 'border-neutral-900' : 'bg-gray-100 border-gray-300'}`}
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
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Puducherry">Puducherry</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={handlePasswordReset}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Change Password
              </button>
            </div>
          </>
        )}

        {activeTab === 'shop' && (
          <>
            <div>
              <label className="block mb-1">Shop Name</label>
              <input
                name="shopName"
                type="text"
                value={details.shopName}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              />
            </div>
            <div>
              <label className="block mb-1">Type of Shop</label>
              <select
                name="shopType"
                type={details.shopType}
                value={details.shopType}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              >
                <option value="">--Select type of shop--</option>
                <option value="Franchise">Franchise</option>
                <option value="Tea Stall">Tea Stall</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Florist">Florist</option>
                <option value="Auto Parts">Auto Parts</option>
                <option value="Bakery">Bakery</option>
                <option value="Cafe">Cafe</option>
                <option value="Auto Repair">Auto Repair</option>
                <option value="Paan Shop">Paan Shop</option>
                <option value="Vegetable Shop">Vegetable Shop</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Cycle Repair Shop">Cycle Repair Shop</option>
                <option value="Sweet Shop">Sweet Shop</option>
                <option value="Pet Shop">Pet Shop</option>
                <option value="Furniture Store">Furniture Store</option>
                <option value="Dry Cleaner">Dry Cleaner</option>
                <option value="Gym">Gym</option>
                <option value="Stationery Shop">Stationery Shop</option>
                <option value="Convenience Shop">Convenience Shop</option>
                <option value="Mobile Repair Shop">Mobile Repair Shop</option>
                <option value="Electronics Shop">Electronics Shop</option>
                <option value="Salon">Salon</option>
                <option value="Tailor">Tailor</option>
                <option value="Electronics Repair Shop">Electronics Repair Shop</option>
                <option value="Spare Parts Dealer">Spare Parts Dealer</option>
                <option value="Photo Studio">Photo Studio</option>
                <option value="Toy Shop">Toy Shop</option>
                <option value="Bicycle Shop">Bicycle Shop</option>
                <option value="Textile Shop">Textile Shop</option>
                <option value="others">Others</option>
              </select>
              {isOtherShop && (
                <div className="mt-2">
                  <label className="block mb-1">Specify Shop Type</label>
                  <input
                    name="otherShopType"
                    type="text"
                    value={details.otherShopType}
                    onChange={handleChange}
                    disabled={!isEditable}
                    className={`border p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
                  />
                  {errors.otherShopType && <p className="text-red-500 text-sm">{errors.otherShopType}</p>}
                </div>
              )}
            </div>
            <div>
              <label className="block mb-1">Shop Address</label>
              <input
                name="address"
                type="text"
                value={details.address}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              />
            </div>
            <div>
              <label className="block mb-1">GST Number</label>
              <input
                name="gstNumber"
                type="text"
                value={details.gstNumber}
                onChange={handleChange}
                disabled={!isEditable}
                className={`border bg-white p-2 rounded w-full ${isEditable ? 'border-neutral-900' : 'bg-gray-100'}`}
              />
            </div>
          </>
        )}

        <div className="flex justify-end">
          {!isEditable ? (
            <button
              type="button"
              onClick={() => setIsEditable(true)}
              className="bg-blue-500 text-white py-2 px-4 rounded"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              Save
            </button>
          )}
        </div>
      </form>

      {popupMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white py-2 px-4 rounded">
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default Settings;