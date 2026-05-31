import { useState, useEffect } from 'react'
import style from './notices.module.scss'
import Heading from '../../components/Heading'
import Button from '../../components/Button'
import FormModal from '../../components/FormModal'
import InputField from '../../components/InputField'
import NoticeCard from '../../components/NoticeCard'

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

export default function NoticesPage() {
	const [notices, setNotices] = useState<Notice[]>([])
	const [loading, setLoading] = useState(true)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [newTitle, setNewTitle] = useState('')
	const [newContent, setNewContent] = useState('')
	const [submitting, setSubmitting] = useState(false)

	const token = localStorage.getItem('token')
	const userRole = localStorage.getItem('userRole')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	const canPost = userRole === 'COUNCILLOR' || userRole === 'ADMIN'

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
				}),
			})
			const created = await res.json()
			setNotices((prev) => [created, ...prev])
			setNewTitle('')
			setNewContent('')
			setIsFormOpen(false)
		} catch (err) {
			console.error(err)
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className={style.container}>
			<header className={style.header}>
				<div>
					<Heading text={'Ogłoszenia'} />
					<p className={style.subtitle}>Ważne informacje od radnych</p>
				</div>
				{canPost && (
					<div className={style.headerAction}>
						<Button
							text="Dodaj nowe ogłoszenie"
							variant="primary"
							onClick={() => setIsFormOpen(true)}
						/>
					</div>
				)}
			</header>

			{loading ? (
				<div className={style.skeletonList}>
					{[...Array(4)].map((_, i) => (
						<div key={i} className={style.skeleton} />
					))}
				</div>
			) : (
				<div className={style.grid}>
					{notices.map((notice, i) => (
						<NoticeCard
							key={notice.id}
							notice={notice}
							delay={`${i * 50}ms`}
						/>
					))}
				</div>
			)}

			<FormModal
				title="Dodaj nowe ogłoszenie"
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				onSubmit={handleSubmit}
				isSubmitting={submitting}
				submitText="Opublikuj"
			>
				<div className={style.formGroup}>
					<p>Tytuł ogłoszenia</p>
					<InputField
						value={newTitle}
						placeholder="Wpisz tytuł..."
						icon="letters"
						onChange={setNewTitle}
					/>
				</div>
				<div className={style.formGroup}>
					<p>Treść ogłoszenia</p>
					<textarea
						className={style.textarea}
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
					/>
				</div>
			</FormModal>
		</div>
	)
}