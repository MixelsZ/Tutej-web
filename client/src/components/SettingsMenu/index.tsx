// client/src/components/SettingsMenu/index.tsx
import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../hooks/useAuth'
import styles from './settingsMenu.module.scss'

interface SettingsMenuProps {
	isOpen: boolean
	onClose: () => void
}

export function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()
	const [shouldRender, setShouldRender] = useState(isOpen)

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

	const handleLogout = () => {
		logout()
		onClose()
		navigate('/login')
	}

	const go = (path: string) => {
		onClose()
		navigate(path)
	}

	if (!shouldRender) return null

	return (
		<div
			className={`${styles.menu} ${!isOpen ? styles.closing : ''}`}
			ref={menuRef}
			onAnimationEnd={handleAnimationEnd}
		>
			<ul className={styles.list}>
				<li>
					<button className={styles.item} onClick={() => go('/settings')}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M12 15a3 3 0 100-6 3 3 0 000 6z" strokeWidth="1.8" strokeLinecap="round" />
							<path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="1.8" strokeLinecap="round" />
						</svg>
						Ustawienia główne
					</button>
				</li>
				<li>
					<button className={styles.item} onClick={() => go('/settings/account')}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Konto
					</button>
				</li>
				<li>
					<button className={styles.item} onClick={() => go('/settings/support')}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeWidth="1.8" strokeLinecap="round" />
							<path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Wsparcie
					</button>
				</li>
				<li className={styles.divider} />
				<li>
					<button className={`${styles.item} ${styles.logout}`} onClick={handleLogout}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
						Wyloguj się
					</button>
				</li>
			</ul>
		</div>
	)
}