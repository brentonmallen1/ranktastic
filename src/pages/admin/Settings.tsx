
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, LogOut, KeyRound, User, Settings as SettingsIcon, ArrowLeft, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { logout, updateCredentials, getAdminUsername, getSettings, updateSettings } from "@/lib/auth";

const credentialsSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const settingsSchema = z.object({
  allowPublicPolls: z.boolean(),
});

const AdminSettings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Get settings from localStorage
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    // Load current admin username
    const currentUsername = getAdminUsername();
    setUsername(currentUsername || "admin");
  }, []);

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: {
      username: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      allowPublicPolls: settings.allowPublicPolls,
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const onSubmit = async (values: z.infer<typeof credentialsSchema>) => {
    setIsLoading(true);
    
    try {
      const success = updateCredentials(
        values.username, 
        values.currentPassword, 
        values.newPassword
      );
      
      if (success) {
        toast({
          title: "Settings updated",
          description: "Your credentials have been updated successfully",
        });
        form.reset();
        setUsername(values.username);
      } else {
        toast({
          title: "Update failed",
          description: "Current password is incorrect",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveSettings = async (values: z.infer<typeof settingsSchema>) => {
    setIsSavingSettings(true);
    
    try {
      updateSettings({
        allowPublicPolls: values.allowPublicPolls,
      });
      
      setSettings(getSettings());
      
      toast({
        title: "Settings updated",
        description: "Application settings have been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving settings",
        variant: "destructive",
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold ml-2">Admin Settings</h1>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="account" onValueChange={setActiveTab} value={activeTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="account">
            <User className="mr-2 h-4 w-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="general">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Account Settings</CardTitle>
              <CardDescription>
                Update your account information and password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="mb-4 p-3 bg-muted rounded-md flex items-center">
                    <User className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Current Username</p>
                      <p className="text-sm text-muted-foreground">{username}</p>
                    </div>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Username</FormLabel>
                        <FormControl>
                          <Input placeholder="New username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Current password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="New password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Confirm new password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Save className="mr-2 h-4 w-4" />
                    {isLoading ? "Updating..." : "Update Credentials"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">General Settings</CardTitle>
              <CardDescription>
                Configure application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-4">
                  <FormField
                    control={settingsForm.control}
                    name="allowPublicPolls"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center">
                            <UserPlus className="mr-2 h-4 w-4 text-muted-foreground" />
                            <FormLabel className="font-medium">Allow Anyone to Create Polls</FormLabel>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            When enabled, anyone can create polls. When disabled, only admins can create polls.
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" className="w-full" disabled={isSavingSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSavingSettings ? "Saving..." : "Save Settings"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
