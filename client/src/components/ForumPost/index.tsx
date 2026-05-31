import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './forumPost.module.scss'
import Button from '../Button'

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

export default function ForumPost() {
	const { forumId, postId } = useParams<{ forumId: string; postId: string }>()
	const navigate = useNavigate()

	const [post, setPost] = useState<PostDetail | null>(null)
	const [loading, setLoading] = useState(true)
	const [newComment, setNewComment] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const bottomRef = useRef<HTMLDivElement>(null)

	const token = localStorage.getItem('token')
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

	const currentUserId = (() => {
		try {
			return JSON.parse(atob(token!.split('.')[1])).id
		} catch {
			return null
		}
	})()

	const loadPost = () => {
		fetch(`http://localhost:5000/api/forums/posts/${postId}`, { headers })
			.then((r) => r.json())
			.then((data) => setPost(data))
			.catch(console.error)
			.finally(() => setLoading(false))
	}

	useEffect(() => {
		loadPost()
	}, [postId])

	const handleAddComment = async () => {
		if (!newComment.trim()) return
		setSubmitting(true)
		try {
			const res = await fetch(`http://localhost:5000/api/forums/posts/${postId}/comments`, {
				method: 'POST',
				headers,
				body: JSON.stringify({ content: newComment }),
			})
			if (res.ok) {
				setNewComment('')
				loadPost()
				setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 200)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setSubmitting(false)
		}
	}

	const handleDeletePost = async () => {
		if (!confirm('Usunąć ten wątek?')) return
		try {
			const res = await fetch(`http://localhost:5000/api/forums/posts/${postId}`, {
				method: 'DELETE',
				headers,
			})
			if (res.ok) {
				navigate(`/forum/${forumId}`)
			}
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
			<div className={styles.postCard}>
				<div className={styles.postAuthorRow}>
					<div className={styles.onlyAuthor}>
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
						<div>
							<p className={styles.authorName}>
								{post.author?.firstName} {post.author?.lastName}
							</p>
							<p className={styles.postDate}>{formatDate(post.createdAt)}</p>
						</div>
					</div>
					{post.author?.id === currentUserId && (
						<div className={styles.deletePostBtn}>
							<Button variant="delete" onClick={handleDeletePost}>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M4 7H20M10 11V17M14 11V17M5 7L6 19C6 19.5304 6.21071 20.0391 6.58579 20.4142C6.96086 20.7893 7.46957 21 8 21H16C16.5304 21 17.0391 20.7893 17.4142 20.4142C17.7893 20.0391 18 19.5304 18 19L19 7M9 7V4C9 3.73478 9.10536 3.48043 9.29289 3.29289C9.48043 3.10536 9.73478 3 10 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V7"
										stroke="white"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</Button>
						</div>
					)}
				</div>
				<h1 className={styles.postTitle}>{post.title}</h1>
				<p className={styles.postContent}>{post.content}</p>
				{post.media && (
					<img src={post.media} alt="Załącznik" className={styles.postMedia} />
				)}
			</div>

			<div className={styles.commentsSection}>
				<h2 className={styles.commentsTitle}>
					Komentarze
					<span className={styles.commentsBadge}>{post.comments?.length || 0}</span>
				</h2>

				{!post.comments || post.comments.length === 0 ? (
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
								<div className={styles.commentAuthorOnly}>
									<div className={styles.avatar}>
										{comment.author?.photo ? (
											<img src={comment.author.photo} alt="" />
										) : (
											<span>
												{comment.author?.firstName?.[0]}
												{comment.author?.lastName?.[0]}
											</span>
										)}
									</div>
									<div className={styles.commentBody}>
										<div className={styles.commentHeader}>
											<span className={styles.commentAuthor}>
												{comment.author?.firstName}{' '}
												{comment.author?.lastName}
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
										</div>
									</div>
								</div>
								<p className={styles.commentContent}>{comment.content}</p>
							</div>
						))}
					</div>
				)}
				<div ref={bottomRef} />
			</div>

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
