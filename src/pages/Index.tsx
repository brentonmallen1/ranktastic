import { useNavigate } from "react-router-dom";
import { BarChart3, PieChart, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HowItWorks from "@/components/HowItWorks";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        <HeroSection />
        
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Key Features</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to run successful ranked choice polls
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="glass glass-hover transition-smooth animate-scale-in">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Vote className="h-5 w-5" />
                </div>
                <CardTitle>Simple Voting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Intuitive drag-and-drop interface makes it easy for voters to rank their choices in order of preference.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass glass-hover transition-smooth animate-scale-in animation-delay-100">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PieChart className="h-5 w-5" />
                </div>
                <CardTitle>Detailed Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive results with charts, elimination rounds, and statistical breakdowns of the voting data.
                </p>
              </CardContent>
            </Card>
            
            <Card className="glass glass-hover transition-smooth animate-scale-in animation-delay-200">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <CardTitle>Instant Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Results are calculated and displayed in real-time as votes come in, with automatic updating.
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mb-8">
              Create your first ranked choice poll in seconds. No account required.
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate("/create")}
              className="transition-smooth"
            >
              Create a Poll
            </Button>
          </div>
        </div>
        
        <HowItWorks />
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
