
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle, Copy, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const HeroSection = () => {
  const [pollId, setPollId] = useState("");
  const [isPolling, setIsPolling] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle poll ID input
  const handlePollIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPollId(e.target.value);
  };

  // Navigate to poll
  const goToPoll = () => {
    if (!pollId.trim()) {
      toast({
        title: "Enter Poll ID",
        description: "Please enter a valid poll ID to continue",
        variant: "destructive",
      });
      return;
    }
    
    setIsPolling(true);
    
    // Add a small delay to simulate checking
    setTimeout(() => {
      setIsPolling(false);
      navigate(`/poll/${pollId}`);
    }, 300);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      goToPoll();
    }
  };

  return (
    <div className="relative overflow-hidden py-20 md:py-32">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="animate-fade-in">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Simple Ranked Choice <span className="text-primary">Voting</span>
            </h1>
            
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Create polls, share with anyone, and see results instantly.
              No login required.
            </p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in animation-delay-200">
            <Button 
              size="lg" 
              onClick={() => navigate("/create")}
              className="transition-smooth group"
            >
              Create a Poll
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <div className="flex">
              <Input
                type="text"
                placeholder="Enter Poll ID"
                value={pollId}
                onChange={handlePollIdChange}
                onKeyDown={handleKeyDown}
                className="rounded-r-none transition-smooth"
              />
              <Button 
                variant="secondary" 
                onClick={goToPoll} 
                disabled={isPolling}
                className="rounded-l-none transition-smooth"
              >
                {isPolling ? "Checking..." : "Go"}
              </Button>
            </div>
          </div>
          
          <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3 text-left animate-fade-in animation-delay-300">
            <Card className="glass glass-hover transition-smooth">
              <CardContent className="p-6 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Ranked Choice Voting</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Let voters rank options in order of preference for more accurate results.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass glass-hover transition-smooth">
              <CardContent className="p-6 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Copy className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">Shareable Links</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Share a single link that works for both voting and viewing results.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass glass-hover transition-smooth sm:col-span-2 md:col-span-1">
              <CardContent className="p-6 flex flex-col items-center sm:items-start text-center sm:text-left">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-medium">No Login Required</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Quick and easy to use. No account creation needed for voting or creating polls.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
