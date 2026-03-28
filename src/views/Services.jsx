import { useEffect, useState } from 'react'
import Header from '../components/Header.jsx'
import { createService, deleteService, getLocalServicesSnapshot, getServices } from '../lib/api.js'

const CSS = `
  .svc { flex:1; overflow-y:auto; }
  .svc-body { padding:28px; display:flex; flex-direction:column; gap:20px; }

  .svc-toolbar {
    display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
  }
  .cat-row { display:flex; gap:6px; flex-wrap:wrap; }
  .cat-tab {
    background:transparent; border:1px solid var(--border);
    color:var(--text-dim); font-family:'Syne',sans-serif;
    font-size:9px; letter-spacing:2px; text-transform:uppercase;
    padding:7px 14px; cursor:pointer; transition:all .2s;
  }
  .cat-tab.on { border-color:rgba(196,160,96,.4); color:var(--gold); background:var(--gold-glow); }
  .cat-tab:hover:not(.on) { border-color:rgba(196,160,96,.2); color:var(--text); }

  .add-btn {
    background:transparent; border:1px solid rgba(196,160,96,.35);
    color:var(--gold); font-family:'Syne',sans-serif;
    font-size:10px; letter-spacing:3px; text-transform:uppercase;
    padding:10px 22px; cursor:pointer; transition:all .3s; flex-shrink:0;
  }
  .add-btn:hover { background:var(--gold-glow); border-color:var(--gold); }

  .svc-grid {
    display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:12px;
  }
  .svc-card {
    background:var(--bg2); border:1px solid var(--border);
    padding:20px 22px; position:relative;
    transition:border-color .2s; cursor:default;
  }
  .svc-card:hover { border-color:rgba(196,160,96,.22); }
  .svc-card.popular::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .svc-cat-tag {
    font-size:8px; letter-spacing:3px; color:var(--text-off);
    text-transform:uppercase; font-family:'Syne',sans-serif;
    margin-bottom:10px;
    display:flex; align-items:center; gap:6px;
  }
  .popular-dot {
    width:5px; height:5px; border-radius:50%; background:var(--gold);
    display:inline-block;
  }
  .svc-name {
    font-family:'Cormorant Garamond',serif; font-size:20px;
    color:var(--text); font-weight:400; margin-bottom:12px; line-height:1.2;
  }
  .svc-meta { display:flex; align-items:flex-end; justify-content:space-between; }
  .svc-price {
    font-family:'Cormorant Garamond',serif; font-size:24px; color:var(--gold); line-height:1;
  }
  .svc-price-sub { font-size:10px; color:var(--text-off); margin-top:2px; letter-spacing:1px; }
  .svc-dur {
    font-size:11px; color:var(--text-off);
    display:flex; align-items:center; gap:4px;
  }

  .svc-actions {
    display:flex; gap:6px; margin-top:14px; padding-top:14px;
    border-top:1px solid var(--border);
  }
  .svc-act {
    flex:1; background:transparent; border:1px solid var(--border);
    color:var(--text-off); font-family:'Syne',sans-serif;
    font-size:8px; letter-spacing:2px; text-transform:uppercase;
    padding:7px; cursor:pointer; transition:all .2s;
  }
  .svc-act:hover { border-color:rgba(196,160,96,.3); color:var(--gold); }

  /* Add modal */
  .modal-ov {
    position:fixed; inset:0; background:rgba(0,0,0,.8);
    backdrop-filter:blur(8px); z-index:50;
    display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeIn .2s ease;
  }
  .modal-box {
    background:var(--bg2); border:1px solid rgba(196,160,96,.2);
    padding:36px; width:100%; max-width:440px; animation:fadeUp .3s ease;
    position:relative;
  }
  .modal-box::before {
    content:''; position:absolute; top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,var(--gold),transparent);
  }
  .m-title {
    font-family:'Cormorant Garamond',serif; font-size:24px;
    color:var(--gold); font-weight:300; margin-bottom:24px;
  }
  .m-field { margin-bottom:16px; }
  .m-lbl {
    font-size:9px; letter-spacing:3px; color:var(--text-off);
    text-transform:uppercase; font-family:'Syne',sans-serif;
    display:block; margin-bottom:8px;
  }
  .m-input {
    width:100%; background:var(--bg1); border:1px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px;
    padding:10px 14px; outline:none; transition:border-color .2s;
  }
  .m-input:focus { border-color:rgba(196,160,96,.4); }
  .m-row { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .m-select {
    width:100%; background:var(--bg1); border:1px solid var(--border);
    color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px;
    padding:10px 14px; outline:none; cursor:pointer;
  }
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
  .m-cancel:hover { border-color:rgba(196,160,96,.2); color:var(--text-dim); }
`

