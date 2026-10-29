import asyncio

import httpx

from backend.app.main import app


async def _request(
    method: str,
    path: str,
    *,
    headers: dict[str, str] | None = None,
    json: dict[str, str] | None = None,
) -> httpx.Response:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="http://testserver",
    ) as client:
        return await client.request(method, path, headers=headers, json=json)


def request(
    method: str,
    path: str,
    *,
    headers: dict[str, str] | None = None,
    json: dict[str, str] | None = None,
) -> httpx.Response:
    return asyncio.run(_request(method, path, headers=headers, json=json))


def test_health_endpoint_returns_demo_status() -> None:
    response = request("GET", "/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "carelens-demo-api",
        "mode": "synthetic-demo",
    }


def test_health_endpoint_is_read_only() -> None:
    response = request("POST", "/api/v1/health", json={"report": "synthetic"})

    assert response.status_code == 405


def test_cors_allows_only_configured_local_frontend_origin() -> None:
    trusted = request(
        "OPTIONS",
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
    )
    untrusted = request(
        "OPTIONS",
        "/api/v1/health",
        headers={
            "Origin": "https://untrusted.example",
            "Access-Control-Request-Method": "GET",
        },
    )

    assert trusted.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert untrusted.headers.get("access-control-allow-origin") is None


def test_cors_allows_demo_role_header_for_local_frontend() -> None:
    response = request(
        "OPTIONS",
        "/api/v1/demo/clinician/cases",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "x-demo-role",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "x-demo-role" in response.headers["access-control-allow-headers"].lower()


def test_openapi_exposes_health_explanation_and_clinician_demo_routes() -> None:
    response = request("GET", "/openapi.json")

    assert response.status_code == 200
    assert set(response.json()["paths"]) == {
        "/api/v1/health",
        "/api/v1/demo/explanation",
        "/api/v1/demo/clinician/cases",
        "/api/v1/demo/clinician/cases/{case_id}",
    }
