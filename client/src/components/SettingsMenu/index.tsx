import { useRef, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
					<button className={styles.item} onClick={() => go('/settings/account')}>
						Konto
					</button>
				</li>
				<li>
					<button className={styles.item} onClick={() => go('/settings/support')}>
						Wsparcie
					</button>
				</li>
			</ul>
		</div>
	)
}