import { Router, type Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, type AuthRequest } from './middleware.js'

const router = Router()
const prisma = new PrismaClient()

// GET /api/notifications — pobierz powiadomienia zalogowanego usera
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const notifications = await (prisma as any).notification.findMany({
			where: { userId: req.user!.id },
			orderBy: { createdAt: 'desc' },
			take: 30,
		})
		res.json(notifications)
	} catch (error) {
		console.error(error)
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// GET /api/notifications/unread-count
router.get('/unread-count', authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const count = await (prisma as any).notification.count({
			where: { userId: req.user!.id, read: false },
		})
		res.json({ count })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

// PUT /api/notifications/:id/read
router.put('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		const notification = await (prisma as any).notification.update({
			where: { id: Number(req.params.id), userId: req.user!.id },
			data: { read: true },
		})
		res.json(notification)
	} catch {
		res.status(404).json({ error: 'Nie znaleziono' })
	}
})

// PUT /api/notifications/read-all
router.put('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
	try {
		await (prisma as any).notification.updateMany({
			where: { userId: req.user!.id, read: false },
			data: { read: true },
		})
		res.json({ message: 'Wszystkie oznaczone jako przeczytane' })
	} catch {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

export default router