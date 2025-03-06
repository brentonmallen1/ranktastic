
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AdminOpenPolls from "@/components/admin/AdminOpenPolls";
import AdminClosedPolls from "@/components/admin/AdminClosedPolls";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("open");

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="container py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
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
