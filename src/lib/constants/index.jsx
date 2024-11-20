import {
	HiOutlineDocumentText,
	HiOutlineQuestionMarkCircle,
	HiOutlineCog
} from 'react-icons/hi'
import { BsHandbagFill } from "react-icons/bs";
import { VscGraphLine } from "react-icons/vsc";
import { RiDashboardFill } from "react-icons/ri";
import { FaShoppingCart } from "react-icons/fa";
export const DASHBOARD_SIDEBAR_LINKS = [
	{
		key: 'dashboard',
		label: 'Dashboard',
		path: '/dashboard',
		icon: <RiDashboardFill />
	},
	{
		key: 'expensetracking',
		label: 'Expenses',
		path: 'expensetracking',
		icon: <FaShoppingCart />
	},
	{
		key: 'inventory',
		label: 'Inventory',
		path: 'inventory',
		icon: <BsHandbagFill />
	},
	{
		key: 'salesreport',
		label: 'Sales Report',
		path: 'salesreport',
		icon: <VscGraphLine />
	},
	{
		key: 'invoices',
		label: 'Invoices',
		path: 'invoices',
		icon: <HiOutlineDocumentText />
	},
	
]

export const DASHBOARD_SIDEBAR_BOTTOM_LINKS = [
	{
		key: 'settings',
		label: 'Settings',
		path: 'settings',
		icon: <HiOutlineCog />
	},
	{
		key: 'support',
		label: 'How to use?',
		path: 'support',
		icon: <HiOutlineQuestionMarkCircle />
	}
]
