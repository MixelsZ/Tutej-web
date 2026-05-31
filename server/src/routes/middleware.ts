import { type Request, type Response, type NextFunction } from 'express'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || 'tutej_secret_change_in_production',
)

export interface AuthRequest extends Request {
	user?: {
		id: number
		email: string
		role: string
		neighborhoodId: number
	}
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization
	if (!authHeader?.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Brak autoryzacji.' })
	}

	try {
		const { payload } = await jwtVerify(authHeader.split(' ')[1], JWT_SECRET)
		req.user = payload as AuthRequest['user']
		next()
	} catch {
		return res.status(401).json({ message: 'Nieprawidłowy lub wygasły token.' })
	}
}
