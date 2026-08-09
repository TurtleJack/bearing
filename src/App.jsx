import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Start from './pages/Start.jsx'
import Intake from './pages/Intake.jsx'
import Report from './pages/Report.jsx'
import Export from './pages/Export.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Start />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/report" element={<Report />} />
        <Route path="/export" element={<Export />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  )
}
