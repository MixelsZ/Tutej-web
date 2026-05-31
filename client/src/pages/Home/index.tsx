import { useState, useEffect } from 'react'
import style from './home.module.scss'
import Heading from '../../components/Heading'
import NoticeCard from '../../components/NoticeCard'
import EventCard from '../../components/EventCard'

interface Author {
	id: number
	firstName: string
	lastName: string
	photo: string | null
	role: 'USER' | 'COUNCILLOR' | 'ADMIN'
}

interface NoticeData {
	id: number
	title: string
	content: string
	media: string | null
	createdAt: string
	author: Author
}

interface EventData {
	id: number
	name: string
	description: string
	place: string
	date: string
	duration?: string
	price?: number
	image: string
	authorId: number
	author: {
		firstName: string
		lastName: string
		photo?: string
	}
	attendees: Array<{
		id: number
		firstName: string
		photo?: string
	}>
}

export function Home() {
	const [notice, setNotice] = useState<NoticeData | null>(null)
	const [event, setEvent] = useState<EventData | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [noticesRes, eventsRes] = await Promise.all([
					fetch('http://localhost:5000/api/notices'),
					fetch('http://localhost:5000/api/events'),
				])

				if (noticesRes.ok) {
					const noticesData = await noticesRes.json()
					if (noticesData.length > 0) setNotice(noticesData[0])
				}

				if (eventsRes.ok) {
					const eventsData = await eventsRes.json()
					if (eventsData.length > 0) setEvent(eventsData[0])
				}
			} catch (error) {
				console.error(error)
			} finally {
				setLoading(false)
			}
		}
		fetchData()
	}, [])

	return (
		<div className={style.container}>
			<div className={style.mainGrid}>
				<div className={style.leftColumn}>
					<header className={style.header}>
						<Heading text="Dzień dobry!" />
						<p className={style.subtitle}>
							Sprawdź, co nowego dzieje się w Twojej okolicy. Przeglądaj wydarzenia,
							oferty, ogłoszenia oraz porozmawiaj z innymi mieszkańcami na forum!
						</p>
					</header>
					<div className={style.illustrationWrapper}>
						<img
							src="/illustrations/02.svg"
							alt="Domek i drzewko"
							className={style.floatingIllustration}
						/>
					</div>
				</div>

				<div className={style.rightColumn}>
					{loading ? (
						<div className={style.loader}>Ładowanie podglądu...</div>
					) : (
						<>
							<div className={style.section}>
								<div className={style.sectionHeader}>
									<h2 className={style.sectionTitle}>Najnowsze ogłoszenie</h2>
								</div>
								<div className={style.cardContainer}>
									{notice ? (
										<NoticeCard notice={notice} delay="0s" />
									) : (
										<div className={style.empty}>Brak nowych ogłoszeń.</div>
									)}
								</div>
							</div>

							<div className={style.section}>
								<div className={style.sectionHeader}>
									<h2 className={style.sectionTitle}>Najbliższe wydarzenie</h2>
								</div>
								<div className={style.cardContainer}>
									{event ? (
										<EventCard event={event} onDelete={() => {}} />
									) : (
										<div className={style.empty}>
											Brak zaplanowanych wydarzeń.
										</div>
									)}
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
