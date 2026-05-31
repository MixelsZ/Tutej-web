import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './forumThread.module.scss'
import Heading from '../../components/Heading'
import Button from '../../components/Button'
import InputField from '../../components/InputField'

interface Post {
	id: number
	title: string
	content: string
	createdAt: string
	author: { id: number; firstName: string; lastName: string; photo: string | null }
	_count: { comments: number }
}

interface Forum {
	id: number
	name: string
	description: string
	icon: string | null
}

type SortOption = 'newest' | 'oldest' | 'popular'

export default function ForumThread() {
	const { forumId } = useParams<{ forumId: string }>()
	const navigate = useNavigate()

	const [forum, setForum] = useState<Forum | null>(null)
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [search, setSearch] = useState('')
	const [sort, setSort] = useState<SortOption>('newest')
	const [showNewPost, setShowNewPost] = useState(false)
	const [newTitle, setNewTitle] = useState('')
	const [newContent, setNewContent] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	const fetchPosts = async (q = '', s = sort) => {
		setLoading(true)
		try {
			const params = new URLSearchParams({ sort: s, ...(q ? { search: q } : {}) })
			const res = await fetch(`http://localhost:5000/api/forums/${forumId}/posts?${params}`, {
				headers,
			})
			if (res.ok) {
				setPosts(await res.json())
			}
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetch('http://localhost:5000/api/forums', { headers })
			.then((r) => r.json())
			.then((forums: Forum[]) =>
				setForum(forums.find((f) => f.id === Number(forumId)) || null),
			)
		fetchPosts()
	}, [forumId])

	const handleSearch = (val: string) => {
		setSearch(val)
		clearTimeout(searchTimeout.current ?? undefined)
		searchTimeout.current = setTimeout(() => fetchPosts(val, sort), 400)
	}

	const handleSort = (s: SortOption) => {
		setSort(s)
		fetchPosts(search, s)
	}

	const handleSubmitPost = async () => {
		if (!newTitle.trim() || !newContent.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch(`http://localhost:5000/api/forums/${forumId}/posts`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ title: newTitle, content: newContent }),
			})
			if (res.ok) {
				setNewTitle('')
				setNewContent('')
				setShowNewPost(false)
				await fetchPosts(search, sort)
			}
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
		return d.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
	}

	return (
		<div className={styles.page}>
			<div className={styles.header}>
				<div className={styles.titleWithBack}>
					<button className={styles.backBtn} onClick={() => navigate('/forum')}>
						<svg viewBox="0 0 24 24" fill="none">
							<path
								d="M19 12H5M5 12l7 7M5 12l7-7"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
					<div className={styles.forumTitle}>
						<div>
							<Heading text={forum?.name || '...'} />
							<p className={styles.subtitle}>{forum?.description}</p>
						</div>
					</div>
				</div>
				<div className={styles.buttonContainer}>
					<Button onClick={() => setShowNewPost((p) => !p)}>Nowy wątek</Button>
				</div>
			</div>

			{showNewPost && (
				<div className={styles.newPostForm}>
					<div className={styles.fieldGroup}>
						<InputField
							placeholder="Tytuł wpisu"
							value={newTitle}
							onChange={setNewTitle}
						/>
					</div>
					<div className={styles.fieldGroup}>
						<textarea
							className={styles.contentInput}
							placeholder="Treść"
							value={newContent}
							onChange={(e) => setNewContent(e.target.value)}
							rows={5}
						/>
					</div>
					<div className={styles.formActions}>
						<Button onClick={() => setShowNewPost(false)} variant={'secondary'}>
							Anuluj
						</Button>
						<Button
							onClick={handleSubmitPost}
							disabled={submitting || !newTitle.trim() || !newContent.trim()}
						>
							{submitting ? 'Dodawanie...' : 'Opublikuj'}
						</Button>
					</div>
				</div>
			)}

			<div className={styles.toolbar}>
				<div className={styles.searchBox}>
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="11" cy="11" r="7" strokeWidth="2" strokeLinecap="round" />
						<path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
					</svg>
					<input
						placeholder="Szukaj wątków..."
						value={search}
						onChange={(e) => handleSearch(e.target.value)}
					/>
				</div>
				<div className={styles.sortTabs}>
					{(['newest', 'oldest', 'popular'] as SortOption[]).map((s) => (
						<button
							key={s}
							className={`${styles.sortTab} ${sort === s ? styles.active : ''}`}
							onClick={() => handleSort(s)}
						>
							{s === 'newest'
								? 'Najnowsze'
								: s === 'oldest'
									? 'Najstarsze'
									: 'Popularne'}
						</button>
					))}
				</div>
			</div>

			{loading ? (
				<div className={styles.skeletonList}>
					{[...Array(4)].map((_, i) => (
						<div key={i} className={`${styles.cardSkeleton}`} style={{ height: 160 }} />
					))}
				</div>
			) : posts.length === 0 ? (
				<div className={styles.empty}>
					<span>🗒️</span>
					<p>Brak wątków w tym dziale. Bądź pierwszy i rozpocznij dyskusję!</p>
				</div>
			) : (
				<div className={styles.postList}>
					{posts.map((post, i) => (
						<button
							key={post.id}
							className={styles.postCard}
							onClick={() => navigate(`/forum/${forumId}/post/${post.id}`)}
							style={{ '--delay': `${i * 40}ms` } as React.CSSProperties}
						>
							<div className={styles.postMeta}>
								<div className={styles.avatar}>
									{post.author?.photo ? (
										<img src={post.author.photo} alt="" />
									) : (
										<span>
											{post.author?.firstName?.[0]}
											{post.author?.lastName?.[0]}
										</span>
									)}
								</div>
								<span className={styles.authorName}>
									{post.author?.firstName} {post.author?.lastName}
								</span>
								<span className={styles.dot}>·</span>
								<span className={styles.date}>{formatDate(post.createdAt)}</span>
							</div>
							<h3 className={styles.postTitle}>{post.title}</h3>
							<p className={styles.postSnippet}>{post.content}</p>
							<div className={styles.postFooter}>
								<span className={styles.commentCount}>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M3 20L4.3 16.1C1.976 12.663 2.874 8.22797 6.4 5.72597C9.926 3.22497 14.99 3.42997 18.245 6.20597C21.5 8.98297 21.94 13.472 19.274 16.707C16.608 19.942 11.659 20.922 7.7 19L3 20Z"
											stroke="#354052"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
									{post._count?.comments || 0} komentarzy
								</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	)
}
