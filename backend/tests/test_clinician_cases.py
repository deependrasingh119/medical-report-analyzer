import asyncio

import httpx
import pytest

from backend.app.main import app


async def _request(
    method: str,
    path: str,
    *,
    headers: dict[str, str] | None = None,
    content: bytes | None = None,
) -> httpx.Response:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        return await client.request(
            method,
            path,
            headers=headers,
            content=content,
        )


def request(
    method: str,
    path: str,
    *,
    headers: dict[str, str] | None = None,
    content: bytes | None = None,
) -> httpx.Response:
    return asyncio.run(
        _request(method, path, headers=headers, content=content)
    )


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/demo/clinician/cases",
        "/api/v1/demo/clinician/cases/synthetic-case-001",
    ],
)
def test_case_routes_reject_missing_demo_role(path: str) -> None:
    response = request("GET", path)

    assert response.status_code == 401
    assert response.json() == {"detail": "Clinician demo role required"}


@pytest.mark.parametrize(
    "path",
    [
        "/api/v1/demo/clinician/cases",
        "/api/v1/demo/clinician/cases/synthetic-case-001",
    ],
)
def test_patient_demo_role_is_forbidden_without_echoing_role(path: str) -> None:
    response = request("GET", path, headers={"X-Demo-Role": "patient"})

    assert response.status_code == 403
    assert response.json() == {"detail": "Clinician demo role not authorized"}
    assert "patient" not in response.text.lower()


def test_unknown_demo_role_is_forbidden_without_echoing_value() -> None:
    role_marker = "unexpected-role-marker"
    response = request(
        "GET",
        "/api/v1/demo/clinician/cases",
        headers={"X-Demo-Role": role_marker},
    )

    assert response.status_code == 403
    assert role_marker not in response.text


def test_case_list_is_deterministic_fixed_and_labeled_synthetic() -> None:
    headers = {"X-Demo-Role": "clinician"}
    first = request("GET", "/api/v1/demo/clinician/cases", headers=headers)
    second = request("GET", "/api/v1/demo/clinician/cases", headers=headers)

    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
    body = first.json()
    assert body["mode"] == "synthetic-demo"
    assert body["data_label"] == "fictional synthetic cases"
    assert body["read_only"] is True
    assert [case["case_id"] for case in body["cases"]] == [
        "synthetic-case-001",
        "synthetic-case-002",
    ]
    assert all(case["data_label"] == "fictional synthetic case" for case in body["cases"])


def test_case_detail_is_deterministic_and_contains_prepared_questions() -> None:
    headers = {"X-Demo-Role": "clinician"}
    path = "/api/v1/demo/clinician/cases/synthetic-case-001"
    first = request("GET", path, headers=headers)
    second = request("GET", path, headers=headers)

    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()
    body = first.json()
    assert body["mode"] == "synthetic-demo"
    assert body["read_only"] is True
    assert body["case"]["case_id"] == "synthetic-case-001"
    assert body["case"]["data_label"] == "fictional synthetic case"
    assert body["case"]["prepared_summary"]
    assert body["case"]["prepared_questions"]
    assert body["case"]["clinician_review_context"] is True
    assert "diagnosis" in body["safety_notice"].lower()
    assert "treatment" in body["safety_notice"].lower()


def test_unknown_case_id_returns_generic_not_found_after_role_check() -> None:
    unknown_id = "unknown-case-marker"
    response = request(
        "GET",
        f"/api/v1/demo/clinician/cases/{unknown_id}",
        headers={"X-Demo-Role": "clinician"},
    )

    assert response.status_code == 404
    assert response.json() == {"detail": "Synthetic demo case not found"}
    assert unknown_id not in response.text


def test_case_routes_have_no_request_body_and_reject_post_payloads() -> None:
    openapi = request("GET", "/openapi.json")
    assert openapi.status_code == 200
    paths = openapi.json()["paths"]
    list_operation = paths["/api/v1/demo/clinician/cases"]["get"]
    detail_operation = paths["/api/v1/demo/clinician/cases/{case_id}"]["get"]
    assert set(paths["/api/v1/demo/clinician/cases"]) == {"get"}
    assert set(paths["/api/v1/demo/clinician/cases/{case_id}"]) == {"get"}
    assert "requestBody" not in list_operation
    assert "requestBody" not in detail_operation
    assert {
        (parameter["name"], parameter["in"])
        for parameter in list_operation["parameters"]
    } == {("X-Demo-Role", "header")}
    assert {
        (parameter["name"], parameter["in"])
        for parameter in detail_operation["parameters"]
    } == {("case_id", "path"), ("X-Demo-Role", "header")}
    assert all(
        parameter["required"]
        for operation in (list_operation, detail_operation)
        for parameter in operation["parameters"]
    )

    marker = b"DO_NOT_ECHO_DEMO_CASE_PAYLOAD"
    for path in (
        "/api/v1/demo/clinician/cases",
        "/api/v1/demo/clinician/cases/synthetic-case-001",
    ):
        response = request(
            "POST",
            path,
            headers={"X-Demo-Role": "clinician"},
            content=marker,
        )
        assert response.status_code == 405
        assert marker.decode() not in response.text
