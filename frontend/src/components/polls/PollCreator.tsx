import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, X, ChevronDown, AlignLeft } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useCreatePoll } from '@/api/polls';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  options: z.array(z.object({
    name: z.string().min(1, 'Option cannot be empty').max(50, 'Option name cannot exceed 50 characters'),
    description: z.string().max(250, 'Description cannot exceed 250 characters'),
  })).min(2, 'At least 2 options required'),
  expires_at: z.string().optional(),
  is_private: z.boolean(),
  require_email_verification: z.boolean(),
  allow_vote_editing: z.boolean(),
  randomize_options: z.boolean(),
});

type FormValues = {
  title: string;
  description: string;
  options: { name: string; description: string }[];
  expires_at?: string;
  is_private: boolean;
  require_email_verification: boolean;
  allow_vote_editing: boolean;
  randomize_options: boolean;
};

export function PollCreator() {
  const navigate = useNavigate();
  const createPoll = useCreatePoll();
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [inviteError, setInviteError] = useState('');

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: {
      title: '',
      description: '',
      options: [{ name: '', description: '' }, { name: '', description: '' }, { name: '', description: '' }],
      is_private: false,
      require_email_verification: false,
      allow_vote_editing: false,
      randomize_options: false,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'options' });
  const isPrivate = form.watch('is_private');
  const watchedOptions = form.watch('options');

  const addInviteEmail = () => {
    const trimmed = inviteEmail.trim().toLowerCase();
    if (!trimmed) return;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(trimmed)) {
      setInviteError('Invalid email address');
      return;
    }
    if (invitedEmails.includes(trimmed)) {
      setInviteError('Email already added');
      return;
    }
    setInvitedEmails([...invitedEmails, trimmed]);
    setInviteEmail('');
    setInviteError('');
  };

  const removeInviteEmail = (email: string) => {
    setInvitedEmails(invitedEmails.filter((e) => e !== email));
  };

  const onSubmit = async (values: FormValues) => {
    const poll = await createPoll.mutateAsync({
      title: values.title,
      description: values.description,
      options: values.options.map((o) => ({ name: o.name, description: o.description || undefined })),
      expires_at: values.expires_at || null,
      is_private: values.is_private,
      invited_emails: values.is_private ? invitedEmails : [],
      require_email_verification: values.require_email_verification,
      allow_vote_editing: values.allow_vote_editing,
      randomize_options: values.randomize_options,
    });
    navigate(`/poll/${poll.id}`);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Poll</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poll Title <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="What should we decide?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add context or instructions..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-3">
              <FormLabel>Options <span className="text-destructive">*</span></FormLabel>
              {fields.map((field, index) => (
                <Collapsible key={field.id} className="rounded-md border p-3 space-y-2">
                  <div className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`options.${index}.name`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Option ${index + 1}`} {...field} />
                          </FormControl>
                          <div className="flex justify-between items-center">
                            <FormMessage />
                            {(watchedOptions[index]?.name?.length ?? 0) > 0 && (
                              <span className={`text-xs ml-auto ${(watchedOptions[index]?.name?.length ?? 0) > 50 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {watchedOptions[index]?.name?.length ?? 0}/50
                              </span>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <CollapsibleTrigger asChild>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-0.5 shrink-0 [&[data-state=open]>svg]:rotate-180"
                              aria-label="Toggle description"
                            >
                              <AlignLeft className="h-4 w-4 text-muted-foreground transition-none" />
                            </Button>
                          </TooltipTrigger>
                        </CollapsibleTrigger>
                        <TooltipContent>Add description</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {fields.length > 2 && (
                      <Button type="button" variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => remove(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <CollapsibleContent>
                    <FormField
                      control={form.control}
                      name={`options.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Description (optional)"
                              className="text-sm min-h-[60px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="flex justify-between items-center">
                            <FormMessage />
                            {(watchedOptions[index]?.description?.length ?? 0) > 0 && (
                              <span className={`text-xs ml-auto ${(watchedOptions[index]?.description?.length ?? 0) > 250 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                {watchedOptions[index]?.description?.length ?? 0}/250
                              </span>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => append({ name: '', description: '' })}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Access & Voting Settings</h3>

              <FormField
                control={form.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="cursor-pointer">Invite-only</FormLabel>
                        <p className="text-xs text-muted-foreground">Only people you invite can vote</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              {isPrivate && (
                <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                  <FormLabel>Invited Emails</FormLabel>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="voter@example.com"
                      value={inviteEmail}
                      onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInviteEmail(); } }}
                    />
                    <Button type="button" variant="outline" onClick={addInviteEmail}>Add</Button>
                  </div>
                  {inviteError && <p className="text-xs text-destructive">{inviteError}</p>}
                  {invitedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {invitedEmails.map((email) => (
                        <Badge key={email} variant="secondary" className="gap-1 pr-1">
                          {email}
                          <button type="button" onClick={() => removeInviteEmail(email)} className="ml-1 hover:text-destructive" aria-label={`Remove ${email}`}>
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <FormField
                control={form.control}
                name="require_email_verification"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="cursor-pointer">Require email verification</FormLabel>
                        <p className="text-xs text-muted-foreground">Voters must click a link in their email to confirm their vote</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allow_vote_editing"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="cursor-pointer">Allow vote editing</FormLabel>
                        <p className="text-xs text-muted-foreground">Voters can return and change their rankings</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="randomize_options"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <div>
                        <FormLabel className="cursor-pointer">Randomize option order</FormLabel>
                        <p className="text-xs text-muted-foreground">Shuffle options for each voter to reduce position bias</p>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {createPoll.error && (
              <p className="text-sm text-destructive">{createPoll.error.message}</p>
            )}
            <Button type="submit" className="w-full" disabled={createPoll.isPending}>
              {createPoll.isPending ? 'Creating...' : 'Create Poll'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
