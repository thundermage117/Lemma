import { useDashboard } from '../hooks/useDashboard'
import { useQuestions } from '../hooks/useQuestions'
import { StatCard } from '../components/dashboard/StatCard'
import { CurrentBookWidget } from '../components/dashboard/CurrentBookWidget'
import { OpenQuestionsWidget } from '../components/dashboard/OpenQuestionsWidget'
import { RecentProblems } from '../components/dashboard/RecentProblems'
import { RecentJournal } from '../components/dashboard/RecentJournal'

export function Dashboard() {
  const { summary, loading, error, refetch } = useDashboard()
  const { questions, createQuestion, updateQuestion } = useQuestions('open')

  const handleResolve = async (id: number) => {
    await updateQuestion(id, { status: 'understood' })
    refetch()
  }

  const handleAddQuestion = async (data: Parameters<typeof createQuestion>[0]) => {
    await createQuestion(data)
    refetch()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">Failed to load dashboard: {error}</p>
          <p className="text-xs text-red-500 mt-1">Make sure the server is running on port 3001.</p>
        </div>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Today's Study</h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Day Streak"
          value={summary.currentStreak}
          sub={`Longest: ${summary.longestStreak}`}
          accent="text-orange-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            </svg>
          }
        />
        <StatCard
          label="Topics"
          value={summary.totalTopics}
          accent="text-blue-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          label="Problems"
          value={summary.totalProblems}
          accent="text-emerald-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <StatCard
          label="Open Questions"
          value={summary.unresolvedQuestions}
          accent="text-rose-500"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">
          <CurrentBookWidget book={summary.activeBook} />
          <RecentProblems problems={summary.recentProblems} />
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <OpenQuestionsWidget
            questions={questions}
            onAdd={handleAddQuestion}
            onResolve={handleResolve}
          />
          <RecentJournal
            entries={summary.recentJournalEntries}
            todayJournal={summary.todayJournal}
          />
        </div>
      </div>
    </div>
  )
}
