import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Viewer, Worker } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import * as booksApi from '../api/books'
import type { Book } from '../types'

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()

export function Reader() {
  const { bookId } = useParams<{ bookId: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    booksApi.getById(Number(bookId))
      .then((b) => { setBook(b); setLoading(false) })
      .catch((e) => { setError((e as Error).message); setLoading(false) })
  }, [bookId])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const handlePageChange = (e: { currentPage: number }) => {
    const page = e.currentPage + 1 // viewer is 0-indexed, DB is 1-indexed
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      booksApi.update(Number(bookId), { currentPage: page }).catch(() => {})
    }, 1000)
  }

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            ZoomOut, Zoom, ZoomIn,
            GoToPreviousPage, CurrentPageInput, GoToNextPage, NumberOfPages,
            Print, Download, EnterFullScreen, ShowSearchPopover,
          } = slots
          return (
            <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '4px', padding: '0 6px' }}>
              <Link
                to="/library"
                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 6px', borderRadius: '4px', whiteSpace: 'nowrap' }}
              >
                ← Library
              </Link>
              <span style={{ color: '#475569' }}>|</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>
                {book?.title ?? ''}
              </span>
              <div style={{ flex: 1 }} />
              <ShowSearchPopover />
              <ZoomOut /><Zoom /><ZoomIn />
              <GoToPreviousPage />
              <CurrentPageInput />
              <span style={{ color: '#64748b', fontSize: '13px', padding: '0 2px' }}>/</span>
              <NumberOfPages />
              <GoToNextPage />
              <Print /><Download /><EnterFullScreen />
            </div>
          )
        }}
      </Toolbar>
    ),
  })

  if (loading) return <div style={{ padding: '32px', color: '#94a3b8', fontSize: '14px' }}>Loading...</div>
  if (error || !book) return (
    <div style={{ padding: '32px', color: '#ef4444', fontSize: '14px' }}>
      Error: {error ?? 'Book not found'}{' '}
      <Link to="/library" style={{ color: '#818cf8' }}>Back to Library</Link>
    </div>
  )
  if (!book.pdfFilename) return (
    <div style={{ padding: '32px', color: '#64748b', fontSize: '14px' }}>
      No PDF for this book.{' '}
      <Link to="/library" style={{ color: '#818cf8' }}>Back to Library</Link>
    </div>
  )

  const savedZoom = localStorage.getItem(`zoom-${bookId}`)
  const initialScale = savedZoom ? parseFloat(savedZoom) : undefined

  return (
    <div style={{ height: '100vh' }}>
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={`/books/${book.pdfFilename}`}
          initialPage={book.currentPage > 0 ? book.currentPage - 1 : 0}
          defaultScale={initialScale}
          onPageChange={handlePageChange}
          onZoom={(e) => localStorage.setItem(`zoom-${bookId}`, String(e.scale))}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  )
}
