import { Link } from 'react-router-dom';
import { BarChart2, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/api/auth';

export function Home() {
  const { data: user } = useCurrentUser();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <BarChart2 className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-4">Ranktastic</h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Help you and your friends finally make a decision — with ranked choice voting.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
        <Button size="lg" asChild>
          <Link to="/create">Create a Poll</Link>
        </Button>
        {!user && (
          <Button size="lg" variant="outline" asChild>
            <Link to="/admin/login">Admin Login</Link>
          </Button>
        )}
      </div>
      <div className="grid sm:grid-cols-3 gap-6 text-left">
        {[
          { icon: Zap, title: 'Easy to Use', desc: 'Create a poll in seconds, share the link with anyone.' },
          { icon: Users, title: 'Fair Voting', desc: 'Instant-runoff voting ensures the most-preferred option wins.' },
          { icon: BarChart2, title: 'Clear Results', desc: 'See rankings, charts, and elimination rounds in detail.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="p-6 rounded-lg border bg-card">
            <Icon className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
