export interface StreakResult {
  current: number
  longest: number
}

export function computeStreaks(dates: Date[]): StreakResult {
  if (dates.length === 0) return { current: 0, longest: 0 }

  // Deduplicate and sort descending as YYYY-MM-DD strings
  const unique = [
    ...new Set(dates.map((d) => d.toISOString().slice(0, 10))),
  ].sort().reverse()

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  // Current streak — must start from today or yesterday
  let current = 0
  if (unique[0] === today || unique[0] === yesterday) {
    let expected = unique[0]
    for (const d of unique) {
      if (d === expected) {
        current++
        const prev = new Date(expected + 'T12:00:00.000Z')
        prev.setUTCDate(prev.getUTCDate() - 1)
        expected = prev.toISOString().slice(0, 10)
      } else {
        break
      }
    }
  }

  // Longest streak — walk all dates
  let longest = current
  let run = 1
  for (let i = 0; i < unique.length - 1; i++) {
    const curr = new Date(unique[i] + 'T12:00:00.000Z')
    const next = new Date(unique[i + 1] + 'T12:00:00.000Z')
    const diffDays = Math.round((curr.getTime() - next.getTime()) / 86400000)
    if (diffDays === 1) {
      run++
      if (run > longest) longest = run
    } else {
      run = 1
    }
  }

  return { current, longest }
}
