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
    onClick: () => void
}

export function NoticeCard({ notice, delay, onClick }: NoticeCardProps) {
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
        <button
            className={styles.card}
            onClick={onClick}
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
                            <span>{notice.author?.firstName?.[0]}{notice.author?.lastName?.[0]}</span>
                        )}
                    </div>
                    <span className={styles.authorName}>{notice.author?.firstName} {notice.author?.lastName}</span>
                </div>
                <svg className={styles.arrow} viewBox="0 0 24 24" fill="none">
                    <path d="M9 18l6-6-6-6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </button>
    )
}