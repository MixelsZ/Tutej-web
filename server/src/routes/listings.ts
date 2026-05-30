import { Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req, res) => {
	try {
		const listings = await prisma.listing.findMany({
			include: {
				author: {
					select: {
						firstName: true,
						lastName: true,
						photo: true,
					},
				},
				images: true,
			},
			orderBy: {
				createdAt: 'desc',
			},
		})
		res.json(listings)
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/', async (req, res) => {
	try {
		const { title, description, price, contact, authorId, images } = req.body

		if (!title || !description || !contact || !authorId || !images || images.length === 0) {
			return res.status(400).json({ error: 'Brak wymaganych pól lub zdjęć' })
		}

		const user = await prisma.user.findUnique({
			where: { id: parseInt(authorId) },
		})

		if (!user) {
			return res.status(404).json({ error: 'Użytkownik nie znaleziony' })
		}

		const newListing = await prisma.listing.create({
			data: {
				title,
				description,
				price: price ? parseFloat(price) : null,
				contact,
				authorId: parseInt(authorId),
				neighborhoodId: user.neighborhoodId,
				images: {
					create: images.map((base64String: string) => ({
						url: base64String,
					})),
				},
			},
			include: {
				author: {
					select: {
						firstName: true,
						lastName: true,
						photo: true,
					},
				},
				images: true,
			},
		})

		res.status(201).json(newListing)
	} catch (error) {
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.patch('/:id/status', async (req, res) => {
	try {
		const id = parseInt(req.params.id)
		const { status } = req.body

		if (isNaN(id) || !['AVAILABLE', 'RESERVED', 'SOLD'].includes(status)) {
			return res.status(400).json({ error: 'Invalid data' })
		}

		const updatedListing = await prisma.listing.update({
			where: { id },
			data: { status },
			include: {
				author: {
					select: {
						firstName: true,
						lastName: true,
						photo: true,
					},
				},
				images: true,
			},
		})

		return res.json(updatedListing)
	} catch (error) {
		return res.status(500).json({ error: 'Internal server error' })
	}
})

export default router
