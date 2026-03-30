import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin, useCurrentUser } from '@/api/auth';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export function AdminLogin() {
  const navigate = useNavigate();
  const login = useLogin();
  const { data: user } = useCurrentUser();

  useEffect(() => {
    if (user) navigate('/admin');
  }, [user, navigate]);

  const form = useForm({ resolver: zodResolver(schema), defaultValues: { username: '', password: '' } });

  const onSubmit = async (values: { username: string; password: string }) => {
    await login.mutateAsync(values);
    navigate('/admin');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl><Input type="password" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {login.error && <p className="text-sm text-destructive">{login.error.message}</p>}
              <Button type="submit" className="w-full" disabled={login.isPending}>
                {login.isPending ? 'Logging in...' : 'Log In'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
