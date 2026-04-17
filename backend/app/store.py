"""Almacenamiento en memoria para la plataforma Calibre 62.

Actividad correspondiente a la guia 6 sobre arrays y matrices en Python.
En este archivo se integran vectores, una matriz real de agenda, doble
indexacion, validacion de matriz rectangular, ciclos anidados, calculos
globales y una prueba simple de procesamiento masivo.
"""

from __future__ import annotations

from copy import deepcopy
from threading import Lock

from fastapi import HTTPException

from .schemas import AppointmentStatus, ServiceCreate, StaffCreate, StaffStatus
from .seed import SEED_APPOINTMENTS, SEED_SERVICES, SEED_STAFF

FREE_SLOT = "free"

# Vector principal de franjas horarias. Se usa como estructura lineal
# centralizada para definir las columnas reales de la matriz de agenda.
BASE_TIME_SLOTS_VECTOR = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
]

LOAD_TEST_ROW_MULTIPLIER = 15


def _normalize_text(value: str, field_label: str, *, allow_empty: bool = False) -> str:
    """Limpia y valida textos antes de guardarlos en la estructura local."""

    try:
        cleaned_text = str(value).replace("\t", " ").replace("\n", " ")
    except Exception as exc:  # pragma: no cover - rama defensiva
        raise HTTPException(
            status_code=422,
            detail=f"El campo {field_label} tiene un formato invalido",
        ) from exc

    cleaned_text = " ".join(cleaned_text.strip().split())

    if not cleaned_text and not allow_empty:
        raise HTTPException(status_code=422, detail=f"El campo {field_label} no puede estar vacio")

    return cleaned_text


def _build_initials(name: str) -> str:
    normalized_name = _normalize_text(name, "nombre")
    name_parts = normalized_name.split(" ")
    initials: list[str] = []
    index = 0

    while index < len(name_parts):
        current_part = name_parts[index]
        index += 1

        if not current_part:
            continue

        initials.append(current_part[0].upper())
        if len(initials) == 2:
            break

    return "".join(initials)


def _time_to_minutes(time_value: str) -> int:
    hours_text, minutes_text = time_value.split(":", maxsplit=1)
    return (int(hours_text) * 60) + int(minutes_text)


