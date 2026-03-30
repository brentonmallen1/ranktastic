import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useAppSettings, useUpdateSettings } from '@/api/admin';
import { useChangePassword } from '@/api/auth';
import { useForm as useRhf } from 'react-hook-form';

export function AdminSettings() {
  const { data: settings } = useAppSettings();
  const updateSettings = useUpdateSettings();
  const changePassword = useChangePassword();

  const pwForm = useRhf({ defaultValues: { current_password: '', new_password: '' } });

  const allowPublic = settings?.allow_public_polls === 'true';

  const handleTogglePublic = () => {
    updateSettings.mutate({ allow_public_polls: String(!allowPublic) });
  };

  const handleChangePw = pwForm.handleSubmit(async (values) => {
    await changePassword.mutateAsync(values);
    pwForm.reset();
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Poll Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Allow Public Poll Creation</Label>
              <p className="text-sm text-muted-foreground">Anyone can create polls, not just admins.</p>
            </div>
            <Switch
              checked={allowPublic}
              onCheckedChange={handleTogglePublic}
              disabled={updateSettings.isPending}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePw} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" {...pwForm.register('current_password')} />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" {...pwForm.register('new_password')} />
            </div>
            {changePassword.error && (
              <p className="text-sm text-destructive">{changePassword.error.message}</p>
            )}
            {changePassword.isSuccess && (
              <p className="text-sm text-green-600">Password updated successfully.</p>
            )}
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
