import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RankableOptions } from './RankableOptions';
import { useSubmitVote, useVoterStatus } from '@/api/votes';
import { EmailPrompt } from './EmailPrompt';
import type { Poll, PollOption } from '@/types';

const emailSchema = z.object({
  voter_email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const voteSchema = z.object({
  voter_name: z.string().optional(),
  rankings: z.array(z.string()).min(1, 'Please rank at least one option'),
});

type EmailFormValues = z.infer<typeof emailSchema>;
type VoteFormValues = { voter_name?: string; rankings: string[] };

interface VotingFormProps {
  poll: Poll;
}

function seededShuffle<T>(arr: T[], seed: string): T[] {
  // Simple seeded Fisher-Yates using djb2 hash
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h) ^ seed.charCodeAt(i);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h ^= h >>> 15;
    const j = Math.abs(h) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function VotingForm({ poll }: VotingFormProps) {
  const optionNames = poll.options.map((o) => o.name);
  const [email, setEmail] = useState('');
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [rankedOptions, setRankedOptions] = useState(optionNames);
  const [submitted, setSubmitted] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);

  const submitVote = useSubmitVote();
  const { data: voterStatus, isFetching: checkingStatus } = useVoterStatus(
    poll.id,
    emailConfirmed ? email : ''
  );

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { voter_email: '' },
  });

  const voteForm = useForm<VoteFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(voteSchema) as any,
    defaultValues: { voter_name: '', rankings: optionNames },
  });

  const onEmailSubmit = (values: EmailFormValues) => {
    setEmail(values.voter_email);
    setEmailConfirmed(true);
    if (poll.randomize_options) {
      const shuffled = seededShuffle(optionNames, values.voter_email);
      setRankedOptions(shuffled);
      voteForm.setValue('rankings', shuffled);
    }
  };

  // Once voter status loads, pre-fill rankings if editing
  const existingVote = voterStatus?.vote;
  const hasVoted = voterStatus?.has_voted ?? false;

  const handleEditVote = () => {
    if (existingVote) {
      setRankedOptions(existingVote.rankings);
      voteForm.setValue('rankings', existingVote.rankings);
      voteForm.setValue('voter_name', existingVote.voter_name ?? '');
    }
  };

  const onVoteSubmit = async (values: VoteFormValues) => {
    await submitVote.mutateAsync({
      poll_id: poll.id,
      voter_name: values.voter_name || null,
      voter_email: email,
      rankings: values.rankings,
    });
    setSubmitted(true);
    if (!poll.require_email_verification) {
      setShowEmailPrompt(false);
    }
  };

  if (submitted) {
    if (poll.require_email_verification) {
      return (
        <Card>
          <CardContent className="py-8 text-center space-y-2">
            <h3 className="text-xl font-semibold">Check your email!</h3>
            <p className="text-muted-foreground">
              We sent a verification link to <strong>{email}</strong>. Click it to confirm your vote.
            </p>
          </CardContent>
        </Card>
      );
    }
    if (showEmailPrompt) {
      return <EmailPrompt pollId={poll.id} onDone={() => setShowEmailPrompt(false)} />;
    }
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-2">
          <h3 className="text-xl font-semibold">Thank you for voting!</h3>
          <p className="text-muted-foreground">Your vote has been recorded.</p>
        </CardContent>
      </Card>
    );
  }

  // Step 1: collect email
  if (!emailConfirmed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cast Your Vote</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="voter_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">Used to prevent duplicate votes.</p>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Continue</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: check status
  if (checkingStatus) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">Checking voter status...</CardContent>
      </Card>
    );
  }

  // Already voted and editing not allowed
  if (hasVoted && !poll.allow_vote_editing) {
    return (
      <Card>
        <CardContent className="py-8 text-center space-y-2">
          <h3 className="text-lg font-semibold">You've already voted</h3>
          <p className="text-muted-foreground">This poll doesn't allow vote editing.</p>
        </CardContent>
      </Card>
    );
  }

  // Already voted and editing allowed — prompt to edit or keep
  if (hasVoted && poll.allow_vote_editing && existingVote && voteForm.getValues('rankings').join() === optionNames.join()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Update Your Vote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            You've already voted. Your current ranking is shown below. You can update it.
          </p>
          <div className="rounded-md border p-3 text-sm space-y-1">
            {existingVote.rankings.map((r, i) => (
              <div key={r} className="flex gap-2">
                <span className="text-muted-foreground w-5">{i + 1}.</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
          <Button className="w-full" onClick={handleEditVote}>Edit My Vote</Button>
        </CardContent>
      </Card>
    );
  }

  // Step 3: vote form (new vote or edit)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{hasVoted ? 'Edit Your Vote' : 'Cast Your Vote'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...voteForm}>
          <form onSubmit={voteForm.handleSubmit(onVoteSubmit)} className="space-y-6">
            <FormField
              control={voteForm.control}
              name="voter_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Input placeholder="How you'd like to appear" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <RankableOptions form={voteForm as any} rankedOptions={rankedOptions} setRankedOptions={setRankedOptions} pollOptions={poll.options} />
            {submitVote.error && (
              <p className="text-sm text-destructive">{submitVote.error.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={submitVote.isPending}>
              {submitVote.isPending
                ? 'Submitting...'
                : hasVoted
                ? 'Update Vote'
                : 'Submit Vote'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
