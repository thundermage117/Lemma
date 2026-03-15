import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Library } from './pages/Library'
import { Topics } from './pages/Topics'
import { Problems } from './pages/Problems'
import { Journal } from './pages/Journal'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/library" element={<Library />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
