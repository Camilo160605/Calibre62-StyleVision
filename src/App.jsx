import { Routes, Route, useLocation } from 'react-router-dom'
import { GLOBAL_CSS } from './theme.js'
import Sidebar      from './components/Sidebar.jsx'
import Dashboard    from './views/Dashboard.jsx'
import Appointments from './views/Appointments.jsx'
import Services     from './views/Services.jsx'
import Staff        from './views/Staff.jsx'
import MirrorAR     from './views/MirrorAR.jsx'

const APP_CSS = `
  .app-shell {
    display: flex;
    height: 100vh;
    overflow: hidden;
    background: var(--bg);
  }
  .app-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }
  /* Ambient bg */
  .app-shell::before {
    content: '';
    position: fixed;
    top: -200px; right: -200px;
    width: 500px; height: 500px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(196,160,96,.06) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }
`

export default function App() {
  const { pathname } = useLocation()
  const isMirror = pathname === '/espejo'

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <style>{APP_CSS}</style>

      {isMirror ? (
        <MirrorAR />
      ) : (
        <div className="app-shell">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/citas"     element={<Appointments />} />
              <Route path="/servicios" element={<Services />} />
              <Route path="/equipo"    element={<Staff />} />
            </Routes>
          </main>
        </div>
      )}
    </>
  )
}
