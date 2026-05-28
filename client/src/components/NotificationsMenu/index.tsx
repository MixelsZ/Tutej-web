// client/src/components/NotificationsMenu/index.tsx
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import styles from './notificationsMenu.module.scss'

interface NotificationsMenuProps {
	isOpen: boolean
	onClose: () => void
}

const TYPE_ICON: Record<string, string> = {
	comment: '💬',
	announcement: '📣',
	event: '📅',
	system: '🔔',
}

export function NotificationsMenu({ isOpen, onClose }: NotificationsMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null)
	const [shouldRender, setShouldRender] = useState(isOpen)
	const { notifications, loading, markAsRead, markAllAsRead } = useNotifications()
	const navigate = useNavigate()

	useEffect(() => {
		if (isOpen) setShouldRender(true)
	}, [isOpen])

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setTimeout(() => onClose(), 0)
			}
		}
		if (isOpen) document.addEventListener('click', handleClickOutside)
		return () => document.removeEventListener('click', handleClickOutside)
	}, [isOpen, onClose])

	const handleAnimationEnd = () => {
		if (!isOpen) setShouldRender(false)
	}

	const handleNotificationClick = async (id: number, link: string | null) => {
		await markAsRead(id)
		onClose()
		if (link) navigate(link)
	}

	const formatTime = (iso: string) => {
		const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
		if (diff < 60) return 'przed chwilą'
		if (diff < 3600) return `${Math.floor(diff / 60)} min temu`
		if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`
		return `${Math.floor(diff / 86400)} dni temu`
	}

	if (!shouldRender) return null

	return (
		<div
			className={`${styles.menu} ${!isOpen ? styles.closing : ''}`}
			ref={menuRef}
			onAnimationEnd={handleAnimationEnd}
		>
			<div className={styles.header}>
				<span>Powiadomienia</span>
				{notifications.some((n) => !n.read) && (
					<button className={styles.markAll} onClick={markAllAsRead}>
						Oznacz wszystkie
					</button>
				)}
			</div>

			{loading ? (
				<div className={styles.loadingList}>
					{[...Array(3)].map((_, i) => (
						<div key={i} className={styles.skeletonItem} />
					))}
				</div>
			) : notifications.length === 0 ? (
				<div className={styles.empty}>
					<span>🔔</span>
					<p>Brak powiadomień</p>
				</div>
			) : (
				<ul className={styles.list}>
					{notifications.map((n) => (
						<li
							key={n.id}
							className={`${styles.item} ${!n.read ? styles.unread : ''}`}
							onClick={() => handleNotificationClick(n.id, n.link)}
						>
							<div className={styles.iconWrapper}>
								{TYPE_ICON[n.type] || '🔔'}
							</div>
							<div className={styles.body}>
								<p className={styles.title}>{n.title}</p>
								<p className={styles.content}>{n.body}</p>
								<span className={styles.time}>{formatTime(n.createdAt)}</span>
							</div>
							{!n.read && <div className={styles.dot} />}
						</li>
					))}
				</ul>
			)}
		</div>
	)
}