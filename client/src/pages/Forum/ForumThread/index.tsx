// client/src/pages/Forum/ForumThread/index.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './forumThread.module.scss'

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

export default function ForumThreadPage() {
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
			const res = await fetch(`http://localhost:5000/api/forums/${forumId}/posts?${params}`, { headers })
			setPosts(await res.json())
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		fetch('http://localhost:5000/api/forums', { headers })
			.then((r) => r.json())
			.then((forums: Forum[]) => setForum(forums.find((f) => f.id === Number(forumId)) || null))
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
			const created = await res.json()
			setPosts((prev) => [created, ...prev])
			setNewTitle('')
			setNewContent('')
			setShowNewPost(false)
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
			{/* Header */}
			<div className={styles.header}>
				<button className={styles.backBtn} onClick={() => navigate('/forum')}>
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M19 12H5M5 12l7 7M5 12l7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</button>
				<div className={styles.forumTitle}>
					<span className={styles.icon}>{forum?.icon || '💬'}</span>
					<div>
						<h1>{forum?.name || '...'}</h1>
						<p>{forum?.description}</p>
					</div>
				</div>
				<button className={styles.newPostBtn} onClick={() => setShowNewPost((p) => !p)}>
					<svg viewBox="0 0 24 24" fill="none">
						<path d="M12 5v14M5 12h14" strokeWidth="2.5" strokeLinecap="round" />
					</svg>
					Nowy wątek
				</button>
			</div>

			{/* New post form */}
			{showNewPost && (
				<div className={styles.newPostForm}>
					<input
						className={styles.titleInput}
						placeholder="Tytuł wątku..."
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						maxLength={120}
					/>
					<textarea
						className={styles.contentInput}
						placeholder="Opisz temat swojego wątku..."
						value={newContent}
						onChange={(e) => setNewContent(e.target.value)}
						rows={4}
					/>
					<div className={styles.formActions}>
						<button className={styles.cancelBtn} onClick={() => setShowNewPost(false)}>
							Anuluj
						</button>
						<button
							className={styles.submitBtn}
							onClick={handleSubmitPost}
							disabled={submitting || !newTitle.trim() || !newContent.trim()}
						>
							{submitting ? 'Dodawanie...' : 'Opublikuj'}
						</button>
					</div>
				</div>
			)}

			{/* Search + sort bar */}
			<div className={styles.toolbar}>
				<div className={styles.searchBox}>
					<svg viewBox="0 0 24 24" fill="none">
						<circle cx="11" cy="11" r="7" strokeWidth="2" />
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
							{s === 'newest' ? 'Najnowsze' : s === 'oldest' ? 'Najstarsze' : 'Popularne'}
						</button>
					))}
				</div>
			</div>

			{/* Posts list */}
			{loading ? (
				<div className={styles.skeletonList}>
					{[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
				</div>
			) : posts.length === 0 ? (
				<div className={styles.empty}>
					<span>🗒️</span>
					<p>Brak wątków. Bądź pierwszy!</p>
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
									{post.author.photo ? (
										<img src={post.author.photo} alt="" />
									) : (
										<span>{post.author.firstName[0]}{post.author.lastName[0]}</span>
									)}
								</div>
								<span className={styles.authorName}>
									{post.author.firstName} {post.author.lastName}
								</span>
								<span className={styles.dot}>·</span>
								<span className={styles.date}>{formatDate(post.createdAt)}</span>
							</div>
							<h3 className={styles.postTitle}>{post.title}</h3>
							<p className={styles.postSnippet}>{post.content}</p>
							<div className={styles.postFooter}>
								<span className={styles.commentCount}>
									<svg viewBox="0 0 24 24" fill="none">
										<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
									{post._count.comments}
								</span>
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	)
}