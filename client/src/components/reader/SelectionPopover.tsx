import { Button } from '../ui/Button'
import type { EnrichType } from '../../api/ai'

interface SelectionPopoverProps {
  position: { top: number; left: number } | null
  loading: boolean
  onCapture: (type: EnrichType) => void
}

export function SelectionPopover({ position, loading, onCapture }: SelectionPopoverProps) {
  if (!position) return null

  return (
    <div
      id="selection-popover"
      className="fixed z-[9999] bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 flex items-center gap-1"
      style={{
        top: position.top - 48,
        left: position.left,
        transform: 'translateX(-50%)',
      }}
    >
      {loading ? (
        <div className="flex items-center gap-2 px-2 py-0.5 text-sm text-slate-500">
          <svg className="animate-spin h-4 w-4 text-indigo-600" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Generating…
        </div>
      ) : (
        <>
          <Button size="sm" variant="ghost" onClick={() => onCapture('topic')}>
            Topic Note
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCapture('problem')}>
            Problem
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onCapture('question')}>
            Question
          </Button>
        </>
      )}
    </div>
  )
}
