import React from 'react';
import classNames from 'classnames';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineLogout } from 'react-icons/hi';
import { DASHBOARD_SIDEBAR_LINKS, DASHBOARD_SIDEBAR_BOTTOM_LINKS } from '../../lib/constants';
import { auth } from '../../firebase'; 
import { signOut } from 'firebase/auth';

const linkClass =
	'flex items-center gap-2 font-light px-1 py-2 hover:bg-neutral-100 hover:no-underline rounded-lg text-base transition duration-300';

export default function Sidebar() {
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await signOut(auth); 
			navigate('/login'); 
		} catch (error) {
			alert("Error logging out: " + error.message);
		}
	};

	return (
		<div className="bg-white w-75 p-5 flex flex-col h-screen justify-between shadow-lg">
			{/* Logo */}
			<div className="flex items-center px-4 py-3">
				<img src="/Logo.png" alt="WealthWare Logo" className="w-8 h-8" />
				<span className="text-neutral-800 text-2xl font-bold">ealthWare</span>
			</div>

			{/* Sidebar Links */}
			<div className="py-5 flex-1 flex flex-col gap-2">
				{DASHBOARD_SIDEBAR_LINKS.map((link) => (
					<SidebarLink key={link.key} link={link} />
				))}
			</div>

			{/* Bottom Links */}
			<div className="flex flex-col gap-2 pt-3 border-t border-neutral-200">
				{DASHBOARD_SIDEBAR_BOTTOM_LINKS.map((link) => (
					<SidebarLink key={link.key} link={link} />
				))}
				<div className={classNames(linkClass, 'cursor-pointer text-red-500')} onClick={handleLogout}>
					<span className="text-xl">
						<HiOutlineLogout />
					</span>
					Logout
				</div>
			</div>
		</div>
	);
}

function SidebarLink({ link }) {
	const { pathname } = useLocation();

	return (
		<Link
			to={link.path}
			className={classNames(
				pathname === link.path ? 'bg-blue-500 text-white' : 'text-neutral-700 hover:bg-neutral-200',
				'flex items-center gap-2 font-medium px-4 py-2 rounded-lg transition-all duration-300 ease-in-out'
			)}>
			<span className="text-xl">{link.icon}</span>
			{link.label}
		</Link>
	);
}