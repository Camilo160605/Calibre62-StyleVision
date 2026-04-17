import { NavLink, useNavigate } from 'react-router-dom'

/*
  Actividad correspondiente a la guia de la semana 5.
  Este componente evidencia un menu iterativo: una lista de objetos define las
  opciones y luego se recorre con `map()` para construir la navegacion.
*/

const CSS = `
  .sidebar {
    width: 220px;
    min-height: 100vh;
    background: var(--bg1);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    position: relative;
    z-index: 10;
  }
  .sidebar::after {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--gold), transparent);
    opacity: .15;
  }
  .sb-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid var(--border);
  }
  .sb-logo-num {
    font-family: 'Cormorant Garamond', serif;
    font-size: 38px;
    font-weight: 300;
    letter-spacing: -1px;
    line-height: 1;
    background: linear-gradient(135deg, var(--gold) 0%, #e8c87a 50%, #a07840 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 4s linear infinite;
  }
  .sb-logo-sub {
    font-family: 'Syne', sans-serif;
    font-size: 8px;
    letter-spacing: 4px;
    color: var(--text-off);
    text-transform: uppercase;
    margin-top: 2px;
  }
  .sb-section {
    font-size: 8px;
    letter-spacing: 3px;
    color: var(--text-off);
    text-transform: uppercase;
    padding: 20px 24px 8px;
    font-family: 'Syne', sans-serif;
  }
  .sb-nav {
    flex: 1;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
  }
  .sb-link {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 24px;
    color: var(--text-dim);
    text-decoration: none;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    transition: all .2s;
    position: relative;
    border-left: 2px solid transparent;
  }
  .sb-link:hover { color: var(--text); background: var(--gold-glow); }
  .sb-link.active {
    color: var(--gold);
    background: var(--gold-glow);
    border-left-color: var(--gold);
  }
  .sb-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: .7;
  }
  .sb-link.active .sb-icon { opacity: 1; }
  .sb-badge {
    margin-left: auto;
    background: rgba(196,160,96,.15);
    color: var(--gold);
    font-size: 9px;
    padding: 2px 7px;
    font-family: 'Syne', sans-serif;
    letter-spacing: 1px;
  }
  .sb-mirror-btn {
    margin: 16px;
    background: linear-gradient(135deg, rgba(196,160,96,.12), rgba(196,160,96,.06));
    border: 1px solid rgba(196,160,96,.3);
    color: var(--gold);
    font-family: 'Syne', sans-serif;
    font-size: 9px;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 14px 16px;
    cursor: pointer;
    transition: all .3s;
    display: flex;
    align-items: center;
    gap: 10px;
    width: calc(100% - 32px);
  }
  .sb-mirror-btn:hover {
    background: linear-gradient(135deg, rgba(196,160,96,.2), rgba(196,160,96,.1));
    border-color: rgba(196,160,96,.6);
    box-shadow: 0 0 24px rgba(196,160,96,.12);
  }
  .sb-mirror-icon {
    width: 28px;
    height: 28px;
    border: 1px solid rgba(196,160,96,.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .sb-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
  }
  .sb-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sb-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--gold-glow);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    color: var(--gold);
    font-family: 'Cormorant Garamond', serif;
    flex-shrink: 0;
  }
  .sb-user-name { font-size: 12px; color: var(--text-dim); line-height: 1.3; }
  .sb-user-role { font-size: 10px; color: var(--text-off); letter-spacing: 1px; }
`

const NAV = [
  {
    section: 'Principal',
    items: [
      { to: '/',           label: 'Dashboard',  icon: IconDash },
      { to: '/citas',      label: 'Citas',       icon: IconCal, badge: '10' },
      { to: '/servicios',  label: 'Servicios',   icon: IconSvc },
      { to: '/equipo',     label: 'Equipo',      icon: IconTeam },
    ]
  }
]

function IconDash({ cls }) {
  return <svg className={cls} viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="1" width="6" height="6" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="1" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.2"/>
    <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.2"/>
  </svg>
}
function IconCal({ cls }) {
  return <svg className={cls} viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="2.5" width="13" height="12" rx=".5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M5 1.5v2M11 1.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="8" cy="10" r="1" fill="currentColor"/>
  </svg>
}
function IconSvc({ cls }) {
  return <svg className={cls} viewBox="0 0 16 16" fill="none">
    <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
}
function IconTeam({ cls }) {
  return <svg className={cls} viewBox="0 0 16 16" fill="none">
    <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
    <path d="M14 13c0-2.21-1.34-4.1-3.25-4.76" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
}

export default function Sidebar() {
  const navigate = useNavigate()
  return (
    <>
      <style>{CSS}</style>
      <aside className="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-num">62</div>
          <div className="sb-logo-sub">Calibre · Admin</div>
        </div>

        <nav className="sb-nav">
          {/* El menu se genera recorriendo una coleccion de grupos y luego la
              subcoleccion de items. Este flujo iterativo evita repetir codigo. */}
          {NAV.map(group => (
            <div key={group.section}>
              <div className="sb-section">{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `sb-link${isActive ? ' active' : ''}`}
                >
                  <item.icon cls="sb-icon" />
                  {item.label}
                  {item.badge && <span className="sb-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Mirror CTA */}
        <button className="sb-mirror-btn" onClick={() => navigate('/espejo')}>
          <div className="sb-mirror-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M19 2l2 2-2 2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Espejo Virtual AR</span>
        </button>

        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">AD</div>
            <div>
              <div className="sb-user-name">Administrador</div>
              <div className="sb-user-role">Calibre 62</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
