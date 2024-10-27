import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ProfileContext = createContext(); // Create the context

// Custom hook to use the profile context
export const useProfile = () => useContext(ProfileContext);

// ProfileProvider component to wrap around the app
export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
    ownerName: 'Owner Name',
    profileImage: '',
  });

  const [loading, setLoading] = useState(true); // Track loading state

  // Function to fetch profile data from Firestore
  const fetchProfileData = async (user) => {
    if (user) {
      const userDoc = doc(db, 'users', user.uid);
      try {
        const userSnap = await getDoc(userDoc);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setProfileData({
            ownerName: userData.name || 'Owner Name',
            profileImage: userData.shoplogo || '',
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    }
  };

  // Listen for changes in auth state and fetch profile data if authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchProfileData(user); // Fetch profile data when the user is logged in
      } else {
        setProfileData({ ownerName: 'Owner Name', profileImage: '' }); // Reset data if user logs out
      }
      setLoading(false); // Stop loading once auth state is resolved
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Optional: Add a spinner or placeholder while loading
  }

  // Provide the profile data and update function to the rest of the app
  return (
    <ProfileContext.Provider value={{ profileData, setProfileData }}>
      {children}
    </ProfileContext.Provider>
  );
};