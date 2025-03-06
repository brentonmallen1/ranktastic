
import { useEffect, useState } from "react";
import { Circle, Info, PieChart, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { format } from "date-fns";
import { computeResults, getPoll, getVotesForPoll } from "@/lib/db";
import type { Poll } from "@/lib/db";

interface PollResultsProps {
  pollId: string;
}

interface ResultsData {
  rankings: Array<{ option: string; score: number }>;
  totalVotes: number;
  statistics: {
    firstChoiceDistribution: Record<string, number>;
    eliminationRounds: Array<{
      round: number;
      eliminated: string;
      scores: Record<string, number>;
    }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

const PollResults = ({ pollId }: PollResultsProps) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollAndResults = async () => {
      try {
        setLoading(true);
        
        // Get poll data
        const pollData = await getPoll(pollId);
        if (!pollData) {
          setError("Poll not found");
          return;
        }
        
        setPoll(pollData);
        
        // Compute results
        const resultsData = await computeResults(pollId);
        setResults(resultsData);
      } catch (error) {
        console.error("Error fetching poll results:", error);
        setError("Failed to load poll results");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPollAndResults();
  }, [pollId]);

  // Convert first choice distribution to chart data
  const getPieChartData = () => {
    if (!results) return [];
    
    return Object.entries(results.statistics.firstChoiceDistribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  // Convert final rankings to chart data
  const getBarChartData = () => {
    if (!results) return [];
    
    return results.rankings.map(({ option, score }) => ({
      name: option,
      score,
    }));
  };

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "No expiration";
    return format(new Date(date), "PPP");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 animate-pulse">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground">Loading results...</h3>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <h3 className="text-lg font-medium text-destructive">{error || "An error occurred"}</h3>
          <p className="text-muted-foreground mt-2">Unable to load poll results</p>
        </div>
      </div>
    );
  }

  const totalVotes = results?.totalVotes || 0;

  return (
    <Card className="glass glass-hover animate-scale-in max-w-5xl mx-auto transition-smooth">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">{poll.title} Results</CardTitle>
            <CardDescription>
              {poll.description || "Poll results and statistics"}
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5">
              <Circle className="h-3 w-3 fill-current" /> 
              Status: {poll.isOpen ? "Open" : "Closed"}
            </Badge>
            
            <Badge variant="outline" className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" /> 
              {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {totalVotes === 0 ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-medium">No votes yet</h3>
            <p className="text-muted-foreground mt-2">
              This poll hasn't received any votes yet.
            </p>
          </div>
        ) : (
          <Tabs defaultValue="rankings" className="space-y-6">
            <TabsList className="grid grid-cols-3 max-w-md mx-auto">
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rankings" className="animate-fade-in">
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-center">Final Rankings</h3>
                
                <div className="space-y-2">
                  {results?.rankings.map(({ option, score }, index) => (
                    <div 
                      key={option}
                      className={`flex items-center p-4 rounded-lg border ${index === 0 ? 'bg-primary/10 border-primary/20' : 'bg-background/50'} transition-smooth`}
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/90 text-primary-foreground font-medium mr-4">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className={`font-medium ${index === 0 ? 'text-primary' : ''}`}>
                          {option}
                        </h4>
                        
                        <div className="text-sm text-muted-foreground mt-1">
                          Score: {score} points
                        </div>
                      </div>
                      
                      {index === 0 && (
                        <Badge className="ml-2 bg-primary/90">Winner</Badge>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Info className="h-4 w-4" />
                          How rankings are calculated
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>
                          Rankings are calculated using instant-runoff voting method. The option with the most points wins, where points are awarded based on rank position across all votes.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="animate-fade-in">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-center mb-4">First Choice Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={getPieChartData()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} votes`, 'Count']} />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium text-center mb-4">Final Ranking Scores</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getBarChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => [`${value} points`, 'Score']} />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8">
                          {getBarChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="details" className="animate-fade-in">
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Poll Information</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Created</dt>
                          <dd>{format(new Date(poll.createdAt), "PPP")}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Expires</dt>
                          <dd>{formatDate(poll.expiresAt)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Status</dt>
                          <dd>{poll.isOpen ? "Open" : "Closed"}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Total Votes</dt>
                          <dd>{totalVotes}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Options</dt>
                          <dd>{poll.options.length}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">Elimination Rounds</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {results?.statistics.eliminationRounds.length === 0 ? (
                        <p className="text-center text-muted-foreground">
                          No elimination rounds to display
                        </p>
                      ) : (
                        <ScrollArea className="h-[140px]">
                          <div className="space-y-2">
                            {results?.statistics.eliminationRounds.map((round, index) => (
                              <HoverCard key={index}>
                                <HoverCardTrigger asChild>
                                  <div className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer transition-smooth">
                                    <span>Round {round.round}</span>
                                    <span className="text-destructive">Eliminated: {round.eliminated}</span>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Round {round.round} Details</h4>
                                    <div className="text-sm">
                                      {Object.entries(round.scores).map(([option, score]) => (
                                        <div key={option} className="flex justify-between">
                                          <span className={option === round.eliminated ? 'text-destructive' : ''}>
                                            {option}
                                          </span>
                                          <span>{score} vote{score !== 1 ? 's' : ''}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>
                    Rankings are calculated using the instant-runoff voting method, where the option with the fewest first-choice votes is eliminated in each round, and votes are redistributed to voters' next choices.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default PollResults;
