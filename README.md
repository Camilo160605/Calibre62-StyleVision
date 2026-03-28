# Calibre 62 · Plataforma Administrativa

Frontend React + Vite con backend FastAPI para dashboard, citas, servicios y equipo.

## Requisitos

- Node.js 18+
- Python 3.11+

## Frontend

```bash
npm install
npm run dev
```

Abrir en `http://localhost:5173`.

El frontend consume la API en `/api`. En desarrollo, Vite hace proxy hacia `http://127.0.0.1:8000`.

## Backend FastAPI

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponible en:

- `http://127.0.0.1:8000/api/health`
- `http://127.0.0.1:8000/api/docs`

## Endpoints principales

- `GET /api/dashboard`
- `GET /api/appointments`
- `PATCH /api/appointments/{id}/status`
- `GET /api/services`
- `POST /api/services`
- `DELETE /api/services/{id}`
- `GET /api/staff`
- `POST /api/staff`
- `PATCH /api/staff/{id}/status`

## Vistas

| Ruta         | Vista                              |
|--------------|------------------------------------|
| `/`          | Dashboard con indicadores y agenda |
| `/citas`     | Gestion de citas y check-in NFC    |
| `/servicios` | Catalogo de servicios              |
| `/equipo`    | Gestion de profesionales           |
| `/espejo`    | Espejo virtual AR con camara       |

## Notas

- Si el backend no esta levantado, el frontend usa los mocks actuales como fallback.
- El backend funciona en memoria por ahora, listo para conectarlo luego a PostgreSQL.
- El modulo AR sigue siendo client-side y no depende del backend.
"# Calibre62-StyleVision"  
