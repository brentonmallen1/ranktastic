from pydantic import BaseModel


class VoteTransfer(BaseModel):
    from_option: str
    to_option: str  # "exhausted" if voter had no more rankings
    count: int


class EliminationRound(BaseModel):
    round: int
    eliminated: str
    scores: dict[str, int]
    transfers: list[VoteTransfer] = []


class RankingEntry(BaseModel):
    option: str
    score: int


class PollResults(BaseModel):
    poll_id: str
    rankings: list[RankingEntry]
    total_votes: int
    winner: str | None
    first_choice_distribution: dict[str, int]
    elimination_rounds: list[EliminationRound]
