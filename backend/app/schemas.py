from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

AppointmentStatus = Literal["confirmed", "checkin", "pending"]
StaffStatus = Literal["active", "off"]
ServiceCategory = Literal["Corte", "Barba", "Combo", "Color", "Tratamiento"]


class Service(BaseModel):
    id: int
    name: str
    category: ServiceCategory
    price: int = Field(gt=0)
    duration: int = Field(gt=0)
    popular: bool = False


class ServiceCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    category: ServiceCategory
    price: int = Field(gt=0)
    duration: int = Field(default=30, gt=0)


class StaffMember(BaseModel):
    id: int
    name: str
    role: str
    specialty: str
    initials: str
    status: StaffStatus
    clients: int = Field(ge=0)
    rating: float = Field(ge=0, le=5)


class StaffCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    role: str = Field(min_length=2, max_length=80)
    specialty: str = Field(default="", max_length=120)


class StaffStatusUpdate(BaseModel):
    status: StaffStatus


class Appointment(BaseModel):
    id: int
    client: str
    initials: str
    service: str
    barber: str
    time: str
    duration: int = Field(gt=0)
    status: AppointmentStatus
    visits: int = Field(ge=0)


class AppointmentStatusUpdate(BaseModel):
    status: AppointmentStatus


class DashboardStats(BaseModel):
    todayRevenue: int = Field(ge=0)
    todayClients: int = Field(ge=0)
    avgTicket: int = Field(ge=0)
    occupancy: int = Field(ge=0, le=100)
    pendingCheckins: int = Field(ge=0)
    activeProfessionals: int = Field(ge=0)


class DashboardSummary(BaseModel):
    stats: DashboardStats
    appointments: list[Appointment]
    staff: list[StaffMember]
