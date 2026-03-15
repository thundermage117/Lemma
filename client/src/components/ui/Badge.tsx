interface BadgeProps {
  value: string
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  // Book status
  not_started: 'bg-slate-100 text-slate-600',
  reading: 'bg-indigo-100 text-indigo-700',
  paused: 'bg-amber-100 text-amber-700',
  finished: 'bg-emerald-100 text-emerald-700',
  // Topic status
  learning: 'bg-blue-100 text-blue-700',
  revised: 'bg-violet-100 text-violet-700',
  strong: 'bg-emerald-100 text-emerald-700',
  // Difficulty
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
  // Problem status
  attempted: 'bg-blue-100 text-blue-700',
  solved: 'bg-emerald-100 text-emerald-700',
  solved_with_help: 'bg-teal-100 text-teal-700',
  revisit: 'bg-orange-100 text-orange-700',
  // Question status
  open: 'bg-rose-100 text-rose-700',
  understood: 'bg-green-100 text-green-700',
  // Source type
  textbook: 'bg-slate-100 text-slate-600',
  self: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  not_started: 'Not Started',
  reading: 'Reading',
  paused: 'Paused',
  finished: 'Finished',
  learning: 'Learning',
  revised: 'Revised',
  strong: 'Strong',
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  attempted: 'Attempted',
  solved: 'Solved',
  solved_with_help: 'Solved w/ Help',
  revisit: 'Revisit',
  open: 'Open',
  understood: 'Understood',
  textbook: 'Textbook',
  self: 'Self',
  other: 'Other',
}

export function Badge({ value, className = '' }: BadgeProps) {
  const color = STATUS_COLORS[value] ?? 'bg-slate-100 text-slate-600'
  const label = STATUS_LABELS[value] ?? value
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color} ${className}`}>
      {label}
    </span>
  )
}
