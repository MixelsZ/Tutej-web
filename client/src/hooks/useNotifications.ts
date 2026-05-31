// client/src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react'
import { getToken } from './useAuth'

export interface Notification {
	id: number
	type: string
	title: string
	body: string
	link: string | null
	read: boolean
	createdAt: string
}

const API = 'http://localhost:5000'
const POLL_INTERVAL = 30_000 // 30 sekund

export function useNotifications() {
	const [notifications, setNotifications] = useState<Notification[]>([])
	const [unreadCount, setUnreadCount] = useState(0)
	const [loading, setLoading] = useState(true)

	const headers = () => ({
		Authorization: `Bearer ${getToken()}`,
		'Content-Type': 'application/json',
	})

	const fetchNotifications = useCallback(async () => {
		const token = getToken()
		if (!token) return
		try {
			const res = await fetch(`${API}/api/notifications`, { headers: headers() })
			if (!res.ok) return
			const data: Notification[] = await res.json()
			setNotifications(Array.isArray(data) ? data : [])
			setUnreadCount(data.filter((n) => !n.read).length)
		} catch {
			// brak połączenia — cicho ignoruj
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchNotifications()
		const interval = setInterval(fetchNotifications, POLL_INTERVAL)
		return () => clearInterval(interval)
	}, [fetchNotifications])

	const markAsRead = async (id: number) => {
		try {
			await fetch(`${API}/api/notifications/${id}/read`, {
				method: 'PUT',
				headers: headers(),
			})
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
			setUnreadCount((prev) => Math.max(0, prev - 1))
		} catch {}
	}

	const markAllAsRead = async () => {
		try {
			await fetch(`${API}/api/notifications/read-all`, {
				method: 'PUT',
				headers: headers(),
			})
			setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
			setUnreadCount(0)
		} catch {}
	}

	return {
		notifications,
		unreadCount,
		loading,
		markAsRead,
		markAllAsRead,
		refetch: fetchNotifications,
	}
}
