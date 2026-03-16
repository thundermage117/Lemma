import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { useAuth } from './hooks/useAuth'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'
import { Topics } from './pages/Topics'
import { Problems } from './pages/Problems'
import { Journal } from './pages/Journal'
import { Reader } from './pages/Reader'
import { AuthPage } from './pages/AuthPage'

export default function App() {
  const queryClient = useQueryClient()
  const { loading, user } = useAuth()

  useEffect(() => {
    queryClient.clear()
  }, [queryClient, user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading session...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/reader/:bookId" element={<Reader />} />
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/library" element={<Library />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/journal" element={<Journal />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  )
}
