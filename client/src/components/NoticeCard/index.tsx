import { useState, useEffect } from 'react'
import styles from './noticeCard.module.scss'

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

interface NoticeCardProps {
	notice: Notice
	delay: string
}

export default function NoticeCard({ notice, delay }: NoticeCardProps) {
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'auto'
		return () => {
			document.body.style.overflow = 'auto'
		}
	}, [isOpen])

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
		<>
			<button
				className={styles.card}
				onClick={() => setIsOpen(true)}
				style={{ '--delay': delay } as React.CSSProperties}
			>
				<div className={styles.cardHeader}>
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
						<path
							d="M9 18l6-6-6-6"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</button>

			{isOpen && (
				<div className={styles.overlay} onClick={() => setIsOpen(false)}>
					<div className={styles.fullPage} onClick={(e) => e.stopPropagation()}>
						<button className={styles.back} onClick={() => setIsOpen(false)}>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15 6L9 12L15 18"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						<div className={styles.detailsContent}>
							<section>
								<h1 className={styles.heroTitle}>{notice.title}</h1>
								<p className={styles.description}>{notice.content}</p>
							</section>

							<section className={styles.authorSection}>
								<div className={styles.hostRow}>
									<img
										src={
											notice.author?.photo ||
											`https://ui-avatars.com/api/?name=${notice.author?.firstName}+${notice.author?.lastName}`
										}
										alt="Author"
										className={styles.detailAvatar}
									/>
									<div className={styles.authorInfo}>
										<span className={styles.detailAuthorName}>
											{notice.author?.firstName} {notice.author?.lastName}
										</span>
										<span className={styles.authorRole}>
											{notice.author?.role === 'ADMIN'
												? 'Administrator'
												: 'Radny'}
										</span>
									</div>
								</div>
							</section>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
