// client/src/pages/Forum/index.tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './forum.module.scss'
import Heading from '../../components/Heading'

interface Forum {
	id: number
	name: string
	description: string
	icon: string | null
	_count: { posts: number }
}


export function Forum() {
	return (
		<div className={styles.container}>
			<Heading text="Forum" />
		</div>
	)
}

const FORUM_ICONS: Record<string, string> = {
	default: '💬',
	garden: '🌿',
	animals: '🐾',
	events: '📅',
	help: '🤝',
	safety: '🔒',
	buy: '🛒',
	kids: '🧒',
}

export default function ForumPage() {
	const [forums, setForums] = useState<Forum[]>([])
	const [loading, setLoading] = useState(true)
	const navigate = useNavigate()

	useEffect(() => {
    const fetchForums = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/forums')
            const data = await res.json()
            setForums(data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }
    fetchForums()
}, [])

	if (loading) {
		return (
			<div className={styles.loadingState}>
				{[...Array(4)].map((_, i) => (
					<div key={i} className={styles.skeleton} />
				))}
			</div>
		)
	}

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.headerText}>
					<h1>Forum</h1>
					<p>Dyskutuj z sąsiadami o tym, co ważne</p>
				</div>
			</header>

			<div className={styles.forumGrid}>
				{forums.map((forum, i) => (
					<button
						key={forum.id}
						className={styles.forumCard}
						onClick={() => navigate(`/forum/${forum.id}`)}
						style={{ '--delay': `${i * 60}ms` } as React.CSSProperties}
					>
						<span className={styles.forumIcon}>
							{forum.icon || FORUM_ICONS.default}
						</span>
						<div className={styles.forumInfo}>
							<h2>{forum.name}</h2>
							<p>{forum.description}</p>
						</div>
						<div className={styles.forumMeta}>
							<span className={styles.postCount}>{forum._count.posts}</span>
							<span className={styles.postLabel}>wątków</span>
						</div>
						<svg className={styles.arrow} viewBox="0 0 24 24" fill="none">
							<path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</button>
				))}
			</div>
		</div>
	)
}