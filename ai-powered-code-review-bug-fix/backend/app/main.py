"""Prism Review API: GitHub PR ingestion, AI review orchestration, and test generation."""
from contextlib import asynccontextmanager
from typing import Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


class ReviewRequest(BaseModel):
    repository: str = Field(examples=["acme-payments"])
    pull_number: int = Field(gt=0, examples=[184])


class Finding(BaseModel):
    id: str
    severity: Literal["critical", "warning", "info"]
    category: str
    title: str
    explanation: str
    file_path: str
    line: int
    suggestion: str


class Review(BaseModel):
    id: str
    repository: str
    pull_number: int
    status: Literal["queued", "running", "complete", "failed"]
    summary: str
    findings: list[Finding]


DEMO_FINDINGS = [
    Finding(
        id="finding_01", severity="critical", category="Correctness",
        title="Race condition in balance update",
        explanation="Two concurrent transfers can read the same balance before either write completes. Lock the source account inside one database transaction.",
        file_path="services/ledger.ts", line=48,
        suggestion="Fetch the account with SELECT ... FOR UPDATE, debit and credit in the same transaction, then commit.",
    ),
    Finding(
        id="finding_02", severity="warning", category="Security",
        title="Missing input validation",
        explanation="Validate the destination account identifier before passing it to the repository layer.",
        file_path="api/transfers.ts", line=22,
        suggestion="Reject malformed UUIDs with a 400 response at the API boundary.",
    ),
]


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Initialize database connections and background workers here in production.
    yield


app = FastAPI(title="Prism Review API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/auth/github")
async def github_auth():
    """OAuth entry point. Redirect to GitHub after configuring client credentials."""
    return {"message": "Configure GITHUB_CLIENT_ID and redirect to GitHub OAuth here."}


@app.post("/reviews", response_model=Review, status_code=201)
async def create_review(request: ReviewRequest):
    """Queue a PR review. Replace demo findings with GitHub diff + LLM provider output."""
    return Review(
        id=f"review_{request.repository}_{request.pull_number}",
        repository=request.repository,
        pull_number=request.pull_number,
        status="complete",
        summary="Analyzed 6 files · 214 changed lines · 2 actionable findings",
        findings=DEMO_FINDINGS,
    )


@app.get("/reviews/{review_id}", response_model=Review)
async def get_review(review_id: str):
    if not review_id.startswith("review_"):
        raise HTTPException(status_code=404, detail="Review not found")
    return Review(id=review_id, repository="acme-payments", pull_number=184,
                  status="complete", summary="Review complete", findings=DEMO_FINDINGS)


@app.post("/findings/{finding_id}/tests")
async def generate_regression_test(finding_id: str):
    if finding_id != "finding_01":
        raise HTTPException(status_code=404, detail="Finding not found")
    return {"finding_id": finding_id, "language": "typescript", "test": """it('serializes concurrent transfers', async () => {
  await Promise.all([transfer(input), transfer(input)])
  expect(await account.balance()).toBe(0)
})"""}
