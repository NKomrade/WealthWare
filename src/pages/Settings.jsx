import React, { useState } from 'react'

const Settings = () => {
	const [username, setUsername] = useState('')  // State for username
	const [password, setPassword] = useState('')  // State for password
	const [notificationsEnabled, setNotificationsEnabled] = useState(true)  // State for notifications

	// Handler to update username
	const handleUsernameChange = (e) => {
		setUsername(e.target.value)
	}

	// Handler to update password
	const handlePasswordChange = (e) => {
		setPassword(e.target.value)
	}

	// Handler to toggle notifications
	const handleToggleNotifications = () => {
		setNotificationsEnabled(!notificationsEnabled)
	}

	// Handler to save settings (could be expanded to include API calls)
	const handleSaveSettings = (e) => {
		e.preventDefault()
		// Here you would typically save the settings to a database or an API
		alert(`Settings saved!\nUsername: ${username}\nPassword: ${password}\nNotifications: ${notificationsEnabled ? 'Enabled' : 'Disabled'}`)
	}

	return (
		<div className="max-w-md mx-auto p-4">
			<h1 className="text-xl font-bold mb-4">Settings</h1>
			<form onSubmit={handleSaveSettings} className="space-y-4">
				<div>
					<label className="block mb-1" htmlFor="username">Username:</label>
					<input
						id="username"
						type="text"
						value={username}
						onChange={handleUsernameChange}
						className="border border-gray-300 rounded px-2 py-1 w-full"
						placeholder="Enter your username"
						required
					/>
				</div>

				<div>
					<label className="block mb-1" htmlFor="password">Password:</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={handlePasswordChange}
						className="border border-gray-300 rounded px-2 py-1 w-full"
						placeholder="Enter your password"
						required
					/>
				</div>

				<div className="flex items-center">
					<input
						type="checkbox"
						checked={notificationsEnabled}
						onChange={handleToggleNotifications}
						className="mr-2"
					/>
					<label>Enable Notifications</label>
				</div>

				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 rounded"
				>
					Save Settings
				</button>
			</form>
		</div>
	)
}

export default Settings;

