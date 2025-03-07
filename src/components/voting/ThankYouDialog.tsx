
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2, Mail, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitVote, hasVoted } from "@/lib/db";
import { getBaseUrl } from "@/lib/db/config";

interface ThankYouDialogProps {
  isOpen: boolean;
  pollId: string;
  voterName: string;
  onClose: () => void;
}

const ThankYouDialog = ({ isOpen, pollId, voterName, onClose }: ThankYouDialogProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const baseUrl = getBaseUrl();
      const shareUrl = `${baseUrl}/poll/${pollId}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Poll link has been copied to clipboard",
      });
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast({
        title: "Failed to Copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSubmitEmail = async () => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if email has already been used to vote
      const alreadyVoted = await hasVoted(pollId, email);
      
      if (alreadyVoted) {
        toast({
          title: "Email Already Used",
          description: "This email has already been used to vote on this poll",
          variant: "destructive",
        });
      } else {
        // Update the original vote with the email
        await submitVote({
          pollId: pollId,
          voterName: voterName,
          voterEmail: email,
          rankings: [], // These will be ignored as this is just updating the email
        });
        
        toast({
          title: "Email Saved",
          description: "You'll be notified when this poll is finalized",
        });
        
        onClose();
      }
    } catch (error) {
      console.error("Failed to update vote with email:", error);
      toast({
        title: "Error",
        description: "Failed to save your email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Thank You for Voting!</DialogTitle>
          <DialogDescription className="text-center">
            Your vote has been recorded successfully.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Poll Link
                </>
              )}
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="block">
              Get notified when this poll is finalized
            </Label>
            <div className="flex space-x-2">
              <Input
                id="email"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleSubmitEmail}
                disabled={isSubmitting}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : "Notify Me"}
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-center">
          <Button 
            variant="secondary" 
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouDialog;
