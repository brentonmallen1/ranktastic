import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Unlock, Trash2, BarChart2, Users, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useClosePoll, useReopenPoll, useDeletePoll, useClearVotes, useClonePoll } from '@/api/polls';
import type { Poll } from '@/types';
import { format } from 'date-fns';

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  const navigate = useNavigate();
  const close = useClosePoll();
  const reopen = useReopenPoll();
  const deletePoll = useDeletePoll();
  const clearVotes = useClearVotes();
  const clonePoll = useClonePoll();

  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">
              <Link to={`/poll/${poll.id}`} className="hover:underline">{poll.title}</Link>
            </CardTitle>
            <Badge variant={poll.is_open ? 'default' : 'secondary'}>
              {poll.is_open ? 'Open' : 'Closed'}
            </Badge>
          </div>
          {poll.description && (
            <p className="text-sm text-muted-foreground truncate">{poll.description}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{poll.vote_count} vote{poll.vote_count !== 1 ? 's' : ''}</span>
            <span>{poll.options.length} options</span>
            {poll.expires_at && (
              <span>Expires {format(new Date(poll.expires_at), 'MMM d')}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/poll/${poll.id}`}><BarChart2 className="h-3.5 w-3.5 mr-1" />View</Link>
            </Button>
            {poll.is_open ? (
              <Button variant="outline" size="sm" onClick={() => close.mutate(poll.id)} disabled={close.isPending}>
                <Lock className="h-3.5 w-3.5 mr-1" />Close
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => reopen.mutate(poll.id)} disabled={reopen.isPending}>
                <Unlock className="h-3.5 w-3.5 mr-1" />Reopen
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const newPoll = await clonePoll.mutateAsync(poll.id);
                navigate(`/poll/${newPoll.id}`);
              }}
              disabled={clonePoll.isPending}
            >
              <Copy className="h-3.5 w-3.5 mr-1" />Clone
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setConfirmClear(true)}
            >
              Clear Votes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={confirmClear} onOpenChange={setConfirmClear}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all votes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all votes for "{poll.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => clearVotes.mutate(poll.id)}
            >
              Clear Votes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{poll.title}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this poll and all its votes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletePoll.mutate(poll.id)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
