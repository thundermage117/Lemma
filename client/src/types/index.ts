// ── Enums ────────────────────────────────────────────────────────────────────

export type BookStatus = 'not_started' | 'reading' | 'paused' | 'finished'
export type TopicStatus = 'learning' | 'revised' | 'strong'
export type SourceType = 'textbook' | 'self' | 'other'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type ProblemStatus = 'not_started' | 'attempted' | 'solved' | 'solved_with_help' | 'revisit'
export type QuestionStatus = 'open' | 'understood' | 'revisit'

// ── Models ───────────────────────────────────────────────────────────────────

export interface Book {
  id: number
  title: string
  author: string
  subject: string
  description?: string | null
  pdfFilename?: string | null
  totalPages?: number | null
  currentPage: number
  currentChapter?: string | null
  status: BookStatus
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: number
  title: string
  subject: string
  summary?: string | null
  notes?: string | null
  examples?: string | null
  confidenceLevel: number
  linkedBookId?: number | null
  pageStart?: number | null
  pageEnd?: number | null
  status: TopicStatus
  createdAt: string
  updatedAt: string
  book?: { id: number; title: string } | null
  problems?: Problem[]
}

export interface Problem {
  id: number
  title: string
  sourceType: SourceType
  linkedBookId?: number | null
  topicId?: number | null
  chapterOrSection?: string | null
  pageNumber?: number | null
  problemStatement: string
  difficulty: Difficulty
  tags: string[]
  status: ProblemStatus
  attemptNotes?: string | null
  finalSolution?: string | null
  mistakesMade?: string | null
  revisitDate?: string | null
  createdAt: string
  updatedAt: string
  book?: { id: number; title: string } | null
  topic?: { id: number; title: string } | null
}

export interface JournalEntry {
  id: number
  date: string
  whatIStudied: string
  whatConfusedMe?: string | null
  oneThingIUnderstood?: string | null
  pagesRead?: number | null
  linkedBookId?: number | null
  linkedTopicId?: number | null
  durationMinutes?: number | null
  createdAt: string
  updatedAt: string
  book?: { id: number; title: string } | null
  topic?: { id: number; title: string } | null
}

export interface Question {
  id: number
  text: string
  linkedBookId?: number | null
  linkedTopicId?: number | null
  pageNumber?: number | null
  status: QuestionStatus
  createdAt: string
  updatedAt: string
  book?: { id: number; title: string } | null
  topic?: { id: number; title: string } | null
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardSummary {
  activeBook: Book | null
  currentStreak: number
  longestStreak: number
  totalTopics: number
  totalProblems: number
  unresolvedQuestions: number
  recentJournalEntries: JournalEntry[]
  recentProblems: Problem[]
  todayJournal: JournalEntry | null
}

// ── Input types ───────────────────────────────────────────────────────────────

export type CreateBookInput = Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'book' | 'problems'>
export type UpdateBookInput = Partial<CreateBookInput>

export type CreateTopicInput = Omit<Topic, 'id' | 'createdAt' | 'updatedAt' | 'book' | 'problems'>
export type UpdateTopicInput = Partial<CreateTopicInput>

export type CreateProblemInput = Omit<Problem, 'id' | 'createdAt' | 'updatedAt' | 'book' | 'topic'>
export type UpdateProblemInput = Partial<CreateProblemInput>

export type CreateJournalInput = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'book' | 'topic'>
export type UpdateJournalInput = Partial<CreateJournalInput>

export type CreateQuestionInput = Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'book' | 'topic'>
export type UpdateQuestionInput = Partial<CreateQuestionInput>
