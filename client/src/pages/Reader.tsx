import { useState, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import * as booksApi from '../api/books'
import type { Book } from '../types'

const workerUrl = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString()
const pdfBaseUrl = import.meta.env.VITE_PDF_BASE_URL?.trim() ?? ''

const isHttpUrl = (value: string) => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const encodePathSegments = (value: string) =>
  value
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

const resolvePdfUrl = (pdfRef: string) => {
  const trimmed = pdfRef.trim()
  if (!trimmed) return null

  if (isHttpUrl(trimmed)) return trimmed

  const normalized = trimmed.replace(/^\/+/, '')
  if (pdfBaseUrl) {
    return `${pdfBaseUrl.replace(/\/+$/, '')}/${encodePathSegments(normalized)}`
  }

  return `/books/${encodePathSegments(normalized)}`
}

const zoomLevels = [50, 75, 100, 125, 150, 175, 200]

function ToolbarIconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className="reader-icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

function ToolbarIcon({ children }: { children: ReactNode }) {
  return (
    <svg className="reader-toolbar-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  )
}

function SearchIcon() {
  return (
    <ToolbarIcon>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-4.2-4.2" />
    </ToolbarIcon>
  )
}

function ZoomOutIcon() {
  return (
    <ToolbarIcon>
      <circle cx="11" cy="11" r="7" />
      <path d="M8 11h6" />
      <path d="M20 20l-4.2-4.2" />
    </ToolbarIcon>
  )
}

function ZoomInIcon() {
  return (
    <ToolbarIcon>
      <circle cx="11" cy="11" r="7" />
      <path d="M8 11h6" />
      <path d="M11 8v6" />
      <path d="M20 20l-4.2-4.2" />
    </ToolbarIcon>
  )
}

function DownloadIcon() {
  return (
    <ToolbarIcon>
      <path d="M12 4v10" />
      <path d="M8 10l4 4 4-4" />
      <path d="M5 19h14" />
    </ToolbarIcon>
  )
}

function PrintIcon() {
  return (
    <ToolbarIcon>
      <rect x="7.5" y="4" width="9" height="4.5" rx="0.8" />
      <rect x="5" y="9" width="14" height="6.5" rx="1.4" />
      <path d="M7.5 13.5h9" />
      <path d="M7.5 16v4h9v-4" />
    </ToolbarIcon>
  )
}

function FullscreenIcon() {
  return (
    <ToolbarIcon>
      <path d="M8 4H4v4" />
      <path d="M16 4h4v4" />
      <path d="M20 16v4h-4" />
      <path d="M4 16v4h4" />
    </ToolbarIcon>
  )
}

function FitWidthIcon() {
  return (
    <ToolbarIcon>
      <rect x="6.2" y="7.3" width="11.6" height="9.4" rx="1.1" />
      <path d="M3.6 9.1h2.2" />
      <path d="M18.2 9.1h2.2" />
      <path d="M3.6 14.9h2.2" />
      <path d="M18.2 14.9h2.2" />
    </ToolbarIcon>
  )
}

function FitPageIcon() {
  return (
    <ToolbarIcon>
      <rect x="7.2" y="4.4" width="9.6" height="15.2" rx="1.1" />
      <path d="M9.1 6.3h5.8" />
      <path d="M9.1 17.7h5.8" />
      <path d="M12 6.3v-2" />
      <path d="M12 17.7v2" />
    </ToolbarIcon>
  )
}

function useIsDark() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  )
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])
  return isDark
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches : false
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    setIsMobile(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', onChange)
      return () => mediaQuery.removeEventListener('change', onChange)
    }

    mediaQuery.addListener(onChange)
    return () => mediaQuery.removeListener(onChange)
  }, [breakpoint])

  return isMobile
}

