
import { Link } from "react-router-dom";
import { BarChart3, Github, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t py-6 md:py-8">
      <div className="container flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link to="/" className="flex items-center gap-1">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-medium">RankChoice</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            A simple, elegant rank choice voting application.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:gap-6">
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="text-muted-foreground hover:underline underline-offset-4 transition-smooth">
              Home
            </Link>
            <Link to="/create" className="text-muted-foreground hover:underline underline-offset-4 transition-smooth">
              Create Poll
            </Link>
            <Link to="/help" className="text-muted-foreground hover:underline underline-offset-4 transition-smooth">
              How It Works
            </Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-smooth"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
      
      <div className="container mt-6 border-t pt-6">
        <p className="text-center text-xs text-muted-foreground">
          <span className="flex items-center justify-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive" /> Self-hostable, privacy-focused, and open source.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
