// client/src/pages/Forum/ForumPost/index.tsx
import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './forumPost.module.scss'

interface Author {
	id: number
	firstName: string
	lastName: string
	photo: string | null
}

interface Comment {
	id: number
	content: string
	createdAt: string
	author: Author
}

interface PostDetail {
	id: number
	title: string
	content: string
	media: string | null
	createdAt: string
	author: Author
	forum: { id: number; name: string; icon: string | null }
	comments: Comment[]
}

export default function ForumPostPage() {
	const { forumId, postId } = useParams<{ forumId: string; postId: string }>()
	const navigate = useNavigate()

	const [post, setPost] = useState<PostDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [newComment, setNewComment] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const bottomRef = useRef<HTMLDivElement>(null)

	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	// Decode current user from JWT
	const currentUserId = (() => {
		try {
			return JSON.parse(atob(token!.split('.')[1])).id
		} catch {
			return null
		}
	})()

	useEffect(() => {
		fetch(`http://localhost:5000/api/forums/posts/${postId}`, { headers })
			.then((r) => r.json())
			.then((data) => setPost(data))
			.catch(console.error)
			.finally(() => setLoading(false))
	}, [postId])

	const handleAddComment = async () => {
		if (!newComment.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch(`/api/forums/posts/${postId}/comments`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ content: newComment }),
			})
			const comment = await res.json()
			setPost((prev) => (prev ? { ...prev, comments: [...prev.comments, comment] } : prev))
			setNewComment('')
			setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
		} catch (err) {
			console.error(err)
		} finally {
			setSubmitting(false)
		}
	}

	const handleDeleteComment = async (commentId: number) => {
		if (!confirm('Usunąć komentarz?')) return
		try {
			await fetch(`/api/forums/comments/${commentId}`, { method: 'DELETE', headers })
			setPost((prev) =>
				prev
					? { ...prev, comments: prev.comments.filter((c) => c.id !== commentId) }
					: prev,
			)
		} catch (err) {
			console.error(err)
		}
	}

	const handleDeletePost = async () => {
		if (!confirm('Usunąć ten wątek?')) return
		try {
			await fetch(`http://localhost:5000/api/forums/posts/${postId}`, {
				method: 'DELETE',
				headers,
			})
			navigate(`/forum/${forumId}`)
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

	if (loading) {
		return (
			<div className={styles.loadingPage}>
				<div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
				<div className={`${styles.skeleton} ${styles.skeletonBody}`} />
				<div className={`${styles.skeleton} ${styles.skeletonBody}`} />
			</div>
		)
	}

	if (!post) return <div className={styles.notFound}>Wątek nie znaleziony</div>

	return (
		<div className={styles.page}>
			{/* Back */}
			<div className={styles.topBar}>
				<button className={styles.backBtn} onClick={() => navigate(`/forum/${forumId}`)}>
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M19 12H5M5 12l7 7M5 12l7-7"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
				<span className={styles.breadcrumb}>
					{post.forum?.icon} {post.forum?.name}
				</span>
				{post.author.id === currentUserId && (
					<button className={styles.deletePostBtn} onClick={handleDeletePost}>
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

			{/* Post content */}
			<div className={styles.postCard}>
				<div className={styles.postAuthorRow}>
					<div className={styles.avatar}>
						{post.author.photo ? (
							<img src={post.author.photo} alt="" />
						) : (
							<span>
								{post.author.firstName[0]}
								{post.author.lastName[0]}
							</span>
						)}
					</div>
					<div>
						<p className={styles.authorName}>
							{post.author.firstName} {post.author.lastName}
						</p>
						<p className={styles.postDate}>{formatDate(post.createdAt)}</p>
					</div>
				</div>
				<h1 className={styles.postTitle}>{post.title}</h1>
				<p className={styles.postContent}>{post.content}</p>
				{post.media && (
					<img src={post.media} alt="Załącznik" className={styles.postMedia} />
				)}
			</div>

			{/* Comments section */}
			<div className={styles.commentsSection}>
				<h2 className={styles.commentsTitle}>
					Komentarze
					<span className={styles.commentsBadge}>{post.comments.length}</span>
				</h2>

				{post.comments.length === 0 ? (
					<div className={styles.noComments}>
						<span>💭</span>
						<p>Brak komentarzy. Dodaj pierwszy!</p>
					</div>
				) : (
					<div className={styles.commentList}>
						{post.comments.map((comment, i) => (
							<div
								key={comment.id}
								className={styles.comment}
								style={{ '--delay': `${i * 30}ms` } as React.CSSProperties}
							>
								<div className={styles.commentAvatar}>
									{comment.author.photo ? (
										<img src={comment.author.photo} alt="" />
									) : (
										<span>
											{comment.author.firstName[0]}
											{comment.author.lastName[0]}
										</span>
									)}
								</div>
								<div className={styles.commentBody}>
									<div className={styles.commentHeader}>
										<span className={styles.commentAuthor}>
											{comment.author.firstName} {comment.author.lastName}
										</span>
										<span className={styles.commentDate}>
											{new Date(comment.createdAt).toLocaleDateString(
												'pl-PL',
												{
													day: 'numeric',
													month: 'short',
													hour: '2-digit',
													minute: '2-digit',
												},
											)}
										</span>
										{comment.author.id === currentUserId && (
											<button
												className={styles.deleteCommentBtn}
												onClick={() => handleDeleteComment(comment.id)}
											>
												<svg viewBox="0 0 24 24" fill="none">
													<path
														d="M3 6h18M19 6l-1 14H6L5 6"
														strokeWidth="1.8"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</button>
										)}
									</div>
									<p className={styles.commentContent}>{comment.content}</p>
								</div>
							</div>
						))}
					</div>
				)}
				<div ref={bottomRef} />
			</div>

			{/* Add comment */}
			<div className={styles.addComment}>
				<textarea
					className={styles.commentInput}
					placeholder="Napisz komentarz..."
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					rows={2}
					onKeyDown={(e) => {
						if (e.key === 'Enter' && !e.shiftKey) {
							e.preventDefault()
							handleAddComment()
						}
					}}
				/>
				<button
					className={styles.sendBtn}
					onClick={handleAddComment}
					disabled={submitting || !newComment.trim()}
				>
					<svg viewBox="0 0 24 24" fill="none">
						<path
							d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</button>
			</div>
		</div>
	)
}
