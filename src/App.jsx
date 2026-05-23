import { Routes, Route } from 'react-router-dom'
import FormPage from './pages/FormPage'
import ResultsPage from './pages/ResultsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<FormPage />} />
      <Route path="/results/:auditId" element={<ResultsPage />} />
    </Routes>
  )
}