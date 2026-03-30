import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVerifyVote } from '@/api/votes';

export function VerifyVote() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const verifyVote = useVerifyVote();
  const [pollId, setPollId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    verifyVote.mutate(token, {
      onSuccess: (data) => {
        if (data.poll_id) setPollId(data.poll_id);
      },
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <h2 className="text-xl font-semibold">Invalid Link</h2>
            <p className="text-muted-foreground">This verification link is missing a token.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verifyVote.isPending) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">Verifying your vote...</CardContent>
        </Card>
      </div>
    );
  }

  if (verifyVote.isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardContent className="py-8 text-center space-y-4">
            <h2 className="text-xl font-semibold">Verification Failed</h2>
            <p className="text-muted-foreground">This link may have already been used or has expired.</p>
            <Button variant="outline" asChild>
              <Link to="/">Go Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Vote Verified!</h2>
          <p className="text-muted-foreground">Your vote has been confirmed and counted.</p>
          {pollId ? (
            <Button asChild>
              <Link to={`/poll/${pollId}`}>View Poll Results</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/">Go Home</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
