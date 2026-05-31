// client/src/pages/Notices/NoticeDetail/index.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './noticeDetail.module.scss'

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
}

export default function NoticeDetailPage() {
	const { noticeId } = useParams<{ noticeId: string }>()
	const navigate = useNavigate()

	const [notice, setNotice] = useState<Notice | null>(null)
	const [loading, setLoading] = useState(true)

	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	const currentUser = (() => {
		try {
			return JSON.parse(atob(token!.split('.')[1]))
		} catch {
			return null
		}
	})()

	useEffect(() => {
		fetch(`http://localhost:5000/api/notices/${noticeId}`, { headers })
			.then((r) => r.json())
			.then(setNotice)
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [noticeId])

	const handleDelete = async () => {
		if (!confirm('Usunąć to ogłoszenie?')) return
		try {
			await fetch(`http://localhost:5000/api/notices/${noticeId}`, {
				method: 'DELETE',
				headers,
			})
			navigate('/notices')
		} catch (err) {
			console.error(err)
		}
	}

	const formatDate = (iso: string) =>
		new Date(iso).toLocaleDateString('pl-PL', {
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})

	const canDelete =
		notice && (notice.author.id === currentUser?.id || currentUser?.role === 'ADMIN')

	if (loading) {
		return (
			<div className={styles.loadingPage}>
				<div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
				<div className={`${styles.skeleton} ${styles.skeletonBody}`} />
				<div className={`${styles.skeleton} ${styles.skeletonBody}`} />
				<div className={`${styles.skeleton} ${styles.skeletonBodyShort}`} />
			</div>
		)
	}

	if (!notice) return <div className={styles.notFound}>Ogłoszenie nie znalezione</div>

	return (
		<div className={styles.page}>
			{/* Top bar */}
			<div className={styles.topBar}>
				<button className={styles.backBtn} onClick={() => navigate('/notices')}>
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M19 12H5M5 12l7 7M5 12l7-7"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<span className={styles.breadcrumb}>Ogłoszenia</span>
				{canDelete && (
					<button className={styles.deleteBtn} onClick={handleDelete}>
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M3 6h18M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				)}
			</div>

			{/* Card */}
			<div className={styles.card}>
				{/* Author row */}
				<div className={styles.authorRow}>
					<div className={styles.avatar}>
						{notice.author.photo ? (
							<img src={notice.author.photo} alt="" />
						) : (
							<span>
								{notice.author.firstName[0]}
								{notice.author.lastName[0]}
							</span>
						)}
					</div>
					<div>
						<p className={styles.authorName}>
							{notice.author.firstName} {notice.author.lastName}
						</p>
						<p className={styles.authorMeta}>
							{ROLE_LABEL[notice.author.role] && (
								<span className={styles.roleBadge}>
									{notice.author.role === 'ADMIN' ? '🛡️' : '📣'}{' '}
									{ROLE_LABEL[notice.author.role]}
								</span>
							)}
							<span className={styles.dot}>·</span>
							{formatDate(notice.createdAt)}
						</p>
					</div>
				</div>

				<h1 className={styles.title}>{notice.title}</h1>
				<p className={styles.content}>{notice.content}</p>

				{notice.media && (
					<img src={notice.media} alt="Załącznik" className={styles.media} />
				)}
			</div>
		</div>
	)
}
