import express from 'express'
import cors from 'cors'
import neighborhoodsRouter from './routes/neighborhoods.js'
import authRouter from './routes/auth.js'
import eventsRouter from './routes/events.js'
import listingsRouter from './routes/listings.js'

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use('/api/neighborhoods', neighborhoodsRouter)
app.use('/api/auth', authRouter)
app.use('/api/events', eventsRouter)
app.use('/api/listings', listingsRouter)

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`)
})