class InMemoryStore:
    """Simula una base de datos local y una agenda matricial de ocupacion."""

    def __init__(self) -> None:
        self._lock = Lock()
        self._appointments = deepcopy(SEED_APPOINTMENTS)
        self._services = deepcopy(SEED_SERVICES)
        self._staff = deepcopy(SEED_STAFF)
        self._next_service_id = max((item["id"] for item in self._services), default=0) + 1
        self._next_staff_id = max((item["id"] for item in self._staff), default=0) + 1

        self._time_slots_vector: list[str] = []
        self._staff_vector: list[str] = []
        self._schedule_matrix: list[list[str]] = []
        self._appointment_schedule_positions: dict[int, tuple[int, int]] = {}
        self._refresh_schedule_structure()

    def list_appointments(self) -> list[dict]:
        return deepcopy(self._appointments)

    def update_appointment_status(self, appointment_id: int, status: AppointmentStatus) -> dict:
        with self._lock:
            appointment = self._find_by_id(self._appointments, appointment_id, "Cita")
            appointment["status"] = status

            # Actualizacion dinamica de la matriz. Aqui se usa doble indexacion
            # real para modificar la celda que representa la cita afectada.
            self._update_schedule_cell(appointment)
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

            # La matriz se amplia con una nueva fila para el profesional creado.
            self._staff_vector.append(staff_member["name"])
            self._schedule_matrix.append(self._build_empty_schedule_row())
            self._validate_rectangular_matrix(self._schedule_matrix)
            return deepcopy(staff_member)

    def update_staff_status(self, staff_id: int, status: StaffStatus) -> dict:
        with self._lock:
            staff_member = self._find_by_id(self._staff, staff_id, "Profesional")
            staff_member["status"] = status
            return deepcopy(staff_member)

    def get_dashboard_summary(self) -> dict:
        services_by_name = self._build_service_price_index()
        stats = self._build_dashboard_stats(services_by_name)
        schedule_matrix = self._summarize_schedule_matrix()
        load_test = self._run_schedule_load_test()

        return {
            "stats": stats,
            "appointments": deepcopy(self._appointments[:6]),
            "staff": deepcopy(self._staff),
            "scheduleMatrix": schedule_matrix,
            "loadTest": load_test,
        }

    def _refresh_schedule_structure(self) -> None:
        # Se construyen dos vectores reales del sistema:
        # 1. vector de profesionales para las filas de la matriz
        # 2. vector de horarios para las columnas de la matriz
        self._staff_vector = self._build_staff_vector()
        self._time_slots_vector = self._build_time_slots_vector()
        self._schedule_matrix = self._build_empty_schedule_matrix()
        self._appointment_schedule_positions = {}

        for appointment in self._appointments:
            self._assign_appointment_to_schedule_matrix(appointment)

        self._validate_rectangular_matrix(self._schedule_matrix)

    def _build_staff_vector(self) -> list[str]:
        staff_vector: list[str] = []
        for member in self._staff:
            staff_vector.append(member["name"])
        return staff_vector

    def _build_time_slots_vector(self) -> list[str]:
        # Este vector lineal centraliza los horarios del sistema y se ordena
        # para que luego el acceso por columna sea coherente en toda la matriz.
        time_slots_vector = list(BASE_TIME_SLOTS_VECTOR)

        for appointment in self._appointments:
            normalized_time = _normalize_text(appointment["time"], "hora de cita")
            if normalized_time not in time_slots_vector:
                time_slots_vector.append(normalized_time)

        time_slots_vector.sort(key=_time_to_minutes)
        return time_slots_vector

    def _build_empty_schedule_row(self) -> list[str]:
        row: list[str] = []
        for _ in self._time_slots_vector:
            row.append(FREE_SLOT)
        return row

    def _build_empty_schedule_matrix(self) -> list[list[str]]:
        matrix: list[list[str]] = []

        # La matriz es una lista de listas. Cada fila representa un profesional
        # y cada columna un horario del vector centralizado.
        for _ in self._staff_vector:
            matrix.append(self._build_empty_schedule_row())

        return matrix

    def _assign_appointment_to_schedule_matrix(self, appointment: dict) -> None:
        row_index = self._find_value_index(self._staff_vector, appointment["barber"], "profesional")
        column_index = self._find_value_index(self._time_slots_vector, appointment["time"], "horario")

        # Doble indexacion real: matriz[f][c]. Se ubica una cita en la fila del
        # profesional y la columna de la franja horaria correspondiente.
        self._schedule_matrix[row_index][column_index] = appointment["status"]
        self._appointment_schedule_positions[appointment["id"]] = (row_index, column_index)

    def _update_schedule_cell(self, appointment: dict) -> None:
        position = self._appointment_schedule_positions.get(appointment["id"])
        if position is None:
            self._refresh_schedule_structure()
            position = self._appointment_schedule_positions.get(appointment["id"])
            if position is None:
                raise HTTPException(status_code=404, detail="La cita no tiene posicion en la matriz")

        row_index, column_index = position
        self._schedule_matrix[row_index][column_index] = appointment["status"]
        self._validate_rectangular_matrix(self._schedule_matrix)

    def _build_service_price_index(self) -> dict[str, int]:
        services_by_name: dict[str, int] = {}
        for service in self._services:
            services_by_name[service["name"]] = service["price"]
        return services_by_name

    def _build_dashboard_stats(self, services_by_name: dict[str, int]) -> dict[str, int]:
        today_revenue = 0
        confirmed_agenda = 0
        pending_checkins = 0
        appointment_index = 0

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

    def _summarize_schedule_matrix(self) -> dict:
        expected_columns = self._validate_rectangular_matrix(self._schedule_matrix)
        occupied_slots = 0
        free_slots = 0
        pending_slots = 0
        confirmed_slots = 0
        checkin_slots = 0

        # Vectores auxiliares para reportar carga por profesional y por horario.
        staff_load_vector = [0 for _ in self._staff_vector]
        time_load_vector = [0 for _ in self._time_slots_vector]

        # Ciclos anidados: el primer ciclo recorre filas y el segundo columnas.
        # Se usan para contar ocupacion total y generar el resumen global.
        for row_index in range(len(self._schedule_matrix)):
            for column_index in range(expected_columns):
                current_status = self._schedule_matrix[row_index][column_index]

                if current_status == FREE_SLOT:
                    free_slots += 1
                    continue

                occupied_slots += 1
                staff_load_vector[row_index] += 1
                time_load_vector[column_index] += 1

                if current_status == "pending":
                    pending_slots += 1
                elif current_status == "confirmed":
                    confirmed_slots += 1
                elif current_status == "checkin":
                    checkin_slots += 1

        busiest_staff = self._find_label_with_max_load(staff_load_vector, self._staff_vector)
        busiest_time = self._find_label_with_max_load(time_load_vector, self._time_slots_vector)

        return {
            "staffVector": deepcopy(self._staff_vector),
            "timeVector": deepcopy(self._time_slots_vector),
            "matrix": deepcopy(self._schedule_matrix),
            "rectangular": True,
            "totalSlots": len(self._staff_vector) * expected_columns,
            "occupiedSlots": occupied_slots,
            "freeSlots": free_slots,
            "pendingSlots": pending_slots,
            "confirmedSlots": confirmed_slots,
            "checkinSlots": checkin_slots,
            "busiestStaff": busiest_staff,
            "busiestTime": busiest_time,
        }

    def _run_schedule_load_test(self) -> dict:
        # Prueba basica de carga o procesamiento masivo. Se crea una copia mas
        # grande de la matriz real repitiendo filas para simular mayor volumen.
        synthetic_matrix: list[list[str]] = []

        for _ in range(LOAD_TEST_ROW_MULTIPLIER):
            for source_row in self._schedule_matrix:
                synthetic_matrix.append(list(source_row))

        simulated_columns = self._validate_rectangular_matrix(synthetic_matrix)
        processed_cells = 0
        occupied_cells_detected = 0

        # Nuevamente se usan ciclos anidados para recorrer toda la matriz
        # sintetica y demostrar que el algoritmo soporta varios registros.
        for row_index in range(len(synthetic_matrix)):
            for column_index in range(simulated_columns):
                processed_cells += 1
                if synthetic_matrix[row_index][column_index] != FREE_SLOT:
                    occupied_cells_detected += 1

        return {
            "simulatedRows": len(synthetic_matrix),
            "simulatedColumns": simulated_columns,
            "processedCells": processed_cells,
            "occupiedCellsDetected": occupied_cells_detected,
        }

    @staticmethod
    def _validate_rectangular_matrix(matrix: list[list[str]]) -> int:
        # Validacion de matriz rectangular: todas las filas deben tener la misma
        # cantidad de columnas antes de permitir cualquier procesamiento.
        if not matrix:
            return 0

        expected_columns = len(matrix[0])
        for row in matrix:
            if len(row) != expected_columns:
                raise HTTPException(status_code=500, detail="La matriz de agenda no es rectangular")

        return expected_columns

    @staticmethod
    def _find_label_with_max_load(load_vector: list[int], labels_vector: list[str]) -> str:
        if not load_vector or not labels_vector:
            return ""

        max_load = load_vector[0]
        max_index = 0
        for index in range(1, len(load_vector)):
            if load_vector[index] > max_load:
                max_load = load_vector[index]
                max_index = index

        return labels_vector[max_index]

    @staticmethod
    def _find_by_id(items: list[dict], item_id: int, label: str) -> dict:
        item_index = InMemoryStore._find_index_by_id(items, item_id, label)
        return items[item_index]

    @staticmethod
    def _find_index_by_id(items: list[dict], item_id: int, label: str) -> int:
        index = 0
        found_index = -1

        while index < len(items):
            current_item = items[index]
            if current_item["id"] == item_id:
                found_index = index
                break
            index += 1

        if found_index == -1:
            raise HTTPException(status_code=404, detail=f"{label} no encontrado")

        return found_index

    @staticmethod
    def _find_value_index(vector: list[str], target_value: str, label: str) -> int:
        # Busqueda lineal dentro de un vector del sistema. Se usa para ubicar la
        # fila o columna exacta que luego sera accedida en la matriz.
        index = 0
        while index < len(vector):
            if vector[index] == target_value:
                return index
            index += 1

        raise HTTPException(status_code=404, detail=f"{label} no encontrado en el vector")


store = InMemoryStore()
