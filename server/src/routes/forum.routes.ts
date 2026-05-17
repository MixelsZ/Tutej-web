import { Router, type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req: Request, res: Response) => {
	try {
		const { neighborhoodId } = req.query

		const where = neighborhoodId ? { neighborhoodId: Number(neighborhoodId) } : {}

        const forums = await prisma.forum.findMany({
            where,
            include: {
                _count: {
                    select: { posts: true },
                },
            },
            orderBy: { createdAt: 'asc' },
        })

		res.json(forums)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.get('/:forumId/posts',  async (req: Request, res: Response) => {
	try {
		const { forumId } = req.params
		const { search, sort = 'newest' } = req.query

		const orderBy =
			sort === 'oldest'
				? { createdAt: 'asc' as const }
				: sort === 'popular'
					? { comments: { _count: 'desc' as const } }
					: { createdAt: 'desc' as const }

		const posts = await prisma.post.findMany({
			where: {
				forumId: Number(forumId),
				...(search
					? {
							OR: [
								{ title: { contains: String(search), mode: 'insensitive' } },
								{ content: { contains: String(search), mode: 'insensitive' } },
							],
						}
					: {}),
			},
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true },
				},
				_count: {
					select: { comments: true },
				},
			},
			orderBy,
		})

		res.json(posts)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.get('/posts/:postId',  async (req: Request, res: Response) => {
	try {
		const { postId } = req.params

		const post = await prisma.post.findUnique({
			where: { id: Number(postId) },
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true },
				},
				forum: true,
				comments: {
					include: {
						author: {
							select: { id: true, firstName: true, lastName: true, photo: true },
						},
					},
					orderBy: { createdAt: 'asc' },
				},
			},
		})

		if (!post) {
			return res.status(404).json({ error: 'Post nie znaleziony' })
		}

		res.json(post)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.post('/:forumId/posts',  async (req: Request, res: Response) => {
	try {
		const { forumId } = req.params
		const { title, content, media } = req.body
		const authorId = (req as any).user.id 
		const neighborhoodId = (req as any).user.neighborhoodId

		if (!title || !content) {
			return res.status(400).json({ error: 'Tytuł i treść są wymagane' })
		}

		const post = await prisma.post.create({
			data: {
				title,
				content,
				media: media || null,
				authorId,
				neighborhoodId,
				forumId: Number(forumId),
			},
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true },
				},
				_count: { select: { comments: true } },
			},
		})

		res.status(201).json(post)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.post('/posts/:postId/comments',  async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const { content } = req.body
		const authorId = (req as any).user.id

		if (!content) {
			return res.status(400).json({ error: 'Treść komentarza jest wymagana' })
		}

		const comment = await prisma.comment.create({
			data: {
				content,
				authorId,
				postId: Number(postId),
			},
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true },
				},
			},
		})

		res.status(201).json(comment)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.delete('/posts/:postId', async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const userId = (req as any).user.id
		const userRole = (req as any).user.role

		const post = await prisma.post.findUnique({ where: { id: Number(postId) } })

		if (!post) return res.status(404).json({ error: 'Post nie znaleziony' })
		if (post.authorId !== userId && userRole !== 'ADMIN') {
			return res.status(403).json({ error: 'Brak uprawnień' })
		}

		await prisma.comment.deleteMany({ where: { postId: Number(postId) } })
		await prisma.post.delete({ where: { id: Number(postId) } })

		res.json({ message: 'Post usunięty' })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.delete('/comments/:commentId',  async (req: Request, res: Response) => {
	try {
		const { commentId } = req.params
		const userId = (req as any).user.id
		const userRole = (req as any).user.role

		const comment = await prisma.comment.findUnique({ where: { id: Number(commentId) } })

		if (!comment) return res.status(404).json({ error: 'Komentarz nie znaleziony' })
		if (comment.authorId !== userId && userRole !== 'ADMIN') {
			return res.status(403).json({ error: 'Brak uprawnień' })
		}

		await prisma.comment.delete({ where: { id: Number(commentId) } })

		res.json({ message: 'Komentarz usunięty' })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

export default router