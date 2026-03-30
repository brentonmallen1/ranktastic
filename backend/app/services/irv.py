"""
Instant Runoff Voting (IRV) algorithm.
Ported from the original TypeScript implementation in src/lib/db/results.ts.
"""
import json
from app.schemas.results import PollResults, RankingEntry, EliminationRound, VoteTransfer


def compute_results(poll_id: str, options: list[str], raw_votes: list[dict]) -> PollResults:
    """
    Compute IRV results from a list of votes.

    Args:
        poll_id: The poll's ID
        options: List of option strings for this poll
        raw_votes: List of dicts with 'rankings' key (JSON string or list)
    """
    # Parse rankings from raw votes
    votes: list[list[str]] = []
    for v in raw_votes:
        r = v["rankings"]
        if isinstance(r, str):
            r = json.loads(r)
        votes.append(r)

    if not votes:
        return PollResults(
            poll_id=poll_id,
            rankings=[RankingEntry(option=o, score=0) for o in options],
            total_votes=0,
            winner=None,
            first_choice_distribution={o: 0 for o in options},
            elimination_rounds=[],
        )

    # First choice distribution
    first_choice_distribution: dict[str, int] = {o: 0 for o in options}
    for rankings in votes:
        if rankings:
            first_choice_distribution[rankings[0]] = first_choice_distribution.get(rankings[0], 0) + 1

    # IRV elimination rounds
    remaining_options = list(options)
    elimination_rounds: list[EliminationRound] = []

    while len(remaining_options) > 1:
        scores: dict[str, int] = {o: 0 for o in remaining_options}

        for rankings in votes:
            # Find first remaining choice
            for choice in rankings:
                if choice in remaining_options:
                    scores[choice] = scores.get(choice, 0) + 1
                    break

        # Find option with lowest score to eliminate
        min_score = min(scores.values())
        option_to_eliminate = next(o for o in remaining_options if scores[o] == min_score)

        # Track where eliminated option's votes transfer to
        transfer_counts: dict[str, int] = {}
        for rankings in votes:
            for choice in rankings:
                if choice in remaining_options:
                    if choice == option_to_eliminate:
                        # Find this voter's next valid choice
                        next_choice = next(
                            (c for c in rankings
                             if c in remaining_options and c != option_to_eliminate),
                            "exhausted",
                        )
                        transfer_counts[next_choice] = transfer_counts.get(next_choice, 0) + 1
                    break

        transfers = [
            VoteTransfer(from_option=option_to_eliminate, to_option=to, count=count)
            for to, count in transfer_counts.items()
        ]

        elimination_rounds.append(
            EliminationRound(
                round=len(options) - len(remaining_options) + 1,
                eliminated=option_to_eliminate,
                scores=dict(scores),
                transfers=transfers,
            )
        )

        remaining_options = [o for o in remaining_options if o != option_to_eliminate]

    # Compute final Borda-style scores for full ranking
    final_scores: dict[str, int] = {}
    n = len(options)
    for rankings in votes:
        for i, option in enumerate(rankings):
            if option in final_scores:
                final_scores[option] += n - i
            else:
                final_scores[option] = n - i

    # Sort all options by score descending
    rankings_sorted = sorted(
        [RankingEntry(option=o, score=final_scores.get(o, 0)) for o in options],
        key=lambda r: r.score,
        reverse=True,
    )

    winner = remaining_options[0] if remaining_options else None

    return PollResults(
        poll_id=poll_id,
        rankings=rankings_sorted,
        total_votes=len(votes),
        winner=winner,
        first_choice_distribution=first_choice_distribution,
        elimination_rounds=elimination_rounds,
    )
