import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSubscribeNotification } from '@/api/admin';

interface EmailPromptProps {
  pollId: string;
  onDone: () => void;
}

export function EmailPrompt({ pollId, onDone }: EmailPromptProps) {
  const [email, setEmail] = useState('');
  const subscribe = useSubscribeNotification();

  const handleSubscribe = async () => {
    if (email) {
      await subscribe.mutateAsync({ poll_id: pollId, email });
    }
    onDone();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your vote has been recorded!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Would you like to be notified when this poll closes and results are in?
        </p>
        <Input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="flex gap-2">
          <Button onClick={handleSubscribe} disabled={subscribe.isPending} className="flex-1">
            {subscribe.isPending ? 'Subscribing...' : 'Notify me'}
          </Button>
          <Button variant="ghost" onClick={onDone}>No thanks</Button>
        </div>
      </CardContent>
    </Card>
  );
}
