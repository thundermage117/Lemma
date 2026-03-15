import type { Problem } from '../../types'
import { Badge } from '../ui/Badge'
import { Link } from 'react-router-dom'

interface RecentProblemsProps {
  problems: Problem[]
}

export function RecentProblems({ problems }: RecentProblemsProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Problems</p>
        <Link to="/problems" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
          View all
        </Link>
      </div>
      {problems.length === 0 ? (
        <p className="text-sm text-slate-400">No problems logged yet.</p>
      ) : (
        <ul className="space-y-3">
          {problems.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                {p.topic && <p className="text-xs text-slate-400 mt-0.5">{p.topic.title}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Badge value={p.difficulty} />
                <Badge value={p.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
