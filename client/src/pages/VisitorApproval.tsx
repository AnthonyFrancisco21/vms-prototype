import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle, User, MapPin, Target, Loader2, AlertCircle } from "lucide-react";

interface VisitorApprovalData {
  id: string;
  name: string;
  destinationName: string | null;
  personToVisit: string;
  purpose: string;
  approvalStatus: string | null;
}

export default function VisitorApproval() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [responded, setResponded] = useState(false);
  const [responseType, setResponseType] = useState<"approved" | "denied" | null>(null);

  const { data: visitor, isLoading, error } = useQuery<VisitorApprovalData>({
    queryKey: ["/api/visitors/approval", token],
    enabled: !!token,
  });

  const approvalMutation = useMutation({
    mutationFn: async (response: "approved" | "denied") => {
      const res = await apiRequest("POST", "/api/visitors/approval", { token, response });
      return res.json();
    },
    onSuccess: (_, response) => {
      setResponded(true);
      setResponseType(response);
      toast({
        title: response === "approved" ? "Visitor Approved" : "Visitor Denied",
        description: response === "approved" 
          ? "The visitor has been approved to enter."
          : "The visitor has been denied entry.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Loading visitor details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !visitor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Link Invalid or Expired</h2>
            <p className="text-muted-foreground">
              This approval link is no longer valid. The visitor may have already been processed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (visitor.approvalStatus !== "pending" || responded) {
    const isApproved = responseType === "approved" || visitor.approvalStatus === "approved";
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            {isApproved ? (
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-600 mb-4" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-red-600 mb-4" />
            )}
            <h2 className="text-2xl font-semibold mb-2">
              {isApproved ? "Visitor Approved" : "Visitor Denied"}
            </h2>
            <p className="text-muted-foreground">
              {isApproved 
                ? "The visitor has been approved. Reception has been notified."
                : "The visitor has been denied entry. Reception has been notified."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Allow Visitor?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Visitor Name</p>
                <p className="font-medium" data-testid="text-visitor-name">{visitor.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Destination</p>
                <p className="font-medium" data-testid="text-destination">{visitor.destinationName || "Not specified"}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Person to Visit</p>
                <p className="font-medium" data-testid="text-person">{visitor.personToVisit}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Purpose</p>
                <p className="font-medium" data-testid="text-purpose">{visitor.purpose}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button
              size="lg"
              variant="outline"
              className="h-16 text-lg border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
              onClick={() => approvalMutation.mutate("denied")}
              disabled={approvalMutation.isPending}
              data-testid="button-deny"
            >
              {approvalMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="h-5 w-5 mr-2" />
                  NO
                </>
              )}
            </Button>
            <Button
              size="lg"
              className="h-16 text-lg bg-green-600 hover:bg-green-700"
              onClick={() => approvalMutation.mutate("approved")}
              disabled={approvalMutation.isPending}
              data-testid="button-approve"
            >
              {approvalMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  YES
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
