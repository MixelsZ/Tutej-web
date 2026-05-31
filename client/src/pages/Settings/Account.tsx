import { useState, useEffect } from 'react'
import { getAuthHeaders } from '../../hooks/useAuth'
import InputField from '../../components/InputField'
import Button from '../../components/Button'
import styles from './settings.module.scss'

const API = 'http://localhost:5000'

export default function SettingsAccount() {
	const [user, setUser] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [successMsg, setSuccessMsg] = useState('')
	const [errorMsg, setErrorMsg] = useState('')

	const [currentPassword, setCurrentPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [pwSuccess, setPwSuccess] = useState('')
	const [pwError, setPwError] = useState('')
	const [pwSaving, setPwSaving] = useState(false)

	useEffect(() => {
		fetch(`${API}/api/auth/me`, { headers: getAuthHeaders() })
			.then((r) => r.json())
			.then((data) => {
				setUser(data)
				setFirstName(data.firstName)
				setLastName(data.lastName)
			})
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	const handleSaveProfile = async () => {
		setSaving(true)
		setSuccessMsg('')
		setErrorMsg('')
		try {
			const res = await fetch(`${API}/api/auth/me`, {
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify({ firstName, lastName }),
			})
			if (res.ok) {
				setTimeout(() => setSuccessMsg(''), 3000)
			} else {
				setErrorMsg('Błąd podczas zapisywania.')
			}
		} catch {
			setErrorMsg('Błąd połączenia.')
		} finally {
			setSaving(false)
		}
	}

	const handleChangePassword = async () => {
		setPwError('')
		setPwSuccess('')
		if (newPassword !== confirmPassword) {
			setPwError('Hasła nie są identyczne.')
			return
		}
		if (newPassword.length < 6) {
			setPwError('Hasło musi mieć co najmniej 6 znaków.')
			return
		}
		setPwSaving(true)
		try {
			const res = await fetch(`${API}/api/auth/me/password`, {
				method: 'PUT',
				headers: getAuthHeaders(),
				body: JSON.stringify({ currentPassword, newPassword }),
			})
			const data = await res.json()
			if (res.ok) {
				setPwSuccess('Hasło zostało zmienione.')
				setCurrentPassword('')
				setNewPassword('')
				setConfirmPassword('')
				setTimeout(() => setPwSuccess(''), 3000)
			} else {
				setPwError(data.message || 'Błąd zmiany hasła.')
			}
		} catch {
			setPwError('Błąd połączenia.')
		} finally {
			setPwSaving(false)
		}
	}

	if (loading) {
		return (
			<div className={styles.section}>
				{[...Array(2)].map((_, i) => (
					<div
						key={i}
						className={`${styles.card} ${styles.skeleton}`}
						style={{ height: 320 }}
					/>
				))}
			</div>
		)
	}

	const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`

	return (
		<div className={styles.section}>
			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Profil</h2>

				<div className={styles.avatarRow}>
					<div className={styles.avatar}>
						{user?.photo ? <img src={user.photo} alt="" /> : <span>{initials}</span>}
					</div>
					<div>
						<p className={styles.settingLabel}>
							{user?.firstName} {user?.lastName}
						</p>
						<p className={styles.settingDesc}>{user?.email}</p>
						<p className={styles.settingDesc}>{user?.neighborhood?.name}</p>
					</div>
				</div>

				<div className={styles.formRow}>
					<div className={styles.formField}>
						<label className={styles.label}>Imię</label>
						<InputField
							icon="letters"
							placeholder="Wpisz imię"
							value={firstName}
							onChange={(val) => setFirstName(val)}
						/>
					</div>
					<div className={styles.formField}>
						<label className={styles.label}>Nazwisko</label>
						<InputField
							icon="letters"
							placeholder="Wpisz nazwisko"
							value={lastName}
							onChange={(val) => setLastName(val)}
						/>
					</div>
				</div>

				{successMsg && <p className={styles.success}>{successMsg}</p>}
				{errorMsg && <p className={styles.error}>{errorMsg}</p>}

				<Button onClick={handleSaveProfile} disabled={saving}>
					{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
				</Button>
			</div>

			<div className={styles.card}>
				<h2 className={styles.cardTitle}>Zmień hasło</h2>

				<div className={styles.formField}>
					<label className={styles.label}>Obecne hasło</label>
					<InputField
						icon="lock"
						type="password"
						placeholder="••••••••"
						value={currentPassword}
						onChange={(val) => setCurrentPassword(val)}
					/>
				</div>
				<div className={styles.formRow}>
					<div className={styles.formField}>
						<label className={styles.label}>Nowe hasło</label>
						<InputField
							icon="lock"
							type="password"
							placeholder="••••••••"
							value={newPassword}
							onChange={(val) => setNewPassword(val)}
						/>
					</div>
					<div className={styles.formField}>
						<label className={styles.label}>Powtórz nowe hasło</label>
						<InputField
							icon="lock"
							type="password"
							placeholder="••••••••"
							value={confirmPassword}
							onChange={(val) => setConfirmPassword(val)}
						/>
					</div>
				</div>

				{pwSuccess && <p className={styles.success}>{pwSuccess}</p>}
				{pwError && <p className={styles.error}>{pwError}</p>}

				<Button
					onClick={handleChangePassword}
					disabled={pwSaving || !currentPassword || !newPassword}
				>
					{pwSaving ? 'Zmienianie...' : 'Zmień hasło'}
				</Button>
			</div>
		</div>
	)
}
