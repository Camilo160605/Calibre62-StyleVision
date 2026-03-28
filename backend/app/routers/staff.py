from __future__ import annotations

from fastapi import APIRouter

from ..schemas import StaffCreate, StaffMember, StaffStatusUpdate
from ..store import store

router = APIRouter(prefix="/staff", tags=["staff"])


@router.get("", response_model=list[StaffMember])
def list_staff() -> list[StaffMember]:
    return store.list_staff()


@router.post("", response_model=StaffMember, status_code=201)
def create_staff(payload: StaffCreate) -> StaffMember:
    return store.create_staff(payload)


@router.patch("/{staff_id}/status", response_model=StaffMember)
def update_staff_status(staff_id: int, payload: StaffStatusUpdate) -> StaffMember:
    return store.update_staff_status(staff_id, payload.status)
