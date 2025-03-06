
import { ArrowDown, BarChart3, ListOrdered, Share2, UserCheck, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    title: "Create a Poll",
    description: "Enter a title, description, and list of options for your poll. You can set an optional expiration date.",
    icon: ListOrdered,
  },
  {
    title: "Share with Voters",
    description: "Share a single link with all your voters. No account creation or login required.",
    icon: Share2,
  },
  {
    title: "Collect Ranked Votes",
    description: "Voters rank their choices in preference order by dragging options or using arrows.",
    icon: Vote,
  },
  {
    title: "View Results",
    description: "See instant results with detailed analytics and visualizations of the voting outcome.",
    icon: BarChart3,
  },
];

const HowItWorks = () => {
  return (
    <div className="py-16 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Our rank choice voting system is simple to use and provides powerful insights
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="mb-8 relative">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-8 w-8" />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-medium">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute left-8 top-16 bottom-0 items-center justify-center">
                  <div className="w-0.5 h-16 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-medium mb-4">What is Ranked Choice Voting?</h3>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
            Ranked choice voting allows voters to rank candidates in order of preference. If no candidate receives a majority of first-choice votes, the candidate with the fewest first-choice votes is eliminated, and those votes are redistributed to the voters' next choices. This process continues until a candidate receives a majority.
          </p>
          
          <Button asChild size="lg" className="transition-smooth">
            <Link to="/create">
              Create Your First Poll
              <ArrowDown className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
