// client/src/pages/Settings/General.tsx
import { useState } from 'react'
import styles from './settings.module.scss'

export default function SettingsGeneral() {
	const [notifications, setNotifications] = useState(true)
	const [emailDigest, setEmailDigest] = useState(false)
	const [language, setLanguage] = useState('pl')

	return (
		<div className={styles.section}>
			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Powiadomienia</h2>

				<div className={styles.settingRow}>
					<div>
						<p className={styles.settingLabel}>Powiadomienia push</p>
						<p className={styles.settingDesc}>Otrzymuj powiadomienia o nowych komentarzach i ogłoszeniach</p>
					</div>
					<button
						className={`${styles.toggle} ${notifications ? styles.on : ''}`}
						onClick={() => setNotifications((v) => !v)}
						aria-label="toggle notifications"
					>
						<span className={styles.toggleKnob} />
					</button>
				</div>

				<div className={styles.settingRow}>
					<div>
						<p className={styles.settingLabel}>Podsumowanie email</p>
						<p className={styles.settingDesc}>Cotygodniowy digest aktywności na osiedlu</p>
					</div>
					<button
						className={`${styles.toggle} ${emailDigest ? styles.on : ''}`}
						onClick={() => setEmailDigest((v) => !v)}
						aria-label="toggle email digest"
					>
						<span className={styles.toggleKnob} />
					</button>
				</div>
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Język i region</h2>
				<div className={styles.settingRow}>
					<div>
						<p className={styles.settingLabel}>Język aplikacji</p>
					</div>
					<select
						className={styles.select}
						value={language}
						onChange={(e) => setLanguage(e.target.value)}
					>
						<option value="pl">Polski</option>
						<option value="en">English</option>
					</select>
				</div>
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Prywatność</h2>
				<div className={styles.settingRow}>
					<div>
						<p className={styles.settingLabel}>Widoczność profilu</p>
						<p className={styles.settingDesc}>Tylko mieszkańcy Twojego osiedla mogą zobaczyć Twój profil</p>
					</div>
					<span className={styles.badge}>Osiedle</span>
				</div>
			</div>

			<p className={styles.version}>Tutej v1.0.0</p>
		</div>
	)
}