import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRScanner } from "@/components/QRScanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Visitor } from "@shared/schema";
import {
  LogIn,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Target,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckIn() {
  const { toast } = useToast();
  const [checkedInVisitor, setCheckedInVisitor] = useState<Visitor | null>(
    null,
  );
  const [rfidInput, setRfidInput] = useState("");
  const rfidInputRef = useRef<HTMLInputElement>(null);

  const checkInMutation = useMutation({
    mutationFn: async (identifier: { passNumber?: string; rfid?: string }) => {
      const res = await apiRequest(
        "POST",
        "/api/visitors/check-in",
        identifier,
      );
      return res.json();
    },
    onSuccess: (visitor: Visitor) => {
      setCheckedInVisitor(visitor);
      toast({
        title: "Check-In Successful",
        description: `Visitor ${visitor.name} has been checked in.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-In Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = (code: string) => {
    checkInMutation.mutate({ passNumber: code });
  };

  const handleRfidSubmit = () => {
    if (rfidInput.trim()) {
      checkInMutation.mutate({ rfid: rfidInput.trim() });
      setRfidInput("");
    }
  };

  // Handle RFID input with Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && rfidInput.trim() !== "") {
        e.preventDefault();
        handleRfidSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [rfidInput]);

  const resetScanner = () => {
    setCheckedInVisitor(null);
    setRfidInput("");
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  };

  if (checkedInVisitor) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-semibold mb-2">Check-In Complete</h2>
              <p className="text-muted-foreground mb-6">
                The visitor has been successfully checked in.
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Pass Number
                </p>
                <p
                  className="text-4xl font-mono font-bold text-foreground"
                  data-testid="text-pass-number"
                >
                  {checkedInVisitor.passNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Visitor</p>
                    <p className="font-medium" data-testid="text-visitor-name">
                      {checkedInVisitor.name}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Destination</p>
                    <p className="font-medium" data-testid="text-destination">
                      {checkedInVisitor.destinationName}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <Target className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Person to Visit
                    </p>
                    <p className="font-medium" data-testid="text-person">
                      {checkedInVisitor.personToVisit}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Entry Time</p>
                    <p className="font-medium" data-testid="text-entry-time">
                      {checkedInVisitor.entryTime
                        ? new Date(
                            checkedInVisitor.entryTime,
                          ).toLocaleTimeString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={resetScanner}
                size="lg"
                className="w-full"
                data-testid="button-scan-another"
              >
                Scan Another Pass
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <LogIn className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Visitor Check-In</h1>
          </div>
          <p className="text-muted-foreground">
            Use RFID scan or guest pass QR code to record visitor entry
          </p>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-center">Check-In Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RFID Input */}
            <div className="space-y-2">
              <Label htmlFor="rfid-input" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                RFID Check-In
              </Label>
              <div className="flex gap-2">
                <Input
                  id="rfid-input"
                  ref={rfidInputRef}
                  type="text"
                  placeholder="Scan or enter RFID number"
                  value={rfidInput}
                  onChange={(e) => setRfidInput(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleRfidSubmit}
                  disabled={!rfidInput.trim() || checkInMutation.isPending}
                >
                  Check In
                </Button>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Guest Pass QR Code
              </Label>
              <QRScanner
                onScan={handleScan}
                placeholder="Enter pass number manually"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Check-In Methods:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">RFID Check-In:</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  Scan the visitor's RFID card or enter the RFID number manually
                </li>
                <li>Press Enter or click "Check In" to record entry</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-sm">Guest Pass Check-In:</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Position the guest pass QR code in front of the camera</li>
                <li>Wait for the scanner to detect and read the code</li>
                <li>You can also enter the pass number manually if needed</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
