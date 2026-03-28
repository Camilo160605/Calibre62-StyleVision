from __future__ import annotations

from fastapi import APIRouter, Response, status

from ..schemas import Service, ServiceCreate
from ..store import store

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[Service])
def list_services() -> list[Service]:
    return store.list_services()


@router.post("", response_model=Service, status_code=status.HTTP_201_CREATED)
def create_service(payload: ServiceCreate) -> Service:
    return store.create_service(payload)


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_service(service_id: int) -> Response:
    store.delete_service(service_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
