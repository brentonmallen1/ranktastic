
import { Link } from "react-router-dom";
import { ChevronDown, BarChart3, Plus, List, Home, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm transition-smooth">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">RankChoice</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-smooth">
            Home
          </Link>
          <Link to="/create" className="text-muted-foreground hover:text-foreground transition-smooth">
            Create Poll
          </Link>
          <Link to="/help" className="text-muted-foreground hover:text-foreground transition-smooth">
            How It Works
          </Link>
        </nav>
        
        <div className="flex items-center gap-2">
          <Link to="/admin/login">
            <Button variant="outline" className="transition-smooth">
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline-block">Sign In</span>
            </Button>
          </Link>
          
          <Link to="/create">
            <Button className="transition-smooth">
              <Plus className="h-4 w-4 mr-2" />
              <span>New Poll</span>
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden transition-smooth">
                <List className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Poll
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/help">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  How It Works
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
