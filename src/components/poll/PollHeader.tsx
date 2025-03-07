
import React from "react";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import type { Poll } from "@/lib/db";

interface PollHeaderProps {
  poll: Poll;
}

const PollHeader = ({ poll }: PollHeaderProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">{poll.title}</CardTitle>
        <CardDescription>{poll.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Created: {format(new Date(poll.createdAt), "PPP")}
          </div>
          {poll.expiresAt && (
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              Expires: {format(new Date(poll.expiresAt), "PPP p")}
            </div>
          )}
          <div className="flex items-center">
            Status: <span className={`ml-1 ${poll.isOpen ? "text-green-600" : "text-red-600"}`}>
              {poll.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PollHeader;
