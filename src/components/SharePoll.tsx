
import { useState, useEffect } from "react";
import { Copy, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface SharePollProps {
  pollId: string;
  pollTitle: string;
}

const SharePoll = ({ pollId, pollTitle }: SharePollProps) => {
  const [pollUrl, setPollUrl] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Create the shareable URL
    const baseUrl = window.location.origin;
    setPollUrl(`${baseUrl}/poll/${pollId}`);
  }, [pollId]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl);
      toast({
        title: "Link Copied",
        description: "Poll link has been copied to your clipboard",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Failed to Copy",
        description: "Couldn't copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  // Share using Web Share API if available
  const sharePoll = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Rank Choice Poll: ${pollTitle}`,
          text: "Please vote in this rank choice poll",
          url: pollUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
        // Fall back to copy if sharing failed
        copyToClipboard();
      }
    } else {
      // Fall back to copy if Web Share API is not available
      copyToClipboard();
    }
  };

  return (
    <Card className="glass glass-hover animate-scale-in max-w-xl mx-auto transition-smooth">
      <CardHeader>
        <CardTitle className="text-xl">Share This Poll</CardTitle>
        <CardDescription>
          Share this link with anyone you want to vote in your poll
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            value={pollUrl}
            readOnly
            className="font-mono text-sm transition-smooth"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button variant="outline" size="icon" onClick={copyToClipboard} className="transition-smooth shrink-0">
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <Separator />

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button onClick={sharePoll} className="transition-smooth w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Share Poll
          </Button>
          
          <Button variant="outline" asChild className="transition-smooth w-full sm:w-auto">
            <a href={pollUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Poll
            </a>
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-2">
          This link will remain active even after the poll closes, and will automatically display results.
        </p>
      </CardContent>
    </Card>
  );
};

export default SharePoll;