const fmt = n => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', maximumFractionDigits:0 }).format(n)
const CATS = ['Todas', 'Corte', 'Barba', 'Combo', 'Color', 'Tratamiento']

export default function Services() {
  const [cat, setCat]         = useState('Todas')
  const [services, setServices] = useState(() => getLocalServicesSnapshot())
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState({ name:'', category:'Corte', price:'', duration:'' })

  useEffect(() => {
    let cancelled = false

    getServices()
      .then((data) => {
        if (!cancelled) setServices(data)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  const filtered = cat === 'Todas' ? services : services.filter(s => s.category === cat)

  const save = async () => {
    if (!form.name || !form.price) return

    const created = await createService({
      name: form.name,
      category: form.category,
      price: parseInt(form.price, 10),
      duration: parseInt(form.duration, 10) || 30,
    })

    setServices(prev => [...prev, created])
    setModal(false)
    setForm({ name:'', category:'Corte', price:'', duration:'' })
  }

  const del = async (id) => {
    await deleteService(id)
    setServices(prev => prev.filter(s => s.id !== id))
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="svc">
        <Header title="Catálogo de Servicios" />
        <div className="svc-body">

          <div className="svc-toolbar fade-up">
            <div className="cat-row">
              {CATS.map(c => (
                <button key={c} className={`cat-tab ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>
              ))}
            </div>
            <button className="add-btn" onClick={() => setModal(true)}>+ Nuevo Servicio</button>
          </div>

          <div className="svc-grid fade-up2">
            {filtered.map(s => (
              <div key={s.id} className={`svc-card ${s.popular ? 'popular' : ''}`}>
                <div className="svc-cat-tag">
                  {s.popular && <span className="popular-dot" />}
                  {s.category}
                </div>
                <div className="svc-name">{s.name}</div>
                <div className="svc-meta">
                  <div>
                    <div className="svc-price">{fmt(s.price)}</div>
                    <div className="svc-price-sub">COP</div>
                  </div>
                  <div className="svc-dur">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2"/>
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                    </svg>
                    {s.duration} min
                  </div>
                </div>
                <div className="svc-actions">
                  <button className="svc-act">Editar</button>
                  <button className="svc-act" onClick={() => del(s.id)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div className="modal-ov" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal-box">
            <div className="m-title">Nuevo Servicio</div>
            <div className="m-field">
              <label className="m-lbl">Nombre del servicio</label>
              <input className="m-input" value={form.name} onChange={e => setForm(p => ({...p, name:e.target.value}))} placeholder="Ej: Corte + Diseño" />
            </div>
            <div className="m-row">
              <div className="m-field">
                <label className="m-lbl">Categoría</label>
                <select className="m-select" value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                  {['Corte','Barba','Combo','Color','Tratamiento'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="m-field">
                <label className="m-lbl">Duración (min)</label>
                <input className="m-input" type="number" value={form.duration} onChange={e => setForm(p => ({...p, duration:e.target.value}))} placeholder="30" />
              </div>
            </div>
            <div className="m-field">
              <label className="m-lbl">Precio (COP)</label>
              <input className="m-input" type="number" value={form.price} onChange={e => setForm(p => ({...p, price:e.target.value}))} placeholder="50000" />
            </div>
            <div className="m-footer">
              <button className="m-cancel" onClick={() => setModal(false)}>Cancelar</button>
              <button className="m-save" onClick={save}>Guardar Servicio</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
