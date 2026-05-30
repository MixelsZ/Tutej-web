import { useState, useEffect } from 'react'
import style from './listingCard.module.scss'

interface ListingImage {
	id: number
	url: string
}

interface ListingData {
	id: number
	title: string
	description: string
	price: any
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

interface ListingCardProps {
	listing: ListingData
	onUpdate?: (updated: ListingData) => void
}

export default function ListingCard({ listing: initialListing, onUpdate }: ListingCardProps) {
	const [isOpen, setIsOpen] = useState(false)
	const [listing, setListing] = useState<ListingData>(initialListing)
	const [isUpdating, setIsUpdating] = useState(false)
	const [zoomedImage, setZoomedImage] = useState<string | null>(null)

	const currentUserId =
		typeof window !== 'undefined' ? Number(localStorage.getItem('userId')) : null
	const isOwner = listing.authorId === currentUserId

	useEffect(() => {
		setListing(initialListing)
	}, [initialListing])

	useEffect(() => {
		document.body.style.overflow = isOpen ? 'hidden' : 'auto'
	}, [isOpen])

	const getPriceString = (priceVal: any) => {
		if (!priceVal || parseFloat(priceVal.toString()) === 0) return 'Darmowe'
		return `${parseFloat(priceVal.toString()).toLocaleString('pl-PL')} PLN`
	}

	const formattedPrice = getPriceString(listing.price)
	const mainImage =
		listing.images && listing.images.length > 0
			? listing.images[0].url
			: '/placeholder-image.jpg'

	const handleStatusChange = async (newStatus: 'AVAILABLE' | 'SOLD' | 'RESERVED') => {
		if (isUpdating) return
		setIsUpdating(true)

		try {
			const res = await fetch(`http://localhost:5000/api/listings/${listing.id}/status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: newStatus }),
			})

			if (res.ok) {
				const updatedData = await res.json()
				setListing(updatedData)
				if (onUpdate) onUpdate(updatedData)
			}
		} catch (err) {
			console.error(err)
		} finally {
			setIsUpdating(false)
		}
	}

	return (
		<>
			<div className={style.card} onClick={() => setIsOpen(true)}>
				<div className={style.imageWrapper}>
					<img src={mainImage} alt={listing.title} className={style.image} />

					{isOwner ? (
						<div className={style.statusControls} onClick={(e) => e.stopPropagation()}>
							<button
								className={`${style.statusBtn} ${listing.status === 'AVAILABLE' ? style.available : style.inactive}`}
								disabled={isUpdating}
								onClick={() => handleStatusChange('AVAILABLE')}
							>
								DOSTĘPNE
							</button>
							<button
								className={`${style.statusBtn} ${listing.status === 'RESERVED' ? style.reserved : style.inactive}`}
								disabled={isUpdating}
								onClick={() => handleStatusChange('RESERVED')}
							>
								ZAREZERWOWANE
							</button>
							<button
								className={`${style.statusBtn} ${listing.status === 'SOLD' ? style.sold : style.inactive}`}
								disabled={isUpdating}
								onClick={() => handleStatusChange('SOLD')}
							>
								SPRZEDANE
							</button>
						</div>
					) : (
						<span
							className={`${style.statusBadge} ${style[listing.status.toLowerCase()]}`}
						>
							{listing.status === 'AVAILABLE' && 'Dostępne'}
							{listing.status === 'RESERVED' && 'Zarezerwowane'}
							{listing.status === 'SOLD' && 'Sprzedane'}
						</span>
					)}

					<div className={style.priceTagContainer}>
						<div className={style.priceTagButton}>{formattedPrice}</div>
					</div>
				</div>
				<div className={style.cardBody}>
					<div className={style.info}>
						<h2 className={style.title}>{listing.title}</h2>
						<div className={style.belowTitle}>
							<span className={style.authorName}>
								{listing.author.firstName} {listing.author.lastName}
							</span>
						</div>
					</div>
				</div>
			</div>

			{isOpen && (
				<div className={style.overlay} onClick={() => setIsOpen(false)}>
					<div className={style.fullPage} onClick={(e) => e.stopPropagation()}>
						<button className={style.back} onClick={() => setIsOpen(false)}>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M15 6L9 12L15 18"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>

						<div className={style.hero}>
							<img src={mainImage} alt="" className={style.heroImage} />
							<div className={style.heroOverlay} />

							<div className={style.heroText}>
								<h1 className={style.heroTitle}>{listing.title}</h1>
								<div className={style.heroStatusContainer}>
									<span
										className={`${style.statusBadge} ${style[listing.status.toLowerCase()]}`}
									>
										{listing.status === 'AVAILABLE' && 'Dostępne'}
										{listing.status === 'RESERVED' && 'Zarezerwowane'}
										{listing.status === 'SOLD' && 'Sprzedane'}
									</span>
								</div>
							</div>
						</div>

						<div className={style.detailsContent}>
							<section className={style.tilesSection}>
								<div className={style.gridBoxes}>
									<div className={style.box}>
										<span className={style.boxLabel}>CENA</span>
										<span className={style.boxValue}>{formattedPrice}</span>
									</div>
									<div className={style.box}>
										<span className={style.boxLabel}>KONTAKT</span>
										<span className={`${style.boxValue} ${style.contactValue}`}>
											{listing.contact}
										</span>
									</div>
								</div>
							</section>

							<section>
								<h3>OPIS</h3>
								<p className={style.description}>{listing.description}</p>
							</section>

							<section>
								<h3>OGŁOSZENIODAWCA</h3>
								<div className={style.hostRow}>
									<img
										src={
											listing.author.photo ||
											`https://ui-avatars.com/api/?name=${listing.author.firstName}+${listing.author.lastName}`
										}
										alt="Author"
										className={style.avatar}
									/>
									<span>
										{listing.author.firstName} {listing.author.lastName}
									</span>
								</div>
							</section>

							<section>
								<h3>GALERIA</h3>
								<div className={style.galleryGrid}>
									{listing.images &&
										listing.images.map((img, index) => (
											<div
												key={index}
												className={style.galleryItem}
												onClick={() => setZoomedImage(img.url)}
											>
												<img
													src={img.url}
													alt={`${listing.title} - ${index + 1}`}
												/>
											</div>
										))}
								</div>
							</section>
						</div>
					</div>
				</div>
			)}

			{zoomedImage && (
				<div className={style.lightbox} onClick={() => setZoomedImage(null)}>
					<div className={style.lightboxContent} onClick={(e) => e.stopPropagation()}>
						<img src={zoomedImage} alt="Zoomed view" />
					</div>
				</div>
			)}
		</>
	)
}
