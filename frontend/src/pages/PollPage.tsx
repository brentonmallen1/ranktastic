import { useParams } from 'react-router-dom';
import { usePoll } from '@/api/polls';
import { VotingForm } from '@/components/voting/VotingForm';
import { PollResults } from '@/components/polls/PollResults';
import { SharePoll } from '@/components/polls/SharePoll';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PollPage() {
  const { id } = useParams<{ id: string }>();
  const { data: poll, isLoading, error } = usePoll(id!);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-8 space-y-4">
            <Skeleton className="h-6 w-32 mx-auto" />
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[20vh] text-destructive">
            Poll not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{poll.title}</h1>
          <Badge variant={poll.is_open ? 'default' : 'secondary'}>
            {poll.is_open ? 'Open' : 'Closed'}
          </Badge>
        </div>
        {poll.description && <p className="text-muted-foreground">{poll.description}</p>}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm font-medium text-muted-foreground">Share this poll</p>
        </CardHeader>
        <CardContent>
          <SharePoll poll={poll} />
        </CardContent>
      </Card>

      {poll.is_open ? (
        <VotingForm poll={poll} />
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center text-sm text-muted-foreground">
          This poll is closed. Results are shown below.
        </div>
      )}

      <PollResults pollId={poll.id} />
    </div>
  );
}
