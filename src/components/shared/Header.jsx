import React, { Fragment, useEffect, useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiSearch, FiChevronDown } from 'react-icons/fi'; // Add FiChevronDown for dropdown
import { IoMdPerson } from "react-icons/io"; // Add IoMdPerson for profile placeholder
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase'; 
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

export default function Header() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [ownerName, setOwnerName] = useState(''); // State to store owner's name
    const [profileImage, setProfileImage] = useState(''); // Start with empty string for profile image

    useEffect(() => {
        const fetchUserData = async () => {
            const user = auth.currentUser;
            if (user) {
                // Fetch user data from Firestore
                const userDoc = doc(db, 'users', user.uid);
                try {
                    const userSnap = await getDoc(userDoc);
                    if (userSnap.exists()) {
                        const userData = userSnap.data();
                        setUsername(userData.username || '');
                        setOwnerName(userData.name || 'Owner name'); // Fetch owner's name

                        // Use the 'shoplogo' field from Firestore
                        if (userData.shoplogo) {
                            setProfileImage(userData.shoplogo); // Set the URL from Firestore
                        } else {
                            console.warn('No shop logo found for this user.');
                        }
                    } else {
                        console.error('No such user document!');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                console.warn('No user is currently logged in.');
            }
        };

        fetchUserData();
    }, []); // Empty dependency array means this runs only once on component mount

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error('Sign out error: ', error);
        }
    };

    return (
        <div className="bg-white h-16 px-6 flex items-center border-b border-gray-200 justify-between">
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

            <div className="flex items-center gap-2">
                <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-2 focus:outline-none">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center overflow-hidden">
                                {profileImage ? (
                                    <img
                                        src={profileImage}
                                        alt="Profile"
                                        className="rounded-full w-full h-full object-cover"
                                        onError={() => setProfileImage('')} // Fallback to icon if image fails
                                    />
                                ) : (
                                    <IoMdPerson className="text-gray-500 text-2xl" /> // Display placeholder icon
                                )}
                            </div>
                            <div className="ml-2 text-left"> {/* Align the text to the left */}
                                <div className="text-sm flex items-center gap-1">
                                    {ownerName}
                                    <FiChevronDown /> {/* Dropdown icon to the right of the owner's name */}
                                </div>
                                <div className="text-xs text-gray-500">Admin</div> {/* Left aligned */}
                            </div>
                        </div>
                    </Menu.Button>

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