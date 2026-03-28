from __future__ import annotations

from fastapi import APIRouter

from ..schemas import DashboardSummary
from ..store import store

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard_summary() -> DashboardSummary:
    return store.get_dashboard_summary()
