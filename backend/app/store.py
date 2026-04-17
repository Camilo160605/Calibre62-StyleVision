"""Almacenamiento en memoria para la plataforma Calibre 62.

Actividad correspondiente a la guia de la semana 5.
En este archivo se deja evidencia academica del uso de listas, diccionarios,
listas de diccionarios, validaciones, ciclos `for` y `while`, ademas de
`break`, `continue` y manejo de errores con `try/except`.
"""

from __future__ import annotations

from copy import deepcopy
from threading import Lock

from fastapi import HTTPException

from .schemas import AppointmentStatus, ServiceCreate, StaffCreate, StaffStatus
from .seed import SEED_APPOINTMENTS, SEED_SERVICES, SEED_STAFF


def _normalize_text(value: str, field_label: str, *, allow_empty: bool = False) -> str:
    """Limpia y valida textos antes de guardarlos en la estructura local."""

    # `try/except` agrega una capa defensiva para manejar entradas inesperadas
    # antes de que el dato se almacene en la lista de diccionarios.
    try:
        cleaned_text = str(value).replace("\t", " ").replace("\n", " ")
    except Exception as exc:  # pragma: no cover - rama defensiva
        raise HTTPException(
            status_code=422,
            detail=f"El campo {field_label} tiene un formato invalido",
        ) from exc

    # `strip()` elimina espacios en los extremos y `split()` + `join()` unifican
    # espacios internos para dejar el texto listo para procesarlo y reportarlo.
    cleaned_text = " ".join(cleaned_text.strip().split())

    if not cleaned_text and not allow_empty:
        raise HTTPException(status_code=422, detail=f"El campo {field_label} no puede estar vacio")

    return cleaned_text


def _build_initials(name: str) -> str:
    normalized_name = _normalize_text(name, "nombre")
    name_parts = normalized_name.split(" ")
    initials: list[str] = []
    index = 0

    # Este `while` recorre dinamicamente cada palabra del nombre hasta reunir
    # dos iniciales. `continue` permite omitir fragmentos vacios y `break`
    # detiene el proceso cuando ya se obtuvo el resultado necesario.
    while index < len(name_parts):
        current_part = name_parts[index]
        index += 1

        if not current_part:
            continue

        initials.append(current_part[0].upper())
        if len(initials) == 2:
            break

    return "".join(initials)


class InMemoryStore:
    """Simula una base de datos local sencilla mediante listas de diccionarios."""

    def __init__(self) -> None:
        self._lock = Lock()

        # Cada coleccion es una lista de diccionarios. Esta decision permite
        # representar registros con pares clave:valor y recorrerlos despues
        # para generar reportes, filtros y actualizaciones.
        self._appointments = deepcopy(SEED_APPOINTMENTS)
        self._services = deepcopy(SEED_SERVICES)
        self._staff = deepcopy(SEED_STAFF)
        self._next_service_id = max((item["id"] for item in self._services), default=0) + 1
        self._next_staff_id = max((item["id"] for item in self._staff), default=0) + 1

    def list_appointments(self) -> list[dict]:
        # Se devuelve una copia para proteger la estructura original y mantener
        # la consistencia del reporte diario de citas.
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
            normalized_name = _normalize_text(payload.name, "nombre del servicio")
            service = {
                "id": self._next_service_id,
                "name": normalized_name,
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
            service_index = self._find_index_by_id(self._services, service_id, "Servicio")
            self._services.pop(service_index)

    def list_staff(self) -> list[dict]:
        return deepcopy(self._staff)

    def create_staff(self, payload: StaffCreate) -> dict:
        with self._lock:
            normalized_name = _normalize_text(payload.name, "nombre del profesional")
            normalized_role = _normalize_text(payload.role, "rol")
            normalized_specialty = _normalize_text(payload.specialty, "especialidad", allow_empty=True)
            staff_member = {
                "id": self._next_staff_id,
                "name": normalized_name,
                "role": normalized_role,
                "specialty": normalized_specialty,
                "initials": _build_initials(normalized_name),
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
        # Este diccionario funciona como indice clave:valor para consultar el
        # precio de un servicio sin recorrer la lista completa en cada cita.
        services_by_name = self._build_service_price_index()
        stats = self._build_dashboard_stats(services_by_name)

        return {
            "stats": stats,
            "appointments": deepcopy(self._appointments[:6]),
            "staff": deepcopy(self._staff),
        }

    def _build_service_price_index(self) -> dict[str, int]:
        services_by_name: dict[str, int] = {}

        # Ciclo `for` para recorrer todos los servicios y convertir la lista de
        # registros en un diccionario de consulta rapida por nombre.
        for service in self._services:
            services_by_name[service["name"]] = service["price"]

        return services_by_name

    def _build_dashboard_stats(self, services_by_name: dict[str, int]) -> dict[str, int]:
        today_revenue = 0
        confirmed_agenda = 0
        pending_checkins = 0
        appointment_index = 0

        # Este `while` mantiene un recorrido controlado sobre la agenda del dia.
        # `continue` evita contar como ocupadas las citas pendientes y deja mas
        # visible la logica iterativa pedida en la guia.
        while appointment_index < len(self._appointments):
            appointment = self._appointments[appointment_index]
            appointment_index += 1
            today_revenue += services_by_name.get(appointment["service"], 0)

            if appointment["status"] == "pending":
                continue

            confirmed_agenda += 1
            if appointment["status"] == "confirmed":
                pending_checkins += 1

        active_professionals = 0
        for member in self._staff:
            if member["status"] == "active":
                active_professionals += 1

        today_clients = len(self._appointments)
        avg_ticket = round(today_revenue / today_clients) if today_clients else 0
        occupancy = round((confirmed_agenda / today_clients) * 100) if today_clients else 0

        return {
            "todayRevenue": today_revenue,
            "todayClients": today_clients,
            "avgTicket": avg_ticket,
            "occupancy": occupancy,
            "pendingCheckins": pending_checkins,
            "activeProfessionals": active_professionals,
        }

    @staticmethod
    def _find_by_id(items: list[dict], item_id: int, label: str) -> dict:
        item_index = InMemoryStore._find_index_by_id(items, item_id, label)
        return items[item_index]

    @staticmethod
    def _find_index_by_id(items: list[dict], item_id: int, label: str) -> int:
        index = 0
        found_index = -1

        # Este `while` busca un registro concreto dentro de una lista de
        # diccionarios. `break` detiene el recorrido cuando el identificador ya
        # fue localizado, lo que mejora la trazabilidad del algoritmo.
        while index < len(items):
            current_item = items[index]
            if current_item["id"] == item_id:
                found_index = index
                break
            index += 1

        if found_index == -1:
            raise HTTPException(status_code=404, detail=f"{label} no encontrado")

        return found_index


store = InMemoryStore()
