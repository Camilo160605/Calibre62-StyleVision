import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { getDashboard, getLocalDashboardSnapshot } from '../lib/api.js'

const CSS = `
  .dash { flex:1; overflow-y:auto; }
  .dash-body { padding: 28px; display: flex; flex-direction: column; gap: 24px; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; }
  .stat-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    padding: 20px 22px;
    position: relative;
    overflow: hidden;
  }
  .stat-card::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
    opacity:.5;
  }
  .stat-lbl {
    font-size: 9px; letter-spacing:3px; color:var(--text-off);
    text-transform:uppercase; font-family:'Syne',sans-serif; margin-bottom:10px;
  }
  .stat-val {
    font-family:'Cormorant Garamond',serif;
    font-size: 32px; font-weight:300; color:var(--text); line-height:1;
  }
  .stat-val span { font-size:14px; color:var(--text-dim); margin-left:2px; }
  .stat-sub {
    font-size:11px; color:var(--text-off); margin-top:6px;
  }
  .stat-accent {
    position:absolute; bottom:-20px; right:-10px;
    font-family:'Cormorant Garamond',serif;
    font-size:80px; font-weight:300; color:rgba(196,160,96,.04);
    line-height:1; pointer-events:none;
  }

  /* Grid */
  .dash-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }

  /* Section header */
  .sec-hdr {
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:16px;
  }
  .sec-title {
    font-family:'Syne',sans-serif; font-size:10px; letter-spacing:3px;
    text-transform:uppercase; color:var(--text-dim);
    display:flex; align-items:center; gap:10px;
  }
  .sec-title::after { content:''; flex:1; height:1px; background:var(--border); }
  .sec-link {
    font-size:10px; letter-spacing:2px; text-transform:uppercase;
    color:var(--text-off); background:none; border:none; cursor:pointer;
    font-family:'Syne',sans-serif; transition:color .2s;
  }
  .sec-link:hover { color:var(--gold); }

  /* Appointment list */
  .appt-list { display:flex; flex-direction:column; gap:8px; }
  .appt-row {
    background:var(--bg2); border:1px solid var(--border);
    padding:14px 16px;
    display:flex; align-items:center; gap:14px;
    transition:border-color .2s;
  }
  .appt-row:hover { border-color:rgba(196,160,96,.25); }
  .appt-av {
    width:36px; height:36px; border-radius:50%;
    border:1px solid var(--border);
    background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:13px; color:var(--gold);
    flex-shrink:0;
  }
  .appt-name { font-size:13px; color:var(--text); font-weight:500; }
  .appt-svc  { font-size:11px; color:var(--text-dim); margin-top:1px; }
  .appt-time {
    margin-left:auto; font-family:'Cormorant Garamond',serif;
    font-size:17px; color:var(--text-dim); flex-shrink:0;
  }
  .appt-barber { font-size:10px; color:var(--text-off); text-align:right; margin-top:1px; }
  .appt-status {
    font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:3px 8px; font-family:'Syne',sans-serif; flex-shrink:0;
  }
  .st-confirmed { border:1px solid rgba(74,144,96,.3);  color:rgba(74,144,96,.8); }
  .st-checkin   { border:1px solid rgba(196,160,96,.4); color:var(--gold); background:var(--gold-glow); }
  .st-pending   { border:1px solid rgba(100,100,100,.3); color:#505050; }

  /* Staff panel */
  .staff-panel { background:var(--bg2); border:1px solid var(--border); padding:20px; }
  .staff-list  { display:flex; flex-direction:column; gap:10px; margin-top:14px; }
  .staff-row {
    display:flex; align-items:center; gap:12px;
    padding-bottom:10px; border-bottom:1px solid var(--border);
  }
  .staff-row:last-child { border:none; padding-bottom:0; }
  .staff-av {
    width:34px; height:34px; border-radius:50%;
    border:1px solid var(--border); background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:13px; color:var(--gold);
    flex-shrink:0; position:relative;
  }
  .staff-active-dot {
    position:absolute; bottom:1px; right:1px;
    width:7px; height:7px; border-radius:50%;
    background:var(--green); border:1.5px solid var(--bg2);
  }
  .staff-name { font-size:13px; color:var(--text); }
  .staff-role { font-size:10px; color:var(--text-off); }
  .staff-rating {
    margin-left:auto; font-family:'Cormorant Garamond',serif;
    font-size:16px; color:var(--gold); flex-shrink:0;
  }
  .staff-rating span { font-size:10px; color:var(--text-off); margin-left:1px; }
`

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

export default function Dashboard() {
  const [summary, setSummary] = useState(() => getLocalDashboardSnapshot())

  useEffect(() => {
    let cancelled = false

    getDashboard()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const { stats, appointments: todayAppts, staff } = summary

  return (
    <>
      <style>{CSS}</style>
      <div className="dash">
        <Header title="Dashboard" />
        <div className="dash-body">

          <div className="stats-row fade-up">
            <div className="stat-card">
              <div className="stat-lbl">Ingresos Hoy</div>
              <div className="stat-val">{fmt(stats.todayRevenue)}</div>
              <div className="stat-sub">Basado en la agenda del dia</div>
              <div className="stat-accent">$</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Clientes Hoy</div>
              <div className="stat-val">{stats.todayClients}<span>citas</span></div>
              <div className="stat-sub">{stats.pendingCheckins} pendientes de check-in</div>
              <div className="stat-accent">C</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Ticket Promedio</div>
              <div className="stat-val">{fmt(stats.avgTicket)}</div>
              <div className="stat-sub">Calculado sobre servicios agendados</div>
              <div className="stat-accent">T</div>
            </div>
            <div className="stat-card">
              <div className="stat-lbl">Ocupacion</div>
              <div className="stat-val">{stats.occupancy}<span>%</span></div>
              <div className="stat-sub">{stats.activeProfessionals} profesionales activos</div>
              <div className="stat-accent">%</div>
            </div>
          </div>

          <div className="dash-grid fade-up2">
            <div>
              <div className="sec-hdr">
                <div className="sec-title">Citas de Hoy</div>
                <button className="sec-link">Ver todas →</button>
              </div>
              <div className="appt-list">
                {todayAppts.map((appointment) => (
                  <div key={appointment.id} className="appt-row">
                    <div className="appt-av">{appointment.initials}</div>
                    <div>
                      <div className="appt-name">{appointment.client}</div>
                      <div className="appt-svc">{appointment.service} · {appointment.duration} min</div>
                    </div>
                    <div>
                      <div className="appt-time">{appointment.time}</div>
                      <div className="appt-barber">{appointment.barber}</div>
                    </div>
                    <div className={`appt-status st-${appointment.status}`}>
                      {appointment.status === 'confirmed' ? 'Confirmada' : appointment.status === 'checkin' ? '✓ Check-in' : 'Pendiente'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="sec-hdr">
                <div className="sec-title" style={{ width: '100%' }}>Equipo</div>
              </div>
              <div className="staff-panel">
                <div className="staff-list">
                  {staff.map((member) => (
                    <div key={member.id} className="staff-row">
                      <div className="staff-av">
                        {member.initials}
                        {member.status === 'active' && <div className="staff-active-dot" />}
                      </div>
                      <div>
                        <div className="staff-name">{member.name}</div>
                        <div className="staff-role">{member.specialty}</div>
                      </div>
                      <div className="staff-rating">{member.rating}<span>★</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
