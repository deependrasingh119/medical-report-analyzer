"""Read-only clinician review of fixed synthetic demo cases.

The X-Demo-Role header is a demo boundary only; it is not authentication.
"""

from typing import Annotated, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel


class SyntheticClinicianCase(BaseModel):
    case_id: Literal["synthetic-case-001", "synthetic-case-002"]
    title: str
    data_label: Literal["fictional synthetic case"]
    prepared_summary: str
    prepared_questions: list[str]
    clinician_review_context: Literal[True]


class SyntheticClinicianCaseList(BaseModel):
    mode: Literal["synthetic-demo"]
    data_label: Literal["fictional synthetic cases"]
    read_only: Literal[True]
    cases: list[SyntheticClinicianCase]


class SyntheticClinicianCaseDetail(BaseModel):
    mode: Literal["synthetic-demo"]
    read_only: Literal[True]
    case: SyntheticClinicianCase
    safety_notice: str


_DEMO_CASES: tuple[SyntheticClinicianCase, ...] = (
    SyntheticClinicianCase(
        case_id="synthetic-case-001",
        title="Example visit-preparation summary A",
        data_label="fictional synthetic case",
        prepared_summary=(
            "A fictional demo patient prepared a short summary to discuss "
            "during a clinician visit."
        ),
        prepared_questions=[
            "Which parts of my visit-preparation notes should we review together?",
            "What additional context would help explain these fictional examples?",
        ],
        clinician_review_context=True,
    ),
    SyntheticClinicianCase(
        case_id="synthetic-case-002",
        title="Example visit-preparation summary B",
        data_label="fictional synthetic case",
        prepared_summary=(
            "A second fictional demo patient organized questions for a "
            "conversation with a qualified clinician."
        ),
        prepared_questions=[
            "How should I organize questions for a future clinician visit?",
            "Which details should I clarify with a qualified clinician?",
        ],
        clinician_review_context=True,
    ),
)

_CASES_BY_ID = {case.case_id: case for case in _DEMO_CASES}
_SAFETY_NOTICE = (
    "Synthetic demo only; these fictional preparation notes are not a diagnosis, "
    "triage, or treatment recommendation. A qualified clinician must review "
    "real health information."
)

router = APIRouter(
    prefix="/demo/clinician/cases",
    tags=["synthetic-clinician-demo"],
)


def require_clinician_demo_role(
    request: Request,
) -> None:
    """Enforce the explicitly non-production demo role header."""
    demo_role = request.headers.get("X-Demo-Role")
    if demo_role is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Clinician demo role required",
        )
    if demo_role != "clinician":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Clinician demo role not authorized",
        )


ClinicianDemoRole = Annotated[None, Depends(require_clinician_demo_role)]
_ROLE_HEADER_OPENAPI = [
    {
        "name": "X-Demo-Role",
        "in": "header",
        "required": True,
        "description": "Demo-only role boundary; not production authentication.",
        "schema": {"type": "string", "enum": ["clinician"]},
    }
]


@router.get(
    "",
    response_model=SyntheticClinicianCaseList,
    summary="List fixed synthetic clinician demo cases",
    description=(
        "Read-only source-code fixtures. Requires the demo-only "
        "X-Demo-Role: clinician header; it is not production authentication. "
        "This operation accepts no request body or client-supplied case data."
    ),
    openapi_extra={"parameters": _ROLE_HEADER_OPENAPI},
)
def list_clinician_demo_cases(
    _: ClinicianDemoRole,
) -> SyntheticClinicianCaseList:
    return SyntheticClinicianCaseList(
        mode="synthetic-demo",
        data_label="fictional synthetic cases",
        read_only=True,
        cases=[case.model_copy(deep=True) for case in _DEMO_CASES],
    )


@router.get(
    "/{case_id}",
    response_model=SyntheticClinicianCaseDetail,
    summary="Read one fixed synthetic clinician demo case",
    description=(
        "Read-only source-code fixture. Requires the demo-only "
        "X-Demo-Role: clinician header; it is not production authentication. "
        "This operation accepts no request body or client-supplied case data."
    ),
    openapi_extra={"parameters": _ROLE_HEADER_OPENAPI},
)
def get_clinician_demo_case(
    case_id: str,
    _: ClinicianDemoRole,
) -> SyntheticClinicianCaseDetail:
    case = _CASES_BY_ID.get(case_id)
    if case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Synthetic demo case not found",
        )

    return SyntheticClinicianCaseDetail(
        mode="synthetic-demo",
        read_only=True,
        case=case.model_copy(deep=True),
        safety_notice=_SAFETY_NOTICE,
    )
