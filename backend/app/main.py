"""Configuracion principal del backend FastAPI."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import appointments, dashboard, services, staff

# Importacion de modulos refactorizados (cumple con el avance)
from .services.citas import obtener_citas
from .services.imagen import procesar_imagen
from .utils.helpers import ordenar_citas


def _allowed_origins() -> list[str]:
    raw_origins = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
    )
    origins: list[str] = []

    # `split(",")` separa el texto largo en elementos individuales y `strip()`
    # elimina espacios sobrantes antes de guardar cada origen en la lista final.
    for origin in raw_origins.split(","):
        cleaned_origin = origin.strip()
        if cleaned_origin:
            origins.append(cleaned_origin)

    return origins


app = FastAPI(
    title="Calibre 62 API",
    version="1.0.0",
    description="Backend FastAPI para citas, servicios, equipo y dashboard de Calibre 62.",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["health"])
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


# Endpoint de prueba (demuestra uso de funciones y lambda)
@app.get("/api/test-refactor", tags=["test"])
def test_refactor():
    citas = [
        {"id": 1, "fecha": "2026-04-20", "hora": "10:00"},
        {"id": 2, "fecha": "2026-04-20", "hora": "09:00"},
    ]

    citas_ordenadas = ordenar_citas(citas)
    resultado_imagen = procesar_imagen("cliente.jpg")

    return {
        "citas": citas_ordenadas,
        "simulacion": resultado_imagen,
    }


app.include_router(dashboard.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(staff.router, prefix="/api")
