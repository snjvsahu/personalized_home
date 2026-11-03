"""FastAPI application for home-screen personalization decisions."""

from fastapi import FastAPI, HTTPException

from decision_engine.decision.service import HomeScreenDecisionService
from decision_engine.schemas.context import HomeScreenDecisionRequest
from decision_engine.schemas.response import HomeScreenDecisionResponse

app = FastAPI(
    title="Telecom Home Screen Decision Engine",
    version="0.1.0",
    description="Returns ranked hero, notifications, and quick links with reason codes.",
)

_service = HomeScreenDecisionService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/v1/decisions/home-screen",
    response_model=HomeScreenDecisionResponse,
    summary="Personalized home screen slots",
)
def post_home_screen_decision(body: HomeScreenDecisionRequest) -> HomeScreenDecisionResponse:
    try:
        return _service.decide(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
