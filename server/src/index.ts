import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import booksRouter from './routes/books'
import topicsRouter from './routes/topics'
import problemsRouter from './routes/problems'
import journalRouter from './routes/journal'
import questionsRouter from './routes/questions'
import dashboardRouter from './routes/dashboard'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors())
app.use(express.json())

app.use('/api/books', booksRouter)
app.use('/api/topics', topicsRouter)
app.use('/api/problems', problemsRouter)
app.use('/api/journal', journalRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/dashboard', dashboardRouter)

app.listen(PORT, () => {
  console.log(`Lemma server running on http://localhost:${PORT}`)
})

export default app