export function Reader() {
  const { bookId } = useParams<{ bookId: string }>()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fitMode, setFitMode] = useState<'page' | 'width' | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isDark = useIsDark()
  const isMobile = useIsMobile()

  useEffect(() => {
    booksApi.getById(Number(bookId))
      .then((b) => { setBook(b); setLoading(false) })
      .catch((e) => { setError((e as Error).message); setLoading(false) })
  }, [bookId])

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
  }, [])

  const handlePageChange = (e: { currentPage: number }) => {
    const page = e.currentPage + 1
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      booksApi.update(Number(bookId), { currentPage: page }).catch(() => {})
    }, 1000)
  }

  const renderFitOptions = (onZoom: (newScale: number | SpecialZoomLevel) => void) => (
    <button
      type="button"
      className={`reader-fit-button ${fitMode ? 'reader-fit-button--active' : ''}`}
      aria-label={fitMode === 'width' ? 'Switch to fit page' : 'Switch to fit width'}
      title={fitMode === 'width' ? 'Fit width (click for fit page)' : 'Fit page (click for fit width)'}
      onClick={() => {
        const nextFitMode = fitMode === 'width' ? 'page' : 'width'
        setFitMode(nextFitMode)
        onZoom(nextFitMode === 'width' ? SpecialZoomLevel.PageWidth : SpecialZoomLevel.PageFit)
      }}
    >
      {fitMode === 'width' ? <FitWidthIcon /> : <FitPageIcon />}
    </button>
  )

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => (isMobile ? [] : defaultTabs),
    renderToolbar: (Toolbar) => (
      <Toolbar>
        {(slots) => {
          const {
            ZoomOut, Zoom, ZoomIn,
            CurrentPageInput, NumberOfPages,
            Print, Download, EnterFullScreen, ShowSearchPopover,
          } = slots

          if (isMobile) {
            return (
              <div className="reader-pdf-toolbar reader-pdf-toolbar--mobile">
                <Link to="/library" className="reader-pdf-toolbar__back" aria-label="Back to library">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                  </svg>
                </Link>

                <CurrentPageInput />
                <span className="reader-pdf-toolbar__page-sep">/</span>
                <span className="reader-pdf-toolbar__page-total">
                  <NumberOfPages />
                </span>
                <div className="reader-pdf-toolbar__sep" />
                <ZoomOut>
                  {({ onClick }) => (
                    <ToolbarIconButton
                      label="Zoom out"
                      onClick={() => {
                        setFitMode(null)
                        onClick()
                      }}
                    >
                      <ZoomOutIcon />
                    </ToolbarIconButton>
                  )}
                </ZoomOut>
                <Zoom>
                  {({ scale, onZoom }) => {
                    const currentZoom = Math.round(scale * 100)
                    const levels = zoomLevels.includes(currentZoom)
                      ? zoomLevels
                      : [...zoomLevels, currentZoom].sort((a, b) => a - b)
                    return (
                      <span className="reader-zoom-select-wrap">
                        <select
                          className="reader-zoom-select"
                          aria-label="Zoom level"
                          value={currentZoom}
                          onChange={(event) => {
                            setFitMode(null)
                            onZoom(Number(event.target.value) / 100)
                          }}
                        >
                          {levels.map((level) => (
                            <option key={level} value={level}>
                              {level}%
                            </option>
                          ))}
                        </select>
                      </span>
                    )
                  }}
                </Zoom>
                <ZoomIn>
                  {({ onClick }) => (
                    <ToolbarIconButton
                      label="Zoom in"
                      onClick={() => {
                        setFitMode(null)
                        onClick()
                      }}
                    >
                      <ZoomInIcon />
                    </ToolbarIconButton>
                  )}
                </ZoomIn>
                <Zoom>{({ onZoom }) => renderFitOptions(onZoom)}</Zoom>
                <ShowSearchPopover>
                  {({ onClick }) => (
                    <ToolbarIconButton label="Search" onClick={onClick}>
                      <SearchIcon />
                    </ToolbarIconButton>
                  )}
                </ShowSearchPopover>
                <Download>
                  {({ onClick }) => (
                    <ToolbarIconButton label="Download" onClick={onClick}>
                      <DownloadIcon />
                    </ToolbarIconButton>
                  )}
                </Download>
              </div>
            )
          }

          return (
            <div className="reader-pdf-toolbar">
              <div className="reader-pdf-toolbar__left">
                <Link to="/library" className="reader-pdf-toolbar__back">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                  </svg>
                  Library
                </Link>
                <div className="reader-pdf-toolbar__sep" />
                <span className="reader-pdf-toolbar__title" title={book?.title ?? ''}>
                  {book?.title ?? ''}
                </span>
              </div>

              <div className="reader-pdf-toolbar__center">
                <div className="reader-pdf-toolbar__group">
                  <ShowSearchPopover>
                    {({ onClick }) => (
                      <ToolbarIconButton label="Search" onClick={onClick}>
                        <SearchIcon />
                      </ToolbarIconButton>
                    )}
                  </ShowSearchPopover>
                </div>
                <div className="reader-pdf-toolbar__group">
                  <ZoomOut>
                    {({ onClick }) => (
                      <ToolbarIconButton
                        label="Zoom out"
                        onClick={() => {
                          setFitMode(null)
                          onClick()
                        }}
                      >
                        <ZoomOutIcon />
                      </ToolbarIconButton>
                    )}
                  </ZoomOut>
                  <Zoom>
                    {({ scale, onZoom }) => {
                      const currentZoom = Math.round(scale * 100)
                      const levels = zoomLevels.includes(currentZoom)
                        ? zoomLevels
                        : [...zoomLevels, currentZoom].sort((a, b) => a - b)
                      return (
                        <span className="reader-zoom-select-wrap">
                          <select
                            className="reader-zoom-select"
                            aria-label="Zoom level"
                            value={currentZoom}
                            onChange={(event) => {
                              setFitMode(null)
                              onZoom(Number(event.target.value) / 100)
                            }}
                          >
                            {levels.map((level) => (
                              <option key={level} value={level}>
                                {level}%
                              </option>
                            ))}
                          </select>
                        </span>
                      )
                    }}
                  </Zoom>
                  <ZoomIn>
                    {({ onClick }) => (
                      <ToolbarIconButton
                        label="Zoom in"
                        onClick={() => {
                          setFitMode(null)
                          onClick()
                        }}
                      >
                        <ZoomInIcon />
                      </ToolbarIconButton>
                    )}
                  </ZoomIn>
                  <Zoom>{({ onZoom }) => renderFitOptions(onZoom)}</Zoom>
                </div>
                <div className="reader-pdf-toolbar__group reader-pdf-toolbar__group--page">
                  <CurrentPageInput />
                  <span className="reader-pdf-toolbar__page-sep">/</span>
                  <span className="reader-pdf-toolbar__page-total">
                    <NumberOfPages />
                  </span>
                </div>
              </div>

              <div className="reader-pdf-toolbar__right">
                <div className="reader-pdf-toolbar__group">
                  {!isMobile && (
                    <Print>
                      {({ onClick }) => (
                        <ToolbarIconButton label="Print" onClick={onClick}>
                          <PrintIcon />
                        </ToolbarIconButton>
                      )}
                    </Print>
                  )}
                  <Download>
                    {({ onClick }) => (
                      <ToolbarIconButton label="Download" onClick={onClick}>
                        <DownloadIcon />
                      </ToolbarIconButton>
                    )}
                  </Download>
                  {!isMobile && (
                    <EnterFullScreen>
                      {({ onClick }) => (
                        <ToolbarIconButton label="Fullscreen" onClick={onClick}>
                          <FullscreenIcon />
                        </ToolbarIconButton>
                      )}
                    </EnterFullScreen>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      </Toolbar>
    ),
  })

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`reader-status-screen ${isDark ? 'dark' : ''}`}>
        <div className="reader-status-screen__content">
          <div className="reader-spinner" />
          <p className="reader-status-screen__text">Opening book…</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !book) {
    return (
      <div className={`reader-status-screen ${isDark ? 'dark' : ''}`}>
        <div className="reader-status-card reader-status-card--error">
          <svg className="reader-status-card__icon reader-status-card__icon--error" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p className="reader-status-card__title">
            {error ?? 'Book not found'}
          </p>
          <Link to="/library" className="reader-status-card__link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  // ── No PDF state ───────────────────────────────────────────────────────────
  if (!book.pdfFilename) {
    return (
      <div className={`reader-status-screen ${isDark ? 'dark' : ''}`}>
        <div className="reader-status-card reader-status-card--info">
          <svg className="reader-status-card__icon reader-status-card__icon--info" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="reader-status-card__title">No PDF for this book</p>
          <p className="reader-status-card__subtitle">
            Add a PDF filename or URL from the Library to start reading.
          </p>
          <Link to="/library" className="reader-status-card__link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  // ── PDF Viewer ─────────────────────────────────────────────────────────────
  const zoomStorageKey = `zoom-${bookId}-${isMobile ? 'mobile' : 'desktop'}`
  const savedZoom = localStorage.getItem(zoomStorageKey)
  const parsedZoom = savedZoom ? Number.parseFloat(savedZoom) : Number.NaN
  const initialScale = Number.isFinite(parsedZoom)
    ? parsedZoom
    : isMobile
      ? SpecialZoomLevel.PageWidth
      : undefined
  const fileUrl = resolvePdfUrl(book.pdfFilename)

  if (!fileUrl) {
    return (
      <div className={`reader-status-screen ${isDark ? 'dark' : ''}`}>
        <div className="reader-status-card reader-status-card--error">
          <p className="reader-status-card__title">Invalid PDF reference</p>
          <p className="reader-status-card__subtitle">
            Set a valid PDF filename or full URL in Library.
          </p>
          <Link to="/library" className="reader-status-card__link">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`reader-root ${isDark ? 'dark' : ''} ${isMobile ? 'reader-root--mobile' : ''}`}>
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={fileUrl}
          initialPage={book.currentPage > 0 ? book.currentPage - 1 : 0}
          defaultScale={initialScale}
          onPageChange={handlePageChange}
          onZoom={(e) => localStorage.setItem(zoomStorageKey, String(e.scale))}
          plugins={[defaultLayoutPluginInstance]}
        />
      </Worker>
    </div>
  )
}
