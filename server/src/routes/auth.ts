import { Router, type Request, type Response, type NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { SignJWT, jwtVerify } from 'jose'

const router = Router()
const prisma = new PrismaClient()

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || 'tutej_secret_change_in_production',
)
const JWT_EXPIRES_IN = '7d'

async function signToken(payload: object): Promise<string> {
	return await new SignJWT(payload as Record<string, unknown>)
		.setProtectedHeader({ alg: 'HS256' })
		.setExpirationTime(JWT_EXPIRES_IN)
		.sign(JWT_SECRET)
}

async function verifyToken(token: string) {
	const { payload } = await jwtVerify(token, JWT_SECRET)
	return payload as { id: number; email: string; role: string; neighborhoodId: number }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Brak tokena.' })
	}

	try {
		const token = authHeader.split(' ')[1]
		if (!token) return res.status(401).json({ error: 'Brak tokena.' })

		const { payload } = await jwtVerify(token, JWT_SECRET)
		;(req as any).user = payload
		next()
	} catch {
		return res.status(401).json({ error: 'Nieprawidłowy token.' })
	}
}

router.post('/register', async (req: Request, res: Response) => {
	const { firstName, lastName, email, password, neighborhoodId } = req.body
	try {
		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) return res.status(409).json({ message: 'Email już istnieje.' })

		const hashed = await bcrypt.hash(password, 10)
		const user = await prisma.user.create({
			data: {
				firstName,
				lastName,
				email,
				password: hashed,
				neighborhood: { connect: { id: Number(neighborhoodId) } },
			},
		})

		const token = await signToken({
			id: user.id,
			email: user.email,
			role: user.role,
			neighborhoodId: user.neighborhoodId,
		})

		return res.status(201).json({ message: 'Zarejestrowano.', token, userId: user.id })
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Błąd serwera.' })
	}
})

router.post('/login', async (req: Request, res: Response) => {
	const { email, password } = req.body
	try {
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) return res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' })

		const isPasswordValid = await bcrypt.compare(password, user.password)
		if (!isPasswordValid)
			return res.status(401).json({ message: 'Nieprawidłowy email lub hasło.' })

		const token = await signToken({
			id: user.id,
			email: user.email,
			role: user.role,
			neighborhoodId: user.neighborhoodId,
		})

		return res.status(200).json({
			message: 'Zalogowano.',
			token,
			user: {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				photo: user.photo,
				role: user.role,
				neighborhoodId: user.neighborhoodId,
			},
		})
	} catch (error) {
		console.error(error)
		return res.status(500).json({ message: 'Błąd serwera.' })
	}
})

router.get('/me', async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Brak tokena.' })

	try {
		const token = authHeader.split(' ')[1] as string
		const payload = await verifyToken(token)
		const user = await prisma.user.findUnique({
			where: { id: payload.id },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				photo: true,
				role: true,
				neighborhoodId: true,
				neighborhood: { select: { name: true } },
				createdAt: true,
			},
		})
		if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony.' })
		return res.json(user)
	} catch {
		return res.status(401).json({ message: 'Nieprawidłowy token.' })
	}
})

router.put('/me', async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Brak tokena.' })

	try {
		const token = authHeader.split(' ')[1] as string
		const payload = await verifyToken(token)
		const { firstName, lastName, photo } = req.body

		const user = await prisma.user.update({
			where: { id: payload.id },
			data: { firstName, lastName, photo },
			select: {
				id: true,
				firstName: true,
				lastName: true,
				email: true,
				photo: true,
				role: true,
				neighborhoodId: true,
			},
		})
		return res.json(user)
	} catch {
		return res.status(401).json({ message: 'Nieprawidłowy token.' })
	}
})

router.put('/me/password', async (req: Request, res: Response) => {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Brak tokena.' })

	try {
		const token = authHeader.split(' ')[1] as string
		const payload = await verifyToken(token)
		const { currentPassword, newPassword } = req.body

		const user = await prisma.user.findUnique({ where: { id: payload.id } })
		if (!user) return res.status(404).json({ message: 'Użytkownik nie znaleziony.' })

		const isValid = await bcrypt.compare(currentPassword, user.password)
		if (!isValid) return res.status(400).json({ message: 'Nieprawidłowe obecne hasło.' })

		const hashed = await bcrypt.hash(newPassword, 10)
		await prisma.user.update({ where: { id: payload.id }, data: { password: hashed } })

		return res.json({ message: 'Hasło zmienione.' })
	} catch {
		return res.status(401).json({ message: 'Nieprawidłowy token.' })
	}
})

export default router
