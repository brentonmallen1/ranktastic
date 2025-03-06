
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PollCreator from "@/components/PollCreator";
import { useDatabase } from "@/lib/db";

const CreatePoll = () => {
  const { initialize } = useDatabase();

  // Initialize database on mount
  useEffect(() => {
    initialize();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1 py-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">Create a New Poll</h1>
          <p className="text-muted-foreground mb-8">
            Create a ranked-choice poll to gather opinions and make decisions. 
            Add options, set an optional expiration date, and share with voters.
          </p>
          <PollCreator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreatePoll;
