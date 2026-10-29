import asyncio

import httpx

from backend.app.main import app


async def _request(
    method: str,
    path: str,
    *,
    content: bytes | None = None,
    headers: dict[str, str] | None = None,
) -> httpx.Response:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        return await client.request(method, path, content=content, headers=headers)


def request(
    method: str,
    path: str,
    *,
    content: bytes | None = None,
    headers: dict[str, str] | None = None,
) -> httpx.Response:
    return asyncio.run(
        _request(method, path, content=content, headers=headers)
    )


def test_demo_explanation_is_static_and_clearly_bounded() -> None:
    response = request("GET", "/api/v1/demo/explanation")

    assert response.status_code == 200
    body = response.json()
    assert body["mode"] == "synthetic-demo"
    assert body["fixture_id"] == "synthetic-blood-count-01"
    assert body["illustrative_only"] is True
    assert body["clinician_review_required"] is True
    assert body["highlights"]
    assert body["discussion_questions"]
    assert "not a diagnosis" in body["safety_notice"].lower()
    assert "treatment" in body["safety_notice"].lower()


def test_demo_explanation_is_deterministic() -> None:
    first = request("GET", "/api/v1/demo/explanation")
    second = request("GET", "/api/v1/demo/explanation")

    assert first.status_code == second.status_code == 200
    assert first.json() == second.json()


def test_demo_explanation_does_not_accept_a_report_body() -> None:
    marker = b"DO_NOT_ECHO_TEST_PAYLOAD"
    response = request(
        "POST",
        "/api/v1/demo/explanation",
        content=marker,
        headers={"Content-Type": "application/octet-stream"},
    )

    assert response.status_code == 405
    assert marker.decode() not in response.text


def test_demo_explanation_openapi_has_no_request_body() -> None:
    response = request("GET", "/openapi.json")

    assert response.status_code == 200
    operation = response.json()["paths"]["/api/v1/demo/explanation"]["get"]
    assert "requestBody" not in operation
    assert "parameters" not in operation
