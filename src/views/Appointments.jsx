import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { getAppointments, getLocalAppointmentsSnapshot, updateAppointmentStatus } from '../lib/api.js'

/*
  Actividad correspondiente a la guia de la semana 5.
  En esta vista se evidencian:
  - listas de objetos para representar citas
  - condicionales if / else para filtrar estados
  - recorridos iterativos con filter() y map()
  - procesamiento de cadenas con split() al mostrar el nombre del profesional
*/

const CSS = `
  .citas { flex:1; overflow-y:auto; }
  .citas-body { padding:28px; display:flex; flex-direction:column; gap:20px; }

  /* NFC Check-in Banner */
  .nfc-banner {
    background: linear-gradient(135deg, rgba(196,160,96,.08), rgba(196,160,96,.04));
    border: 1px solid rgba(196,160,96,.25);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    position: relative;
    overflow: hidden;
  }
  .nfc-banner::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .nfc-banner-left { display:flex; align-items:center; gap:16px; }
  .nfc-icon-b {
    width:44px; height:44px; border-radius:50%;
    border:1px solid rgba(196,160,96,.3);
    display:flex; align-items:center; justify-content:center;
    background:rgba(196,160,96,.06); flex-shrink:0;
    animation: pulse 2s ease-in-out infinite;
  }
  .nfc-title { font-family:'Syne',sans-serif; font-size:13px; font-weight:600; color:var(--gold); letter-spacing:1px; }
  .nfc-desc  { font-size:12px; color:var(--text-dim); margin-top:3px; }
  .nfc-btn {
    background:transparent; border:1px solid rgba(196,160,96,.4);
    color:var(--gold); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:12px 24px; cursor:pointer; transition:all .3s; flex-shrink:0;
  }
  .nfc-btn:hover { border-color:var(--gold); box-shadow:0 0 20px rgba(196,160,96,.15); }

  /* Filter tabs */
  .filter-row { display:flex; gap:6px; flex-wrap:wrap; }
  .ftab {
    background:transparent; border:1px solid var(--border);
    color:var(--text-dim); font-family:'Syne',sans-serif;
    font-size:9px; letter-spacing:2px; text-transform:uppercase;
    padding:8px 16px; cursor:pointer; transition:all .2s;
  }
  .ftab.on { border-color:rgba(196,160,96,.4); color:var(--gold); background:var(--gold-glow); }
  .ftab:hover:not(.on) { border-color:rgba(196,160,96,.2); color:var(--text); }

  /* Table */
  .appt-table { width:100%; border-collapse:collapse; }
  .appt-table thead tr {
    border-bottom: 1px solid var(--border);
  }
  .appt-table th {
    text-align:left; font-family:'Syne',sans-serif;
    font-size:8px; letter-spacing:3px; color:var(--text-off);
    text-transform:uppercase; padding:10px 14px; font-weight:400;
  }
  .appt-table td { padding:0; }
  .appt-table tbody tr {
    border-bottom:1px solid var(--border);
    transition: background .15s;
  }
  .appt-table tbody tr:hover { background:rgba(196,160,96,.03); }
  .td-in { padding:13px 14px; }

  .av-sm {
    width:32px; height:32px; border-radius:50%;
    border:1px solid var(--border); background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:12px; color:var(--gold);
  }
  .c-name { font-size:13px; color:var(--text); }
  .c-visits { font-size:10px; color:var(--text-off); margin-top:1px; }
  .c-svc { font-size:13px; color:var(--text-dim); }
  .c-dur { font-size:10px; color:var(--text-off); margin-top:1px; }
  .c-time { font-family:'Cormorant Garamond',serif; font-size:18px; color:var(--text-dim); }
  .c-barber { font-size:10px; color:var(--text-off); margin-top:1px; }
  .badge-wrap { display:flex; align-items:center; gap:8px; }
  .badge {
    font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:3px 9px; font-family:'Syne',sans-serif;
  }
  .b-confirmed { border:1px solid rgba(74,144,96,.3);  color:rgba(74,144,96,.8); }
  .b-checkin   { border:1px solid rgba(196,160,96,.4); color:var(--gold); background:var(--gold-glow); }
  .b-pending   { border:1px solid rgba(100,100,100,.3); color:#505050; }

  .action-btn {
    background:transparent; border:1px solid var(--border);
    color:var(--text-off); font-family:'Syne',sans-serif;
    font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:6px 12px; cursor:pointer; transition:all .2s;
  }
  .action-btn:hover { border-color:rgba(196,160,96,.3); color:var(--gold); }
  .action-btn.checkin-now {
    border-color:rgba(196,160,96,.35); color:var(--gold);
  }
  .action-btn.checkin-now:hover { background:var(--gold-glow); }

  /* Modal */
  .modal-ov {
    position:fixed; inset:0; background:rgba(0,0,0,.8);
    backdrop-filter:blur(8px); z-index:50;
    display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn .2s ease;
  }
  .modal-box {
    background:var(--bg2); border:1px solid rgba(196,160,96,.25);
    padding:36px; width:100%; max-width:440px;
    position:relative; animation:fadeUp .3s ease;
  }
  .modal-box::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .modal-phase { text-align:center; }
  .modal-title {
    font-family:'Cormorant Garamond',serif; font-size:26px;
    color:var(--gold); font-weight:300; margin-bottom:6px;
  }
  .modal-sub { font-size:11px; letter-spacing:3px; color:var(--text-off); text-transform:uppercase; margin-bottom:28px; }
  .scan-box {
    width:100px; height:100px; border:1px solid rgba(196,160,96,.25);
    margin:0 auto 24px; position:relative;
    display:flex; align-items:center; justify-content:center;
  }
  .scan-box::before,.scan-box::after {
    content:''; position:absolute; width:14px; height:14px;
    border-color:var(--gold); border-style:solid;
  }
  .scan-box::before { top:-1px;left:-1px; border-width:2px 0 0 2px; }
  .scan-box::after  { bottom:-1px;right:-1px; border-width:0 2px 2px 0; }
  .scan-spin {
    width:40px; height:40px; border-radius:50%;
    border:1px solid var(--border);
    border-top-color:var(--gold);
    animation:spin 1s linear infinite;
  }

  .client-select { display:flex; flex-direction:column; gap:8px; margin-bottom:4px; }
  .cs-opt {
    display:flex; align-items:center; gap:14px;
    padding:14px; border:1px solid var(--border);
    cursor:pointer; background:transparent; width:100%; text-align:left;
    transition:all .2s;
  }
  .cs-opt:hover { border-color:rgba(196,160,96,.35); background:var(--gold-glow); }
  .cs-av {
    width:38px; height:38px; border-radius:50%;
    border:1px solid var(--border); background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:14px; color:var(--gold); flex-shrink:0;
  }
  .cs-name { font-size:13px; color:var(--text); font-family:'Syne',sans-serif; }
  .cs-info { font-size:11px; color:var(--text-off); margin-top:2px; }
  .cs-time { margin-left:auto; font-family:'Cormorant Garamond',serif; font-size:17px; color:var(--gold); flex-shrink:0; }

  .modal-cancel {
    background:transparent; border:none; color:var(--text-off);
    font-family:'Syne',sans-serif; font-size:9px; letter-spacing:3px;
    text-transform:uppercase; cursor:pointer; width:100%; padding:14px 0 0;
    transition:color .2s;
  }
  .modal-cancel:hover { color:var(--text-dim); }

  /* Success */
  .success-av {
    width:64px; height:64px; border-radius:50%;
    border:1px solid rgba(196,160,96,.4); background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:24px; color:var(--gold);
    margin:0 auto 20px;
  }
  .success-name {
    font-family:'Cormorant Garamond',serif; font-size:30px;
    color:var(--text); font-weight:300; margin-bottom:4px;
  }
  .success-svc { font-size:13px; color:var(--text-dim); margin-bottom:20px; }
  .success-meta { display:flex; justify-content:center; gap:28px; margin-bottom:28px; }
  .sm-item { display:flex; flex-direction:column; gap:4px; align-items:center; }
  .sm-lbl { font-size:9px; letter-spacing:3px; color:var(--text-off); text-transform:uppercase; }
  .sm-val { font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--gold); }
  .success-check {
    width:48px; height:48px; border-radius:50%;
    border:1px solid rgba(74,144,96,.4); background:rgba(74,144,96,.08);
    display:flex; align-items:center; justify-content:center; margin:0 auto 16px;
  }
  .close-btn {
    background:transparent; border:1px solid rgba(196,160,96,.3);
    color:var(--gold); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:12px 32px; cursor:pointer; transition:all .3s; width:100%;
  }
  .close-btn:hover { background:var(--gold-glow); border-color:var(--gold); }
`

