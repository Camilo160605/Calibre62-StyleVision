import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { createStaff, getLocalStaffSnapshot, getStaff, updateStaffStatus } from '../lib/api.js'

/*
  Actividad correspondiente a la guia de la semana 5.
  Aqui la lista de profesionales se recorre para generar tarjetas y para
  actualizar estados individuales sin perder el resto de la coleccion.
*/

const CSS = `
  .team { flex:1; overflow-y:auto; }
  .team-body { padding:28px; display:flex; flex-direction:column; gap:24px; }

  .team-toolbar { display:flex; align-items:center; justify-content:flex-end; }
  .add-btn {
    background:transparent; border:1px solid rgba(196,160,96,.35);
    color:var(--gold); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:10px 22px; cursor:pointer; transition:all .3s;
  }
  .add-btn:hover { background:var(--gold-glow); border-color:var(--gold); }

  .team-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:16px; }

  .team-card {
    background:var(--bg2); border:1px solid var(--border);
    padding:24px; position:relative; transition:border-color .2s;
  }
  .team-card:hover { border-color:rgba(196,160,96,.2); }
  .team-card.active::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }

  .tc-top { display:flex; align-items:flex-start; gap:14px; margin-bottom:18px; }
  .tc-av {
    width:52px; height:52px; border-radius:50%;
    border:1px solid var(--border); background:var(--gold-glow);
    display:flex; align-items:center; justify-content:center;
    font-family:'Cormorant Garamond',serif; font-size:20px; color:var(--gold);
    flex-shrink:0; position:relative;
  }
  .tc-status-dot {
    position:absolute; bottom:2px; right:2px;
    width:10px; height:10px; border-radius:50%;
    border:2px solid var(--bg2);
  }
  .dot-active { background:var(--green); box-shadow:0 0 8px rgba(74,144,96,.5); }
  .dot-off    { background:#404040; }

  .tc-name {
    font-family:'Cormorant Garamond',serif; font-size:22px; color:var(--text); font-weight:300;
  }
  .tc-role { font-size:11px; color:var(--text-off); letter-spacing:1px; margin-top:2px; }
  .tc-specialty {
    font-size:11px; color:var(--text-dim); margin-top:4px;
    font-style:italic;
  }
  .tc-badge {
    margin-left:auto; font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:3px 9px; font-family:'Syne',sans-serif; flex-shrink:0;
    align-self:flex-start;
  }
  .tc-badge.on  { border:1px solid rgba(74,144,96,.3); color:rgba(74,144,96,.8); }
  .tc-badge.off { border:1px solid var(--border); color:var(--text-off); }

  .tc-stats { display:flex; gap:0; border-top:1px solid var(--border); margin-top:16px; }
  .tc-stat {
    flex:1; padding:12px 0; text-align:center;
    border-right:1px solid var(--border);
  }
  .tc-stat:last-child { border-right:none; }
  .tc-sv { font-family:'Cormorant Garamond',serif; font-size:22px; color:var(--gold); line-height:1; }
  .tc-sl { font-size:8px; letter-spacing:2px; color:var(--text-off); text-transform:uppercase; margin-top:3px; }

  .tc-actions { display:flex; gap:6px; margin-top:16px; }
  .tc-act {
    flex:1; background:transparent; border:1px solid var(--border);
    color:var(--text-off); font-family:'Syne',sans-serif;
    font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:8px; cursor:pointer; transition:all .2s;
  }
  .tc-act:hover { border-color:rgba(196,160,96,.3); color:var(--gold); }

  /* Modal */
  .modal-ov {
    position:fixed; inset:0; background:rgba(0,0,0,.8);
    backdrop-filter:blur(8px); z-index:50;
    display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn .2s ease;
  }
  .modal-box {
    background:var(--bg2); border:1px solid rgba(196,160,96,.2);
    padding:36px; width:100%; max-width:420px; animation:fadeUp .3s ease;
    position:relative;
  }
  .modal-box::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .m-title { font-family:'Cormorant Garamond',serif; font-size:24px; color:var(--gold); font-weight:300; margin-bottom:24px; }
  .m-field { margin-bottom:16px; }
  .m-lbl { font-size:9px; letter-spacing:3px; color:var(--text-off); text-transform:uppercase; font-family:'Syne',sans-serif; display:block; margin-bottom:8px; }
  .m-input {
    width:100%; background:var(--bg1); border:1px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px;
    padding:10px 14px; outline:none; transition:border-color .2s;
  }
  .m-input:focus { border-color:rgba(196,160,96,.4); }
  .m-footer { display:flex; gap:10px; margin-top:24px; }
  .m-save {
    flex:1; background:transparent; border:1px solid rgba(196,160,96,.4);
    color:var(--gold); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:12px; cursor:pointer; transition:all .3s;
  }
  .m-save:hover { background:var(--gold-glow); border-color:var(--gold); }
  .m-cancel {
    background:transparent; border:1px solid var(--border);
    color:var(--text-off); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:12px 20px; cursor:pointer; transition:all .2s;
  }
  .m-cancel:hover { color:var(--text-dim); }
`

