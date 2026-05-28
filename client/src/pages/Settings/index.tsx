// client/src/pages/Settings/index.tsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import styles from './settings.module.scss'

export default function SettingsLayout() {
	const navigate = useNavigate()

	return (
		<div className={styles.page}>
			<div className={styles.topBar}>
				<button className={styles.backBtn} onClick={() => navigate('/')}>
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M19 12H5M5 12l7 7M5 12l7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
				<h1 className={styles.pageTitle}>Ustawienia</h1>
			</div>

			<nav className={styles.tabs}>
				<NavLink
					to="/settings"
					end
					className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
				>
					Główne
				</NavLink>
				<NavLink
					to="/settings/account"
					className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
				>
					Konto
				</NavLink>
				<NavLink
					to="/settings/support"
					className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
				>
					Wsparcie
				</NavLink>
			</nav>

			<Outlet />
		</div>
	)
}