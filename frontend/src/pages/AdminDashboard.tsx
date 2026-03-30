import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, BarChart2, Activity, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PollCard } from '@/components/admin/PollCard';
import { usePolls } from '@/api/polls';
import { useAdminStats } from '@/api/admin';

export function AdminDashboard() {
  const { data: polls = [], isLoading } = usePolls();
  const { data: stats } = useAdminStats();
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? polls.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : polls;
  const openPolls = filtered.filter((p) => p.is_open);
  const closedPolls = filtered.filter((p) => !p.is_open);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button asChild>
          <Link to="/create"><Plus className="h-4 w-4 mr-1" />New Poll</Link>
        </Button>
      </div>

      {polls.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Polls', value: stats.total_polls, icon: BarChart2 },
            { label: 'Open Polls', value: stats.open_polls, icon: Activity },
            { label: 'Total Votes', value: stats.total_votes, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Loading polls...</p>
      ) : polls.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No polls yet.</p>
          <Button asChild><Link to="/create">Create your first poll</Link></Button>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-muted-foreground">No polls match "{search}".</p>
      ) : (
        <div className="space-y-6">
          {openPolls.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Open Polls</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {openPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
              </div>
            </div>
          )}
          {closedPolls.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold mb-3">Closed Polls</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {closedPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
