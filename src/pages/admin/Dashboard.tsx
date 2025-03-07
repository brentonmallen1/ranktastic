
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, Home, RefreshCw } from "lucide-react";

import { logout } from "@/lib/auth";
import { useDatabase } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminOpenPolls from "@/components/admin/AdminOpenPolls";
import AdminFinalizedPolls from "@/components/admin/AdminClosedPolls";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("open");
  const { initialized, retry, initializing, initializationError } = useDatabase();
  const retryAttempted = useRef(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleRetry = () => {
    retryAttempted.current = false;
    retry();
  };

  if (!initialized) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[80vh] py-8 mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Connecting to Database...</h2>
          <p className="text-gray-500 mb-6">Please wait while we connect to the backend server.</p>
          {initializing ? (
            <div className="flex justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <p className="text-red-500">Failed to connect to the database server.</p>
              {initializationError && <p className="text-sm text-red-400">{initializationError}</p>}
              <Button onClick={handleRetry}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry Connection
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </div>
          )}
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
          <TabsTrigger value="finalized">Finalized Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="open">
          <AdminOpenPolls />
        </TabsContent>
        <TabsContent value="finalized">
          <AdminFinalizedPolls />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
