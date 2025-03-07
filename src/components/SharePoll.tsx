
import { useState, useEffect } from "react";
import { Copy, Share2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface SharePollProps {
  pollId: string;
  pollTitle: string;
  compact?: boolean;
}

const SharePoll = ({ pollId, pollTitle, compact = false }: SharePollProps) => {
  const [pollUrl, setPollUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Create the shareable URL - ensure we're using the correct format
    const baseUrl = window.location.origin;
    const pollPath = `/poll/${pollId}`;
    setPollUrl(`${baseUrl}${pollPath}`);
    
    // Log for debugging
    console.log("Share poll URL generated:", `${baseUrl}${pollPath}`);
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

  // Compact version (just a share button with popover)
  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1 transition-smooth">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium">Share Poll</h4>
            <div className="flex items-center gap-2">
              <Input
                value={pollUrl}
                readOnly
                className="font-mono text-sm h-9"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard} className="h-9 w-9 shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between gap-2">
              <Button onClick={sharePoll} size="sm" className="w-1/2">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" asChild className="w-1/2">
                <a href={pollUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </a>
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Standard expandable card version
  return (
    <Card className="glass glass-hover animate-scale-in max-w-xl mx-auto transition-smooth">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Share This Poll</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>
        {!isExpanded && 
          <CardDescription className="pb-3">
            Share this link with anyone you want to vote in your poll
          </CardDescription>
        }
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4 pt-3">
          <CardDescription>
            Share this link with anyone you want to vote in your poll
          </CardDescription>
          
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
      )}
    </Card>
  );
};

export default SharePoll;
