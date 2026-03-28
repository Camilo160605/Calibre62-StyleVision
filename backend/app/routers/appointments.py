from __future__ import annotations

from fastapi import APIRouter

from ..schemas import Appointment, AppointmentStatusUpdate
from ..store import store

router = APIRouter(prefix="/appointments", tags=["appointments"])


@router.get("", response_model=list[Appointment])
def list_appointments() -> list[Appointment]:
    return store.list_appointments()


@router.patch("/{appointment_id}/status", response_model=Appointment)
def update_appointment_status(appointment_id: int, payload: AppointmentStatusUpdate) -> Appointment:
    return store.update_appointment_status(appointment_id, payload.status)
