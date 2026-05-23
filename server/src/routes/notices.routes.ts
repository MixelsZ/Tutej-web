import { Router, type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

// GET /api/notices?neighborhoodId=X
router.get('/', async (req: Request, res: Response) => {
	try {
		const { neighborhoodId } = req.query
		const where = neighborhoodId ? { neighborhoodId: Number(neighborhoodId) } : {}

		const notices = await prisma.announcement.findMany({
			where,
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true, role: true },
				},
			},
			orderBy: { createdAt: 'desc' },
		})

		res.json(notices)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// GET /api/notices/:noticeId
router.get('/:noticeId', async (req: Request, res: Response) => {
	try {
		const { noticeId } = req.params

		const notice = await prisma.announcement.findUnique({
			where: { id: Number(noticeId) },
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true, role: true },
				},
			},
		})

		if (!notice) return res.status(404).json({ error: 'Ogłoszenie nie znalezione' })

		res.json(notice)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// POST /api/notices
router.post('/', async (req: Request, res: Response) => {
	try {
		const { title, content, media, authorId, neighborhoodId } = req.body

		if (!title || !content) {
			return res.status(400).json({ error: 'Tytuł i treść są wymagane' })
		}

		if (!authorId || !neighborhoodId) {
			return res.status(400).json({ error: 'Brak danych użytkownika' })
		}

		const notice = await prisma.announcement.create({
			data: {
				title,
				content,
				media: media || null,
				authorId: Number(authorId),
				neighborhoodId: Number(neighborhoodId),
			},
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true, role: true },
				},
			},
		})

		res.status(201).json(notice)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// DELETE /api/notices/:noticeId
router.delete('/:noticeId', async (req: Request, res: Response) => {
	try {
		const { noticeId } = req.params
		const { userId, userRole } = req.body

		const notice = await prisma.announcement.findUnique({ where: { id: Number(noticeId) } })

		if (!notice) return res.status(404).json({ error: 'Ogłoszenie nie znalezione' })

		if (userId && userRole !== 'ADMIN' && notice.authorId !== Number(userId)) {
			return res.status(403).json({ error: 'Brak uprawnień' })
		}

		await prisma.announcement.delete({ where: { id: Number(noticeId) } })

		res.json({ message: 'Ogłoszenie usunięte' })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

export default router