import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'
import { Topics } from './pages/Topics'
import { Problems } from './pages/Problems'
import { Journal } from './pages/Journal'
import { Reader } from './pages/Reader'

export default function App() {
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
