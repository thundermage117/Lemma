import type { Book } from '../../types'
import { Badge } from '../ui/Badge'

interface CurrentBookWidgetProps {
  book: Book | null
}

export function CurrentBookWidget({ book }: CurrentBookWidgetProps) {
  if (!book) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Book</p>
        <p className="text-sm text-slate-500">No active book. Go to Library to set one.</p>
      </div>
    )
  }

  const progress =
    book.totalPages && book.totalPages > 0
      ? Math.round((book.currentPage / book.totalPages) * 100)
      : null

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Current Book</p>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate-900 truncate">{book.title}</p>
          <p className="text-sm text-slate-500">{book.author}</p>
        </div>
        <Badge value={book.status} />
      </div>

      {book.currentChapter && (
        <p className="text-sm text-slate-600 mt-3">
          <span className="text-slate-400">Reading: </span>{book.currentChapter}
        </p>
      )}

      <div className="mt-3">
        {progress !== null ? (
          <>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Page {book.currentPage}</span>
              <span>{progress}% · {book.totalPages} pages</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <p className="text-xs text-slate-400">Page {book.currentPage}</p>
        )}
      </div>
    </div>
  )
}
