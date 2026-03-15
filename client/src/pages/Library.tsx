import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useBooks } from '../hooks/useBooks'
import { BookForm } from '../components/forms/BookForm'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { Book, CreateBookInput, UpdateBookInput } from '../types'

export function Library() {
  const { books, loading, error, createBook, updateBook, deleteBook } = useBooks()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Book | null>(null)

  const handleCreate = async (data: CreateBookInput) => {
    await createBook(data)
    setIsOpen(false)
  }

  const handleUpdate = async (data: UpdateBookInput) => {
    if (!editing) return
    await updateBook(editing.id, data)
    setEditing(null)
  }

  const handleDelete = async (book: Book) => {
    if (!confirm(`Delete "${book.title}"? This cannot be undone.`)) return
    await deleteBook(book.id)
  }

  const handleSetActive = async (book: Book) => {
    await updateBook(book.id, { isActive: true })
  }

  if (loading) return <div className="p-8 text-slate-400 text-sm">Loading...</div>
  if (error) return <div className="p-8 text-red-500 text-sm">Error: {error}</div>

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Library</h1>
          <p className="text-slate-500 text-sm mt-1">{books.length} book{books.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>+ Add Book</Button>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-lg font-medium">No books yet</p>
          <p className="text-sm mt-1">Add a textbook to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book) => {
            const progress =
              book.totalPages && book.totalPages > 0
                ? Math.round((book.currentPage / book.totalPages) * 100)
                : null

            return (
              <div
                key={book.id}
                className={`bg-white rounded-xl border p-5 ${book.isActive ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-slate-200'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-slate-900">{book.title}</h2>
                      {book.isActive && (
                        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          Current
                        </span>
                      )}
                      <Badge value={book.status} />
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{book.author} · {book.subject}</p>
                    {book.description && (
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">{book.description}</p>
                    )}
                    {book.currentChapter && (
                      <p className="text-xs text-slate-400 mt-2">Reading: {book.currentChapter}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {!book.isActive && (
                      <Button size="sm" variant="ghost" onClick={() => handleSetActive(book)}>
                        Set Active
                      </Button>
                    )}
                    {book.pdfFilename && (
                      <Button size="sm" variant="secondary" onClick={() => navigate(`/reader/${book.id}`)}>
                        Read
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => setEditing(book)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(book)}>Delete</Button>
                  </div>
                </div>

                {progress !== null && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Page {book.currentPage} of {book.totalPages}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Book" size="lg">
        <BookForm onSubmit={handleCreate} onCancel={() => setIsOpen(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Edit Book" size="lg">
        {editing && (
          <BookForm
            key={editing.id}
            initialValues={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
