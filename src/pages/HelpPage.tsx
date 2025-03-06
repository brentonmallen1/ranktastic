
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";

const HelpPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container">
          <h1 className="text-3xl font-bold mb-6">How Rank Choice Voting Works</h1>
          <HowItWorks />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpPage;
