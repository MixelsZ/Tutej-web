import { useState, useEffect } from 'react'
import style from '../Events/events.module.scss'
import ListingCard from '../../components/ListingCard'
import Heading from '../../components/Heading'
import Button from '../../components/Button'
import InputField from '../../components/InputField'
import FormModal from '../../components/FormModal'

interface ListingImage {
	id: number
	url: string
}

interface ListingData {
	id: number
	title: string
	description: string
	price: string | null
	contact: string
	status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
	createdAt: string
	authorId: number
	author: {
		firstName: string
		lastName: string
		photo?: string
	}
	images: ListingImage[]
}

export function Trade() {
	const [listings, setListings] = useState<ListingData[]>([])
	const [loading, setLoading] = useState(true)
	const [showMyListings, setShowMyListings] = useState(false)

	const [isFormOpen, setIsFormOpen] = useState(false)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [title, setTitle] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [contact, setContact] = useState('')
	const [imagesBase64, setImagesBase64] = useState<string[]>([])

	const currentUserId =
		typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null

	const fetchListings = () => {
		setLoading(true)
		fetch('http://localhost:5000/api/listings')
			.then((res) => res.json())
			.then((data) => {
				setListings(data)
				setLoading(false)
			})
			.catch(() => setLoading(false))
	}

	useEffect(() => {
		fetchListings()
	}, [])

	const handleUpdateListing = (updatedListing: ListingData) => {
		setListings((prev) =>
			prev.map((item) => (item.id === updatedListing.id ? updatedListing : item)),
		)
	}

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (!files) return

		Array.from(files).forEach((file) => {
			if (file.size > 10 * 1024 * 1024) {
				alert(`Zdjęcie ${file.name} jest zbyt duże. Maksymalny rozmiar to 10 MB.`)
				return
			}

			const reader = new FileReader()
			reader.onloadend = () => {
				if (typeof reader.result === 'string') {
					setImagesBase64((prev) => [...prev, reader.result as string])
				}
			}
			reader.readAsDataURL(file)
		})
	}

	const removeImage = (index: number) => {
		setImagesBase64((prev) => prev.filter((_, i) => i !== index))
	}

	const handleAddListing = async () => {
		if (!currentUserId) {
			alert('Błąd autoryzacji. Zaloguj się ponownie.')
			return
		}

		if (!title || !description || !contact || imagesBase64.length === 0) {
			alert('Wypełnij wszystkie wymagane pola oraz dodaj minimum 1 zdjęcie.')
			return
		}

		setIsSubmitting(true)
		try {
			const res = await fetch('http://localhost:5000/api/listings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title,
					description,
					price: price ? parseFloat(price) : null,
					contact,
					authorId: currentUserId,
					images: imagesBase64,
				}),
			})

			if (res.ok) {
				const newListing = await res.json()
				setListings([newListing, ...listings])
				setIsFormOpen(false)

				setTitle('')
				setDescription('')
				setPrice('')
				setContact('')
				setImagesBase64([])
			} else {
				alert('Wystąpił błąd podczas dodawania ogłoszenia.')
			}
		} catch (error) {
			console.error(error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const filteredListings = listings.filter((listing) => {
		if (showMyListings) {
			return listing.authorId === currentUserId
		}
		return listing.status !== 'SOLD'
	})

	return (
		<div className={style.container}>
			<header className={style.header}>
				<div>
					<Heading text={'Giełda sąsiedzka'} />
					<p className={style.subtitle}>
						{showMyListings
							? 'Zarządzaj swoimi ogłoszeniami i zmieniaj ich statusy'
							: 'Przeglądaj oferty zamieszczone przez mieszkańców'}
					</p>
				</div>
				<div className={style.buttons}>
					<Button
						text="Dodaj nową ofertę"
						variant="primary"
						onClick={() => setIsFormOpen(true)}
					/>
					<Button
						text={showMyListings ? 'Wszystkie oferty' : 'Moje oferty'}
						variant="secondary"
						onClick={() => setShowMyListings(!showMyListings)}
					/>
				</div>
			</header>

			{loading ? (
				<div className={style.loader}>Ładowanie ofert...</div>
			) : (
				<div className={style.grid}>
					{filteredListings.map((listing) => (
						<div key={listing.id} className={style.tileWrapper}>
							<ListingCard listing={listing} onUpdate={handleUpdateListing} />
						</div>
					))}
				</div>
			)}

			<FormModal
				title="Dodaj nowe ogłoszenie"
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				onSubmit={handleAddListing}
				isSubmitting={isSubmitting}
				submitText="Opublikuj ogłoszenie"
			>
				<div className={style.formGroup}>
					<p>Tytuł ogłoszenia</p>
					<InputField value={title} placeholder="" icon="letters" onChange={setTitle} />
				</div>

				<div className={style.row}>
					<div className={style.formGroup}>
						<p>Cena (PLN)</p>
						<InputField
							value={price}
							placeholder="Zostaw puste, jeśli darmowe"
							type="number"
							icon="price"
							onChange={setPrice}
						/>
					</div>
					<div className={style.formGroup}>
						<p>Kontakt</p>
						<InputField
							value={contact}
							placeholder="Nr telefonu lub email"
							icon="phone"
							onChange={setContact}
						/>
					</div>
				</div>

				<div className={style.formGroup}>
					<p>Opis ogłoszenia</p>
					<textarea
						className={style.textarea}
						placeholder=""
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				<div className={style.formGroup}>
					<p>Zdjęcia (min. 1 wymagane)</p>
					<div className={style.imageUploadContainer}>
						<input
							type="file"
							multiple
							accept="image/*"
							id="photos"
							className={style.hiddenInput}
							onChange={handleImageChange}
						/>
						<label htmlFor="photos" className={style.fileLabel}>
							<span>Dodaj zdjęcia</span>
						</label>
					</div>
					{imagesBase64.length > 0 && (
						<div className={style.imagePreviewList}>
							{imagesBase64.map((src, idx) => (
								<div key={idx} className={style.imagePreviewItem}>
									<img src={src} alt="Preview" />
									<button
										onClick={() => removeImage(idx)}
										className={style.removeBtn}
									>
										✕
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			</FormModal>
		</div>
	)
}
