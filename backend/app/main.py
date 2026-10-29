from typing import Literal

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.app.clinician_cases import router as clinician_cases_router
from backend.app.explanations import router as explanations_router


class HealthStatus(BaseModel):
    status: Literal["ok"]
    service: Literal["carelens-demo-api"]
    mode: Literal["synthetic-demo"]


app = FastAPI(
    title="CareLens Demo API",
    description=(
        "Synthetic-demo API foundation only. This service does not accept or "
        "process medical reports or personal health information."
    ),
    version="1.0.0",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Demo-Role"],
)

api_router = APIRouter()


@api_router.get(
    "/health",
    response_model=HealthStatus,
    tags=["health"],
    summary="Report API process status",
)
def get_health() -> HealthStatus:
    return HealthStatus(
        status="ok",
        service="carelens-demo-api",
        mode="synthetic-demo",
    )


app.include_router(api_router, prefix="/api/v1")
app.include_router(explanations_router, prefix="/api/v1")
app.include_router(clinician_cases_router, prefix="/api/v1")
