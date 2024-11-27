import React from 'react'
import DashboardStatsGrid from '../components/DashboardStatsGrid'
import TransactionChart from '../components/TransactionChart'

export default function Dashboard() {
	return (
		<div className="flex flex-col gap-10">
			<DashboardStatsGrid />
			<div className="flex flex-row gap-4 w-full">
				<TransactionChart />
			</div>
		</div>
	)
}
