from __future__ import annotations

from copy import deepcopy
from threading import Lock

from fastapi import HTTPException

from .schemas import AppointmentStatus, ServiceCreate, StaffCreate, StaffStatus
from .seed import SEED_APPOINTMENTS, SEED_SERVICES, SEED_STAFF


def _build_initials(name: str) -> str:
    parts = [part[0] for part in name.split() if part]
    return "".join(parts[:2]).upper()


class InMemoryStore:
    def __init__(self) -> None:
        self._lock = Lock()
        self._appointments = deepcopy(SEED_APPOINTMENTS)
        self._services = deepcopy(SEED_SERVICES)
        self._staff = deepcopy(SEED_STAFF)
        self._next_service_id = max(item["id"] for item in self._services) + 1
        self._next_staff_id = max(item["id"] for item in self._staff) + 1

    def list_appointments(self) -> list[dict]:
        return deepcopy(self._appointments)

    def update_appointment_status(self, appointment_id: int, status: AppointmentStatus) -> dict:
        with self._lock:
            appointment = self._find_by_id(self._appointments, appointment_id, "Cita")
            appointment["status"] = status
            return deepcopy(appointment)

    def list_services(self) -> list[dict]:
        return deepcopy(self._services)

    def create_service(self, payload: ServiceCreate) -> dict:
        with self._lock:
            service = {
                "id": self._next_service_id,
                "name": payload.name.strip(),
                "category": payload.category,
                "price": payload.price,
                "duration": payload.duration,
                "popular": False,
            }
            self._services.append(service)
            self._next_service_id += 1
            return deepcopy(service)

    def delete_service(self, service_id: int) -> None:
        with self._lock:
            for index, service in enumerate(self._services):
                if service["id"] == service_id:
                    self._services.pop(index)
                    return
        raise HTTPException(status_code=404, detail="Servicio no encontrado")

    def list_staff(self) -> list[dict]:
        return deepcopy(self._staff)

    def create_staff(self, payload: StaffCreate) -> dict:
        with self._lock:
            staff_member = {
                "id": self._next_staff_id,
                "name": payload.name.strip(),
                "role": payload.role.strip(),
                "specialty": payload.specialty.strip(),
                "initials": _build_initials(payload.name),
                "status": "active",
                "clients": 0,
                "rating": 5.0,
            }
            self._staff.append(staff_member)
            self._next_staff_id += 1
            return deepcopy(staff_member)

    def update_staff_status(self, staff_id: int, status: StaffStatus) -> dict:
        with self._lock:
            staff_member = self._find_by_id(self._staff, staff_id, "Profesional")
            staff_member["status"] = status
            return deepcopy(staff_member)

    def get_dashboard_summary(self) -> dict:
        services_by_name = {service["name"]: service["price"] for service in self._services}
        today_revenue = sum(services_by_name.get(appointment["service"], 0) for appointment in self._appointments)
        today_clients = len(self._appointments)
        avg_ticket = round(today_revenue / today_clients) if today_clients else 0
        confirmed_agenda = sum(1 for appointment in self._appointments if appointment["status"] != "pending")
        occupancy = round((confirmed_agenda / today_clients) * 100) if today_clients else 0
        pending_checkins = sum(1 for appointment in self._appointments if appointment["status"] == "confirmed")
        active_professionals = sum(1 for member in self._staff if member["status"] == "active")

        return {
            "stats": {
                "todayRevenue": today_revenue,
                "todayClients": today_clients,
                "avgTicket": avg_ticket,
                "occupancy": occupancy,
                "pendingCheckins": pending_checkins,
                "activeProfessionals": active_professionals,
            },
            "appointments": deepcopy(self._appointments[:6]),
            "staff": deepcopy(self._staff),
        }

    @staticmethod
    def _find_by_id(items: list[dict], item_id: int, label: str) -> dict:
        for item in items:
            if item["id"] == item_id:
                return item
        raise HTTPException(status_code=404, detail=f"{label} no encontrado")


store = InMemoryStore()
