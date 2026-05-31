import { useState, useEffect } from 'react'
import style from './events.module.scss'
import Heading from '../../components/Heading'
import EventCard from '../../components/EventCard'
import Button from '../../components/Button'
import InputField from '../../components/InputField'
import FormModal from '../../components/FormModal'

export function Events() {
	const [events, setEvents] = useState<any[]>([])
	const [showMyEvents, setShowMyEvents] = useState(false)
	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [name, setName] = useState('')
	const [description, setDescription] = useState('')
	const [place, setPlace] = useState('')
	const [date, setDate] = useState('')
	const [duration, setDuration] = useState('')
	const [price, setPrice] = useState('')
	const [imageBase64, setImageBase64] = useState('')
	const currentUserId =
		typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null

	const fetchEvents = () => {
		fetch('http://localhost:5000/api/events')
			.then((res) => res.json())
			.then((data) => setEvents(data))
	}

	useEffect(() => {
		fetchEvents()
	}, [])

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return
		if (file.size > 10 * 1024 * 1024) {
			alert('Zdjęcie jest zbyt duże. Maksymalny rozmiar to 10 MB.')
			return
		}
		const reader = new FileReader()
		reader.onloadend = () => {
			if (typeof reader.result === 'string') {
				setImageBase64(reader.result)
			}
		}
		reader.readAsDataURL(file)
	}

	const handleAddEvent = async () => {
		if (!currentUserId) {
			alert('Błąd autoryzacji. Zaloguj się ponownie.')
			return
		}
		if (!name || !description || !place || !date || !imageBase64) {
			alert('Wypełnij wszystkie wymagane pola oraz dodaj zdjęcie wydarzenia.')
			return
		}
		setIsSubmitting(true)
		try {
			const res = await fetch('http://localhost:5000/api/events', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					description,
					place,
					date,
					duration: duration || null,
					price: price ? parseFloat(price) : null,
					authorId: currentUserId,
					image: imageBase64,
				}),
			})
			if (res.ok) {
				const newEvent = await res.json()
				setEvents([newEvent, ...events])
				setIsFormOpen(false)
				setName('')
				setDescription('')
				setPlace('')
				setDate('')
				setDuration('')
				setPrice('')
				setImageBase64('')
			} else {
				alert('Wystąpił błąd podczas dodawania wydarzenia.')
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleDeleteEvent = async (id: number) => {
		if (!confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return
		try {
			const res = await fetch(`http://localhost:5000/api/events/${id}`, { method: 'DELETE' })
			if (res.ok) {
				setEvents((prev) => prev.filter((e) => e.id !== id))
			} else {
				alert('Nie udało się usunąć wydarzenia.')
			}
		} catch (error) {
			console.error(error)
		}
	}

	const filteredEvents = events.filter((e) => {
		if (showMyEvents) return e.authorId === currentUserId
		return true
	})

	return (
		<div className={style.container}>
			<header className={style.header}>
				<div>
					<Heading text={'Wydarzenia'} />
					<p className={style.subtitle}>Przeglądaj wydarzenia z okolicy</p>
				</div>
				<div className={style.buttons}>
					<Button
						text="Dodaj nowe wydarzenie"
						variant="primary"
						onClick={() => setIsFormOpen(true)}
					/>
					<Button
						text={showMyEvents ? 'Wszystkie wydarzenia' : 'Moje wydarzenia'}
						variant="secondary"
						onClick={() => setShowMyEvents(!showMyEvents)}
					/>
				</div>
			</header>
			<div className={style.grid}>
				{filteredEvents.map((e: any) => (
					<EventCard key={e.id} event={e} onDelete={handleDeleteEvent} />
				))}
			</div>
			<FormModal
				title="Dodaj nowe wydarzenie"
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				onSubmit={handleAddEvent}
				isSubmitting={isSubmitting}
				submitText="Utwórz wydarzenie"
			>
				<div className={style.formGroup}>
					<p>Nazwa wydarzenia</p>
					<InputField value={name} placeholder="" icon="letters" onChange={setName} />
				</div>
				<div className={style.row}>
					<div className={style.formGroup}>
						<p>Adres</p>
						<InputField
							value={place}
							placeholder=""
							icon="building"
							onChange={setPlace}
						/>
					</div>
					<div className={style.formGroup}>
						<p>Data i godzina</p>
						<InputField
							value={date}
							type="datetime-local"
							placeholder=""
							icon="date"
							onChange={setDate}
						/>
					</div>
				</div>
				<div className={style.row}>
					<div className={style.formGroup}>
						<p>Cena wstępu (PLN)</p>
						<InputField
							value={price}
							placeholder="Zostaw puste, jeśli darmowe"
							type="number"
							icon="price"
							onChange={setPrice}
						/>
					</div>
					<div className={style.formGroup}>
						<p>Czas trwania</p>
						<InputField
							value={duration}
							placeholder="Np. 2 godziny, 3 dni"
							icon="duration"
							onChange={setDuration}
						/>
					</div>
				</div>
				<div className={style.formGroup}>
					<p>Opis wydarzenia</p>
					<textarea
						className={style.textarea}
						placeholder=""
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>
				<div className={style.formGroup}>
					<p>Zdjęcie wydarzenia (wymagane)</p>
					<div className={style.imageUploadContainer}>
						<input
							type="file"
							accept="image/*"
							id="event-photo"
							className={style.hiddenInput}
							onChange={handleImageChange}
						/>
						<label htmlFor="event-photo" className={style.fileLabel}>
							<span>Dodaj okładkę</span>
						</label>
					</div>
					{imageBase64 && (
						<div className={style.imagePreviewList}>
							<div className={style.imagePreviewItem}>
								<img src={imageBase64} alt="Event Preview" />
								<button
									onClick={() => setImageBase64('')}
									className={style.removeBtn}
								>
									✕
								</button>
							</div>
						</div>
					)}
				</div>
			</FormModal>
		</div>
	)
}
