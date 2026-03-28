import { useState, useEffect } from 'react'

const CSS = `
  .header {
    height: 60px;
    background: var(--bg1);
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 28px;
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 5;
  }
  .hdr-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: var(--text-dim);
  }
  .hdr-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
  .hdr-clock {
    font-family: 'Cormorant Garamond', serif;
    font-size: 17px;
    color: var(--text-dim);
    letter-spacing: 1px;
  }
  .hdr-date {
    font-size: 11px;
    color: var(--text-off);
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .hdr-divider {
    width: 1px;
    height: 24px;
    background: var(--border);
  }
  .hdr-status {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
    letter-spacing: 2px;
    color: var(--text-off);
    text-transform: uppercase;
  }
  .hdr-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    box-shadow: 0 0 8px rgba(74,144,96,.6);
    animation: pulse 2s ease-in-out infinite;
  }
`

export default function Header({ title }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <>
      <style>{CSS}</style>
      <header className="header">
        <div className="hdr-title">{title}</div>
        <div className="hdr-right">
          <div className="hdr-date">{date}</div>
          <div className="hdr-divider" />
          <div className="hdr-clock">{time}</div>
          <div className="hdr-divider" />
          <div className="hdr-status">
            <div className="hdr-dot" />
            Sistema activo
          </div>
        </div>
      </header>
    </>
  )
}
