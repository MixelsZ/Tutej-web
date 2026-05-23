import express from 'express'
import cors from 'cors'
import neighborhoodsRouter from './routes/neighborhoods.js'
import authRouter from './routes/auth.js'
import forumRoutes from './routes/forum.routes.js'
import noticesRouter from './routes/notices.routes.js'


const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

app.use('/api/neighborhoods', neighborhoodsRouter)
app.use('/api/auth', authRouter)
app.use('/api/forums', forumRoutes)
app.use('/api/notices', noticesRouter)

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