const FILTERS = ['Todas', 'Confirmadas', 'Check-in', 'Pendientes']

export default function Appointments() {
  const [filter, setFilter]   = useState('Todas')
  const [appts, setAppts]     = useState(() => getLocalAppointmentsSnapshot())
  const [modal, setModal]     = useState(null) // null | 'select' | 'scanning' | 'success'
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false

    // Se consulta la lista de citas al iniciar la vista. El control booleano
    // evita actualizar el estado si el componente ya no esta montado.
    getAppointments()
      .then((data) => {
        if (!cancelled) setAppts(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  // Este bloque usa una cadena de condicionales para decidir que registros
  // deben quedar en el reporte visible segun el filtro seleccionado.
  const filtered = appts.filter(a => {
    if (filter === 'Todas')       return true
    if (filter === 'Confirmadas') return a.status === 'confirmed'
    if (filter === 'Check-in')    return a.status === 'checkin'
    if (filter === 'Pendientes')  return a.status === 'pending'
    return true
  })

  // Se genera un subconjunto de la lista principal para mostrar solo las citas
  // que aun pueden pasar por el flujo iterativo de check-in.
  const pendingCheckin = appts.filter(a => a.status === 'confirmed')

  const doCheckin = (appt) => {
    setSelected(appt)
    setModal('scanning')

    // Este flujo simula una operacion asincrona y luego recorre la coleccion
    // con `map()` para reemplazar unicamente el registro actualizado.
    window.setTimeout(async () => {
      const updated = await updateAppointmentStatus(appt.id, 'checkin')
      setAppts(prev => prev.map(a => a.id === appt.id ? updated : a))
      setSelected(updated)
      setModal('success')
    }, 2000)
  }

  const closeModal = () => { setModal(null); setSelected(null) }

  return (
    <>
      <style>{CSS}</style>
      <div className="citas">
        <Header title="Gestión de Citas" />
        <div className="citas-body">

          {/* NFC Banner */}
          <div className="nfc-banner fade-up">
            <div className="nfc-banner-left">
              <div className="nfc-icon-b">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="rgba(196,160,96,.6)"/>
                  <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="#c4a060" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 12c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke="#c4a060" strokeWidth="1.2" strokeLinecap="round" strokeOpacity=".5"/>
                </svg>
              </div>
              <div>
                <div className="nfc-title">Check-in NFC</div>
                <div className="nfc-desc">{pendingCheckin.length} clientes esperando confirmación de llegada</div>
              </div>
            </div>
            <button className="nfc-btn" onClick={() => setModal('select')}>
              ◈ Simular Check-in
            </button>
          </div>

          {/* Filters */}
          <div className="filter-row fade-up2">
            {FILTERS.map(f => (
              <button key={f} className={`ftab ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="fade-up3">
            <table className="appt-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Hora</th>
                  <th>Profesional</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {/* `map()` recorre toda la coleccion filtrada para construir el
                    reporte tabular de citas visibles. */}
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="td-in" style={{display:'flex',alignItems:'center',gap:10}}>
                        <div className="av-sm">{a.initials}</div>
                        <div>
                          <div className="c-name">{a.client}</div>
                          <div className="c-visits">{a.visits} visitas</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="td-in">
                        <div className="c-svc">{a.service}</div>
                        <div className="c-dur">{a.duration} min</div>
                      </div>
                    </td>
                    <td className="td-in">
                      <div className="c-time">{a.time}</div>
                    </td>
                    <td className="td-in">
                      <div className="c-barber" style={{color:'var(--text-dim)'}}>{a.barber}</div>
                    </td>
                    <td className="td-in">
                      <span className={`badge b-${a.status}`}>
                        {a.status === 'confirmed' ? 'Confirmada' : a.status === 'checkin' ? '✓ Check-in' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="td-in">
                      {a.status === 'confirmed' && (
                        <button className="action-btn checkin-now" onClick={() => doCheckin(a)}>
                          Check-in
                        </button>
                      )}
                      {a.status === 'checkin' && (
                        <button className="action-btn" disabled style={{opacity:.3}}>En silla</button>
                      )}
                      {a.status === 'pending' && (
                        <button className="action-btn" onClick={async () => {
                          const updated = await updateAppointmentStatus(a.id, 'confirmed')
                          setAppts(prev => prev.map(x => x.id === a.id ? updated : x))
                        }}>
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── MODAL ── */}
      {modal && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="modal-box">

            {modal === 'select' && (
              <div className="modal-phase">
                <div className="modal-title">Check-in NFC</div>
                <div className="modal-sub">Seleccionar cliente entrante</div>
                <div className="client-select">
                  {pendingCheckin.slice(0, 5).map(a => (
                    <button key={a.id} className="cs-opt" onClick={() => doCheckin(a)}>
                      <div className="cs-av">{a.initials}</div>
                      <div>
                        <div className="cs-name">{a.client}</div>
                        <div className="cs-info">{a.service}</div>
                      </div>
                      <div className="cs-time">{a.time}</div>
                    </button>
                  ))}
                </div>
                <button className="modal-cancel" onClick={closeModal}>Cancelar</button>
              </div>
            )}

            {modal === 'scanning' && (
              <div className="modal-phase">
                <div className="modal-title">Verificando</div>
                <div className="modal-sub">Leyendo token NFC</div>
                <div className="scan-box"><div className="scan-spin" /></div>
                <div style={{fontSize:11,letterSpacing:3,color:'var(--text-off)',textTransform:'uppercase',fontFamily:'Syne,sans-serif'}}>
                  {selected?.client}
                </div>
              </div>
            )}

            {modal === 'success' && selected && (
              <div className="modal-phase">
                <div className="success-check">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l4.5 4.5L19 7" stroke="rgba(74,144,96,.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="success-av">{selected.initials}</div>
                <div className="success-name">{selected.client}</div>
                <div className="success-svc">{selected.service}</div>
                <div className="success-meta">
                  <div className="sm-item">
                    <div className="sm-lbl">Hora</div>
                    <div className="sm-val">{selected.time}</div>
                  </div>
                  <div className="sm-item">
                    <div className="sm-lbl">Profesional</div>
                    <div className="sm-val" style={{fontSize:15}}>{selected.barber.split(' ')[0]}</div>
                  </div>
                  <div className="sm-item">
                    <div className="sm-lbl">Visita #</div>
                    <div className="sm-val">{selected.visits + 1}</div>
                  </div>
                </div>
                <button className="close-btn" onClick={closeModal}>✓ Confirmar ingreso</button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  )
}
