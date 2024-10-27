import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { FiSearch, FiChevronDown } from 'react-icons/fi';
import { IoMdPerson } from 'react-icons/io';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useProfile } from '../../context/contextProfile';

export default function Header() {
  const navigate = useNavigate();
  const { profileData } = useProfile();

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
                {profileData.profileImage ? (
                  <img
                    src={profileData.profileImage}
                    alt="Profile"
                    className="rounded-full w-full h-full object-cover"
                  />
                ) : (
                  <IoMdPerson className="text-gray-500 text-2xl" />
                )}
              </div>
              <div className="ml-2 text-left">
                <div className="text-sm flex items-center gap-1">
                  {profileData.ownerName}
                  <FiChevronDown />
                </div>
                <div className="text-xs text-gray-500">Admin</div>
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