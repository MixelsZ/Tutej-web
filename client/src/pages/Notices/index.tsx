// client/src/pages/Notices/index.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './notices.module.scss'

interface Author {
	id: number
	firstName: string
	lastName: string
	photo: string | null
	role: 'USER' | 'COUNCILLOR' | 'ADMIN'
}

interface Notice {
	id: number
	title: string
	content: string
	media: string | null
	createdAt: string
	author: Author
}

const ROLE_LABEL: Record<string, string> = {
	COUNCILLOR: 'Radny',
	ADMIN: 'Administrator',
	USER: '',
}

export default function NoticesPage() {
	const [notices, setNotices] = useState<Notice[]>([])
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)
	const [newTitle, setNewTitle] = useState('')
	const [newContent, setNewContent] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const navigate = useNavigate()

	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	const currentUser = (() => {
		try {
			return JSON.parse(atob(token!.split('.')[1]))
		} catch {
			return null
		}
	})()

	const canPost = true // zmień na currentUser?.role === 'COUNCILLOR' || currentUser?.role === 'ADMIN' gdy chcesz ograniczyć

	useEffect(() => {
		fetch('http://localhost:5000/api/notices', { headers })
			.then((r) => r.json())
			.then(setNotices)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [])

	const handleSubmit = async () => {
		if (!newTitle.trim() || !newContent.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch('http://localhost:5000/api/notices', {
				method: 'POST',
				headers,
				body: JSON.stringify({
					title: newTitle,
					content: newContent,
					authorId: currentUser?.id,
					neighborhoodId: currentUser?.neighborhoodId,
				}),
			})
			const created = await res.json()
			if (created.error) {
				console.error(created.error)
				return
			}
			setNotices((prev) => [created, ...prev])
			setNewTitle('')
			setNewContent('')
			setShowForm(false)
		} catch (err) {
			console.error(err)
		} finally {
			setSubmitting(false)
		}
	}

	const formatDate = (iso: string) => {
		const d = new Date(iso)
		const now = new Date()
		const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
		if (diff < 60) return 'przed chwilą'
		if (diff < 3600) return `${Math.floor(diff / 60)} min temu`
		if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`
		if (diff < 172800) return 'wczoraj'
		return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
	}

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerText}>
					<h1>Ogłoszenia</h1>
					<p>Ważne informacje od rady i administracji</p>
				</div>
				{canPost && (
					<button className={styles.newBtn} onClick={() => setShowForm((p) => !p)}>
						<svg viewBox="0 0 24 24" fill="none">
							<path d="M12 5v14M5 12h14" strokeWidth="2.5" strokeLinecap="round" />
						</svg>
						Nowe ogłoszenie
					</button>
				)}
			</header>

			{showForm && (
				<div className={styles.form}>
					<input
						className={styles.titleInput}
						placeholder="Tytuł ogłoszenia..."
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						maxLength={140}
					/>
					<textarea
						className={styles.contentInput}
						placeholder="Treść ogłoszenia..."
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
						rows={5}
					/>
					<div className={styles.formActions}>
						<button className={styles.cancelBtn} onClick={() => setShowForm(false)}>
							Anuluj
						</button>
						<button
							className={styles.submitBtn}
							onClick={handleSubmit}
							disabled={submitting || !newTitle.trim() || !newContent.trim()}
						>
							{submitting ? 'Publikowanie...' : 'Opublikuj'}
						</button>
					</div>
				</div>
			)}

			{loading ? (
				<div className={styles.skeletonList}>
					{[...Array(4)].map((_, i) => (
						<div key={i} className={styles.skeleton} />
					))}
				</div>
			) : notices.length === 0 ? (
				<div className={styles.empty}>
					<span>📋</span>
					<p>Brak ogłoszeń</p>
				</div>
			) : (
				<div className={styles.list}>
					{notices.map((notice, i) => (
						<button
							key={notice.id}
							className={styles.card}
							onClick={() => navigate(`/notices/${notice.id}`)}
							style={{ '--delay': `${i * 50}ms` } as React.CSSProperties}
						>
							<div className={styles.cardHeader}>
								<div className={styles.badgeRow}>
									{notice.author && (notice.author.role === 'COUNCILLOR' || notice.author.role === 'ADMIN') && (
										<span className={styles.badge}>
											{notice.author.role === 'ADMIN' ? '🛡️' : '📣'}{' '}
											{ROLE_LABEL[notice.author.role]}
										</span>
									)}
								</div>
								<span className={styles.date}>{formatDate(notice.createdAt)}</span>
							</div>
							<h2 className={styles.cardTitle}>{notice.title}</h2>
							<p className={styles.cardSnippet}>{notice.content}</p>
							<div className={styles.cardFooter}>
								<div className={styles.authorRow}>
									<div className={styles.avatar}>
										{notice.author?.photo ? (
											<img src={notice.author.photo} alt="" />
										) : (
											<span>
												{notice.author?.firstName?.[0]}
												{notice.author?.lastName?.[0]}
											</span>
										)}
									</div>
									<span className={styles.authorName}>
										{notice.author?.firstName} {notice.author?.lastName}
									</span>
								</div>
								<svg className={styles.arrow} viewBox="0 0 24 24" fill="none">
									<path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
								</svg>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	)
}