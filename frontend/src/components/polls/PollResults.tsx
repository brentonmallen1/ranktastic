import { Check, ChevronDown, Circle, Info, TrendingUp, X } from 'lucide-react';
import { VoteFlowSankey } from './VoteFlowSankey';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { usePoll, usePollResults } from '@/api/polls';
import { useCurrentUser } from '@/api/auth';
import { usePollVotes } from '@/api/votes';

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
  'var(--color-chart-8)',
];

interface PollResultsProps {
  pollId: string;
}

export function PollResults({ pollId }: PollResultsProps) {
  const { data: poll, isLoading: pollLoading } = usePoll(pollId);
  const { data: results, isLoading: resultsLoading } = usePollResults(pollId);
  const { data: currentUser } = useCurrentUser();
  const isAdmin = !!currentUser;
  const { data: votes = [] } = usePollVotes(pollId, isAdmin);

  if (pollLoading || resultsLoading) {
    return (
      <Card className="max-w-5xl mx-auto">
        <CardHeader>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-9 w-full max-w-lg mx-auto" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!poll || !results) {
    return <div className="flex items-center justify-center h-48 text-destructive">Failed to load results</div>;
  }

  const pieData = Object.entries(results.first_choice_distribution).map(([name, value], i) => ({
    name, value, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));
  const barData = results.rankings.map(({ option, score }, i) => ({
    name: option, score, fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{poll.title} — Results</CardTitle>
            <CardDescription>{poll.description || 'Poll results and statistics'}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Circle className="h-3 w-3 fill-current" />
              {poll.is_open ? 'Open' : 'Closed'}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              {results.total_votes} vote{results.total_votes !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {results.total_votes === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No votes yet</h3>
            <p className="text-muted-foreground mt-2">This poll hasn't received any votes yet.</p>
          </div>
        ) : (
          <Tabs defaultValue={results.elimination_rounds.length > 0 ? 'flow' : 'rankings'} className="space-y-6">
            <TabsList className={`grid max-w-lg mx-auto ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
              <TabsTrigger value="flow">Vote Flow</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              {isAdmin && <TabsTrigger value="participants">Participants</TabsTrigger>}
            </TabsList>

            <TabsContent value="flow">
              {results.elimination_rounds.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No elimination rounds — the winner was determined directly.
                </div>
              ) : (
                <VoteFlowSankey results={results} />
              )}
            </TabsContent>

            <TabsContent value="rankings">
              <div className="space-y-6">
                {results.winner && (
                  <p className="text-center text-lg font-semibold text-primary">Winner: {results.winner}</p>
                )}
                <div className="space-y-2">
                  {results.rankings.map(({ option, score }, index) => {
                    const description = poll.options.find((o) => o.name === option)?.description;
                    const isWinner = index === 0;
                    return (
                      <Collapsible key={option}>
                        <div className={`flex items-center p-4 rounded-lg border ${isWinner ? 'bg-primary/10 border-primary/20' : 'bg-background/50'} ${description ? '[&:has([data-state=open])]:rounded-b-none' : ''}`}>
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground font-medium mr-4 text-sm shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-medium ${isWinner ? 'text-primary' : ''}`}>{option}</h4>
                            <div className="text-sm text-muted-foreground">{score} points</div>
                          </div>
                          {isWinner && <Badge className="ml-2">Winner</Badge>}
                          {description && (
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="ml-2 h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground [&[data-state=open]>svg]:rotate-180"
                                aria-label="Toggle description"
                              >
                                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                              </Button>
                            </CollapsibleTrigger>
                          )}
                        </div>
                        {description && (
                          <CollapsibleContent>
                            <div className={`px-4 pb-3 pt-2 text-sm text-muted-foreground border border-t-0 rounded-b-lg ${isWinner ? 'border-primary/20 bg-primary/5' : 'border-border'}`}>
                              {description}
                            </div>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    );
                  })}
                </div>
                <div className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Info className="h-4 w-4" /> How rankings work
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        Rankings use instant-runoff voting. Points are awarded by rank position across all votes.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-center mb-4">First Choice Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" />
                        <RechartsTooltip formatter={(v) => [`${v} votes`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium text-center mb-4">Final Ranking Scores</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v: string) => v.length > 20 ? v.slice(0, 20) + '…' : v}
                        />
                        <YAxis />
                        <RechartsTooltip formatter={(v) => [`${v} points`, 'Score']} />
                        <Legend verticalAlign="top" />
                        <Bar dataKey="score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Poll Info</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created</span>
                          <span>{format(new Date(poll.created_at), 'PPP')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires</span>
                          <span>{poll.expires_at ? format(new Date(poll.expires_at), 'PPP') : 'No expiration'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status</span>
                          <span>{poll.is_open ? 'Open' : 'Closed'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Votes</span>
                          <span>{results.total_votes}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">Elimination Rounds</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {results.elimination_rounds.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">No elimination rounds</p>
                      ) : (
                        <ScrollArea className="h-36">
                          <div className="space-y-1">
                            {results.elimination_rounds.map((round) => (
                              <HoverCard key={round.round}>
                                <HoverCardTrigger asChild>
                                  <div className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer text-sm">
                                    <span>Round {round.round}</span>
                                    <span className="text-destructive">Out: {round.eliminated}</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-64">
                                  <h4 className="font-medium mb-2 text-sm">Round {round.round}</h4>
                                  {Object.entries(round.scores).map(([opt, score]) => (
                                    <div key={opt} className="flex justify-between text-sm">
                                      <span className={opt === round.eliminated ? 'text-destructive' : ''}>{opt}</span>
                                      <span>{score} votes</span>
                                    </div>
                                  ))}
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
                <p className="text-center text-sm text-muted-foreground">
                  Rankings use instant-runoff voting — the lowest-ranked option is eliminated each round, and votes redistribute to voters' next choices.
                </p>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="participants">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">
                      Voted <span className="text-muted-foreground font-normal">({votes.length})</span>
                    </h3>
                    {votes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No votes yet.</p>
                    ) : (
                      <div className="rounded-md border divide-y text-sm">
                        {votes.map(v => (
                          <div key={v.id} className="flex items-center justify-between px-4 py-2.5 gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                              <span className="font-medium truncate">{v.voter_name || v.voter_email}</span>
                              {v.voter_name && (
                                <span className="text-muted-foreground truncate hidden sm:block">{v.voter_email}</span>
                              )}
                            </div>
                            <span className="text-muted-foreground text-xs shrink-0">
                              {format(new Date(v.created_at), 'MMM d, h:mm a')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {poll.is_private && poll.invited_emails.length > 0 && (() => {
                    const votedEmails = new Set(votes.map(v => v.voter_email.toLowerCase()));
                    const pending = poll.invited_emails.filter(e => !votedEmails.has(e.toLowerCase()));
                    return (
                      <div>
                        <h3 className="text-sm font-semibold mb-3">
                          Invited — not yet voted <span className="text-muted-foreground font-normal">({pending.length})</span>
                        </h3>
                        {pending.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Everyone has voted!</p>
                        ) : (
                          <div className="rounded-md border divide-y text-sm">
                            {pending.map(email => (
                              <div key={email} className="flex items-center gap-2 px-4 py-2.5">
                                <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground">{email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
