
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Settings, Home } from "lucide-react";

import { logout } from "@/lib/auth";
import { useDatabase } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminOpenPolls from "@/components/admin/AdminOpenPolls";
import AdminClosedPolls from "@/components/admin/AdminClosedPolls";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("open");
  const { initialized, initialize } = useDatabase();
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    // Initialize the database if not already initialized
    const initDb = async () => {
      if (!initialized) {
        const success = await initialize();
        if (!success) {
          toast({
            title: "Database Error",
            description: "Failed to initialize the database. Please refresh the page.",
            variant: "destructive",
          });
        }
        setDbInitialized(success);
      } else {
        setDbInitialized(true);
      }
    };
    
    initDb();
  }, [initialized, initialize, toast]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (!dbInitialized) {
    return (
      <div className="container py-8 mx-auto">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Initializing Database...</h2>
          <p className="text-gray-500">Please wait while we set up your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            <Home className="mr-2 h-4 w-4" />
            Main Site
          </Button>
          <h1 className="text-3xl font-bold ml-2">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs defaultValue="open" onValueChange={setActiveTab} value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="open">Open Polls</TabsTrigger>
          <TabsTrigger value="closed">Closed Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          <AdminOpenPolls />
        </TabsContent>
        <TabsContent value="closed">
          <AdminClosedPolls />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
