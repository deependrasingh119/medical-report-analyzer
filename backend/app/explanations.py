from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel


class ExplanationHighlight(BaseModel):
    label: str
    synthetic_value: str
    example_reference_interval: str
    note: str


class SyntheticExplanation(BaseModel):
    mode: Literal["synthetic-demo"]
    fixture_id: Literal["synthetic-blood-count-01"]
    title: str
    illustrative_only: Literal[True]
    clinician_review_required: Literal[True]
    summary: str
    highlights: list[ExplanationHighlight]
    discussion_questions: list[str]
    safety_notice: str


router = APIRouter(tags=["synthetic-demo"])

_DEMO_EXPLANATION = SyntheticExplanation(
    mode="synthetic-demo",
    fixture_id="synthetic-blood-count-01",
    title="Illustrative blood-count example",
    illustrative_only=True,
    clinician_review_required=True,
    summary=(
        "This fixed, fictional example shows how a result can be displayed "
        "beside an example reference interval. It does not interpret real reports."
    ),
    highlights=[
        ExplanationHighlight(
            label="Hemoglobin",
            synthetic_value="13.4 g/dL",
            example_reference_interval="12.0–16.0 g/dL",
            note=(
                "In this synthetic sample, the value falls within the example "
                "interval. Laboratory intervals and individual context can vary."
            ),
        )
    ],
    discussion_questions=[
        "How does this laboratory's reference interval apply to my results?",
        "Which results should I discuss in the context of my health history?",
    ],
    safety_notice=(
        "Synthetic demo only; illustrative, not a diagnosis, triage, or treatment "
        "recommendation, and not a substitute for professional care. A qualified "
        "clinician must review real reports."
    ),
)


@router.get(
    "/demo/explanation",
    response_model=SyntheticExplanation,
    summary="Return a fixed synthetic example explanation",
    description=(
        "Returns a deterministic, source-code fixture. This endpoint accepts no "
        "report data, file, query, or request body."
    ),
)
def get_demo_explanation() -> SyntheticExplanation:
    return _DEMO_EXPLANATION
