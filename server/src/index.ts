import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'

import booksRouter from './routes/books'
import topicsRouter from './routes/topics'
import problemsRouter from './routes/problems'
import journalRouter from './routes/journal'
import questionsRouter from './routes/questions'
import dashboardRouter from './routes/dashboard'

const app = express()
const PORT = process.env.PORT ?? 3001
const clientDistPath = path.join(__dirname, '../../client/dist')

app.use(cors())
app.use(express.json())
app.use('/books', express.static(path.join(__dirname, '../../books')))

app.use('/api/books', booksRouter)
app.use('/api/topics', topicsRouter)
app.use('/api/problems', problemsRouter)
app.use('/api/journal', journalRouter)
app.use('/api/questions', questionsRouter)
app.use('/api/dashboard', dashboardRouter)

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath))

  // SPA fallback for client-side routes in production builds.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/books')) {
      next()
      return
    }

    res.sendFile(path.join(clientDistPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Lemma server running on http://localhost:${PORT}`)
})

export default app
