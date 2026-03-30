import { useRef, useState } from 'react';
import { Copy, Share2, Check, UserPlus, X, QrCode, Download } from 'lucide-react';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUpdatePoll } from '@/api/polls';
import type { Poll } from '@/types';

interface SharePollProps {
  poll: Poll;
}

export function SharePoll({ poll }: SharePollProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [justAdded, setJustAdded] = useState('');
  const qrRef = useRef<HTMLDivElement>(null);
  const updatePoll = useUpdatePoll(poll.id);
  const url = `${window.location.origin}/poll/${poll.id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'Vote on this poll', url });
    } else {
      copy();
    }
  };

  const downloadQr = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `poll-${poll.id}-qr.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const addInvite = async () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      setInviteError('Invalid email address');
      return;
    }
    if (poll.invited_emails.includes(trimmed)) {
      setInviteError('Already invited');
      return;
    }
    await updatePoll.mutateAsync({ invited_emails: [...poll.invited_emails, trimmed] });
    setInviteEmail('');
    setInviteError('');
    setJustAdded(trimmed);
    setTimeout(() => setJustAdded(''), 3000);
  };

  const removeInvite = async (email: string) => {
    await updatePoll.mutateAsync({ invited_emails: poll.invited_emails.filter((e) => e !== email) });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={url}
          className="flex-1 text-sm bg-muted rounded-md px-3 py-2 text-muted-foreground truncate"
        />
        <Button variant="outline" size="icon" onClick={copy} title="Copy link">
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="icon" onClick={share} title="Share">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setShowQr((v) => !v)} title="QR Code">
          <QrCode className="h-4 w-4" />
        </Button>
      </div>

      {showQr && (
        <div className="flex flex-col items-center gap-2 py-2">
          <div ref={qrRef} className="p-3 bg-white rounded-lg border">
            <QRCode value={url} size={160} />
          </div>
          <Button variant="outline" size="sm" onClick={downloadQr}>
            <Download className="h-3.5 w-3.5 mr-1" />Download QR
          </Button>
        </div>
      )}

      {poll.is_private && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">This poll is invite-only. Add emails to grant access:</p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="voter@example.com"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInvite(); } }}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={addInvite}
              disabled={updatePoll.isPending}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
          {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
          {justAdded && <p className="text-xs text-green-600 dark:text-green-400">{justAdded} added</p>}
          {poll.invited_emails.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {poll.invited_emails.map((email) => (
                <Badge key={email} variant="secondary" className="gap-1 pr-1 text-xs">
                  {email}
                  <button
                    type="button"
                    onClick={() => removeInvite(email)}
                    disabled={updatePoll.isPending}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
