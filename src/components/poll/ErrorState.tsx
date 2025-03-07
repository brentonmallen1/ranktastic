
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string | null;
}

const ErrorState = ({ error }: ErrorStateProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl py-16 mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">
        {error || "An error occurred"}
      </h2>
      <p className="mb-8">We couldn't find the poll you're looking for.</p>
      <Button onClick={() => navigate("/")}>Return Home</Button>
    </div>
  );
};

export default ErrorState;
