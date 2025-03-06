
import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { isAuthenticated } from "@/lib/auth";

const AdminNavLink = () => {
  const authenticated = isAuthenticated();
  
  return (
    <Button variant="ghost" asChild size="sm">
      <Link to={authenticated ? "/admin" : "/admin/login"} className="flex items-center gap-1">
        <Shield className="h-4 w-4" />
        {authenticated ? "Admin Dashboard" : "Admin Login"}
      </Link>
    </Button>
  );
};

export default AdminNavLink;
