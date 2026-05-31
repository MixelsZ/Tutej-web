import { Router, type Request, type Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from './auth.js'

const router = Router()
const prisma = new PrismaClient()

router.get('/', async (req: Request, res: Response) => {
	try {
		const { neighborhoodId } = req.query

		let where = {}
		if (neighborhoodId) {
			const parsedId = Number(neighborhoodId)
			if (isNaN(parsedId)) {
				return res.status(400).json({ error: 'Nieprawidłowe ID osiedla' })
			}
			where = { neighborhoodId: parsedId }
		}

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

router.get('/:forumId/posts', async (req: Request, res: Response) => {
	try {
		const { forumId } = req.params
		const forumIdNum = Number(forumId)

		if (isNaN(forumIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID forum' })
		}

		const { search, sort = 'newest' } = req.query

		const orderBy =
			sort === 'oldest'
				? { createdAt: 'asc' as const }
				: sort === 'popular'
					? { comments: { _count: 'desc' as const } }
					: { createdAt: 'desc' as const }

		const posts = await prisma.post.findMany({
			where: {
				forumId: forumIdNum,
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

router.get('/posts/:postId', async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const postIdNum = Number(postId)

		if (isNaN(postIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID posta' })
		}

		const post = await prisma.post.findUnique({
			where: { id: postIdNum },
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

router.get('/posts/:postId/comments', async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const postIdNum = Number(postId)

		if (isNaN(postIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID posta' })
		}

		const comments = await prisma.comment.findMany({
			where: { postId: postIdNum },
			include: {
				author: {
					select: { id: true, firstName: true, lastName: true, photo: true },
				},
			},
			orderBy: { createdAt: 'asc' },
		})

		res.json(comments)
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.post('/:forumId/posts', authenticate, async (req: Request, res: Response) => {
	try {
		const { forumId } = req.params
		const forumIdNum = Number(forumId)

		if (isNaN(forumIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID forum' })
		}

		const { title, content, media } = req.body
		const user = (req as any).user

		if (!title || !content) {
			return res.status(400).json({ error: 'Tytuł i treść są wymagane' })
		}

		const post = await prisma.post.create({
			data: {
				title,
				content,
				media: media || null,
				authorId: user.id,
				neighborhoodId: user.neighborhoodId,
				forumId: forumIdNum,
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

router.post('/posts/:postId/comments', authenticate, async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const postIdNum = Number(postId)

		if (isNaN(postIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID posta' })
		}

		const { content } = req.body
		const user = (req as any).user

		if (!content) {
			return res.status(400).json({ error: 'Treść komentarza jest wymagana' })
		}

		const comment = await prisma.comment.create({
			data: {
				content,
				authorId: user.id,
				postId: postIdNum,
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

router.delete('/posts/:postId', authenticate, async (req: Request, res: Response) => {
	try {
		const { postId } = req.params
		const postIdNum = Number(postId)

		if (isNaN(postIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID posta' })
		}

		const user = (req as any).user

		const post = await prisma.post.findUnique({ where: { id: postIdNum } })

		if (!post) return res.status(404).json({ error: 'Post nie znaleziony' })
		if (post.authorId !== user.id && user.role !== 'ADMIN') {
			return res.status(403).json({ error: 'Brak uprawnień' })
		}

		await prisma.comment.deleteMany({ where: { postId: postIdNum } })
		await prisma.post.delete({ where: { id: postIdNum } })

		res.json({ message: 'Post usunięty' })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

router.delete('/comments/:commentId', authenticate, async (req: Request, res: Response) => {
	try {
		const { commentId } = req.params
		const commentIdNum = Number(commentId)

		if (isNaN(commentIdNum)) {
			return res.status(400).json({ error: 'Nieprawidłowe ID komentarza' })
		}

		const user = (req as any).user

		const comment = await prisma.comment.findUnique({ where: { id: commentIdNum } })

		if (!comment) return res.status(404).json({ error: 'Komentarz nie znaleziony' })
		if (comment.authorId !== user.id && user.role !== 'ADMIN') {
			return res.status(403).json({ error: 'Brak uprawnień' })
		}

		await prisma.comment.delete({ where: { id: commentIdNum } })

		res.json({ message: 'Komentarz usunięty' })
	} catch (error) {
		res.status(500).json({ error: 'Błąd serwera' })
	}
})

export default router
