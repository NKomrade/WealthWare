import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { IoMdPerson } from 'react-icons/io';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase'; 
import { doc, getDoc } from 'firebase/firestore';
import { useProfile } from '../../context/contextProfile'; // Import Profile context

export default function Header() {
  const navigate = useNavigate();
  const { profileData, setProfileData } = useProfile(); // Destructure context state
  const [loading, setLoading] = useState(true); // Track loading state for profile data

  // Fetch user data on mount or if profileData updates
  useEffect(() => {
    const fetchProfileData = async () => {
      const user = auth.currentUser;

      if (user) {
        try {
          const userDoc = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDoc);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            setProfileData({
              ownerName: userData.name || 'Owner Name',
              profileImage: userData.shoplogo || '',
            });
          } else {
            console.warn('No such user document!');
          }
        } catch (error) {
          console.error('Error fetching profile data:', error);
        }
      }
      setLoading(false); // Ensure loading is set to false after fetching
    };

    fetchProfileData();
  }, [setProfileData]); // Run when setProfileData is updated

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error: ', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Optional: You can replace this with a spinner or placeholder
  }

  return (
    <div className="bg-white h-16 px-6 flex items-center border-b border-gray-200 justify-between">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative flex items-center">
          <FiSearch className="text-gray-400 absolute left-3 h-5 w-5" />
          <input
            type="text"
            placeholder="Search here..."
            className="text-sm focus:outline-none active:outline-none h-10 pl-11 pr-4 rounded-full bg-gray-50 w-[280px]"
          />
        </div>
      </div>

      {/* Profile Menu */}
      <div className="flex items-center gap-2">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-2 focus:outline-none">
            <div className="flex items-center">
              {/* Profile Image or Icon */}
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                    onError={(e) => (e.target.src = IoMdPerson)} // Fallback to icon on error
                  />
                ) : (
                  <IoMdPerson className="text-gray-500 text-2xl" />
                )}
              </div>

              {/* Owner Name and Role */}
              <div className="ml-2 text-left">
                <div className="text-sm flex items-center gap-1">
                  {profileData.ownerName || 'Owner Name'}
                  <FiChevronDown />
                </div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            </div>
          </Menu.Button>

          {/* Dropdown Menu */}
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">
                {/* Profile Page Link */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={() => navigate('/profile')}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                      )}
                    >
                      Your Profile
                    </div>
                  )}
                </Menu.Item>

                {/* Settings Page Link */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={() => navigate('/settings')}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                      )}
                    >
                      Settings
                    </div>
                  )}
                </Menu.Item>

                {/* Sign Out */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={handleSignOut}
                      className={classNames(
                        active ? 'bg-gray-100' : '',
                        'block px-4 py-2 text-sm text-gray-700 cursor-pointer'
                      )}
                    >
                      Sign out
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
}