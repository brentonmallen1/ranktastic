
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
          <PollCreator />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreatePoll;