export default function Staff() {
  const [staff, setStaff]   = useState(() => getLocalStaffSnapshot())
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ name:'', role:'Barbero', specialty:'' })

  useEffect(() => {
    let cancelled = false

    // Se obtiene la lista del equipo al cargar la vista. Esta consulta conserva
    // el enfoque de colecciones que luego se recorren y actualizan.
    getStaff()
      .then((data) => {
        if (!cancelled) setStaff(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const save = async () => {
    const cleanName = form.name.trim()
    const cleanRole = form.role.trim()
    const cleanSpecialty = form.specialty.trim()

    // Validacion minima para evitar registros vacios y mejorar la calidad del
    // conjunto de datos usado como evidencia academica.
    if (!cleanName || !cleanRole) return

    const created = await createStaff({
      name: cleanName,
      role: cleanRole,
      specialty: cleanSpecialty,
    })
    setStaff(prev => [...prev, created])
    setModal(false); setForm({ name:'', role:'Barbero', specialty:'' })
  }

  const toggle = async (member) => {
    const nextStatus = member.status === 'active' ? 'off' : 'active'

    // `map()` permite recorrer la lista completa y reemplazar solo el objeto
    // cuyo identificador coincide con el profesional actualizado.
    const updated = await updateStaffStatus(member.id, nextStatus)
    setStaff(prev => prev.map(s => s.id === member.id ? updated : s))
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="team">
        <Header title="Equipo" />
        <div className="team-body">

          <div className="team-toolbar fade-up">
            <button className="add-btn" onClick={() => setModal(true)}>+ Nuevo Profesional</button>
          </div>

          <div className="team-grid fade-up2">
            {/* Recorrido iterativo del equipo para construir una tarjeta por
                cada profesional almacenado en la coleccion local. */}
            {staff.map(s => (
              <div key={s.id} className={`team-card ${s.status === 'active' ? 'active' : ''}`}>
                <div className="tc-top">
                  <div className="tc-av">
                    {s.initials}
                    <div className={`tc-status-dot ${s.status === 'active' ? 'dot-active' : 'dot-off'}`} />
                  </div>
                  <div>
                    <div className="tc-name">{s.name}</div>
                    <div className="tc-role">{s.role}</div>
                    <div className="tc-specialty">{s.specialty}</div>
                  </div>
                  <span className={`tc-badge ${s.status === 'active' ? 'on' : 'off'}`}>
                    {s.status === 'active' ? 'Activo' : 'Fuera'}
                  </span>
                </div>

                <div className="tc-stats">
                  <div className="tc-stat">
                    <div className="tc-sv">{s.clients}</div>
                    <div className="tc-sl">Clientes</div>
                  </div>
                  <div className="tc-stat">
                    <div className="tc-sv">{s.rating}</div>
                    <div className="tc-sl">Rating</div>
                  </div>
                  <div className="tc-stat">
                    <div className="tc-sv">{s.status === 'active' ? '●' : '○'}</div>
                    <div className="tc-sl">Estado</div>
                  </div>
                </div>

                <div className="tc-actions">
                  <button className="tc-act">Editar</button>
                  <button className="tc-act" onClick={() => toggle(s)}>
                    {s.status === 'active' ? 'Marcar ausente' : 'Marcar activo'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="m-title">Nuevo Profesional</div>
            <div className="m-field">
              <label className="m-lbl">Nombre completo</label>
              <input className="m-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} placeholder="Ej: Carlos Martínez" />
            </div>
            <div className="m-field">
              <label className="m-lbl">Rol</label>
              <input className="m-input" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))} placeholder="Barbero / Estilista" />
            </div>
            <div className="m-field">
              <label className="m-lbl">Especialidad</label>
              <input className="m-input" value={form.specialty} onChange={e => setForm(p=>({...p,specialty:e.target.value}))} placeholder="Ej: Fade & Diseño" />
            </div>
            <div className="m-footer">
              <button className="m-cancel" onClick={() => setModal(false)}>Cancelar</button>
              <button className="m-save" onClick={save}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
