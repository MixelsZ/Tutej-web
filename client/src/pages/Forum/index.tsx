import styles from './Forum.module.scss';

const mockPosts = [
	{
		id: 1,
		title: "Remont ulicy Głównej",
		content: "Czy ktoś wie, jak długo potrwają utrudnienia pod blokiem nr 4?",
		createdAt: "2026-05-10T12:00:00Z",
		author: { firstName: "Jan", lastName: "Kowalski", photo: null },
		_count: { comments: 5 }
	}
];

const PostCard = ({ post }: { post: any }) => {
	return (
		<article className={styles.postCard}>
			<div className={styles.authorInfo}>
				<div className={styles.avatar}>
					{post.author.photo ? <img src={post.author.photo} alt="avatar" /> : null}
				</div>
				<div>
					<span className={styles.name}>{post.author.firstName} {post.author.lastName}</span>
					<span className={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
				</div>
			</div>

			<div className={styles.content}>
				<h2>{post.title}</h2>
				<p>{post.content}</p>
				{post.media && <img src={post.media} className={styles.postMedia} alt="post" />}
			</div>

			<div className={styles.footer}>
				<button>💬 {post._count.comments} komentarzy</button>
				<button>🔗 Udostępnij</button>
			</div>
		</article>
	);
};

export const Forum = () => {
	return (
		<div className={styles.forumWrapper}>
			<div className={styles.container}>
				<header style={{ marginBottom: '2rem' }}>
					<h1>Twoja okolica</h1>
					<p>Posty z Twojego sąsiedztwa</p>
				</header>

				{mockPosts.map(post => (
					<PostCard key={post.id} post={post} />
				))}
			</div>
		</div>
	);
};

