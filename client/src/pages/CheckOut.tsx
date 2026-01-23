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
  LogOut,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Timer,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckOut() {
  const { toast } = useToast();
  const [checkedOutVisitor, setCheckedOutVisitor] = useState<Visitor | null>(
    null,
  );
  const [rfidInput, setRfidInput] = useState("");
  const rfidInputRef = useRef<HTMLInputElement>(null);

  const checkOutMutation = useMutation({
    mutationFn: async (identifier: { passNumber?: string; rfid?: string }) => {
      const res = await apiRequest(
        "POST",
        "/api/visitors/check-out",
        identifier,
      );
      return res.json();
    },
    onSuccess: (visitor: Visitor) => {
      setCheckedOutVisitor(visitor);
      toast({
        title: "Check-Out Successful",
        description: `Visitor ${visitor.name} has been checked out. Guest pass returned.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/guest-passes"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Check-Out Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = (code: string) => {
    checkOutMutation.mutate({ passNumber: code });
  };

  const handleRfidSubmit = () => {
    if (rfidInput.trim()) {
      checkOutMutation.mutate({ rfid: rfidInput.trim() });
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
    setCheckedOutVisitor(null);
    setRfidInput("");
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  };

  const calculateDuration = (entry: Date, exit: Date) => {
    const diffMs = exit.getTime() - entry.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  if (checkedOutVisitor) {
    const entryTime = checkedOutVisitor.entryTime
      ? new Date(checkedOutVisitor.entryTime)
      : new Date();
    const exitTime = checkedOutVisitor.exitTime
      ? new Date(checkedOutVisitor.exitTime)
      : new Date();

    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
                <LogOut className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>

              <h2 className="text-2xl font-semibold mb-2">
                Check-Out Complete
              </h2>
              <p className="text-muted-foreground mb-6">
                The visitor has been checked out. Please collect the ID and
                return the guest pass.
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Guest Pass Returned
                </p>
                <p
                  className="text-4xl font-mono font-bold text-foreground"
                  data-testid="text-pass-number"
                >
                  {checkedOutVisitor.passNumber}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Visitor</p>
                    <p className="font-medium" data-testid="text-visitor-name">
                      {checkedOutVisitor.name}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Visited</p>
                    <p className="font-medium" data-testid="text-destination">
                      {checkedOutVisitor.destinationName}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Entry / Exit
                    </p>
                    <p className="font-medium text-sm" data-testid="text-times">
                      {entryTime.toLocaleTimeString()} -{" "}
                      {exitTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg flex items-start gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Duration</p>
                    <p className="font-medium" data-testid="text-duration">
                      {calculateDuration(entryTime, exitTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  Please return the visitor's ID
                </p>
              </div>

              <Button
                onClick={resetScanner}
                size="lg"
                className="w-full"
                data-testid="button-scan-another"
              >
                Check Out Another Visitor
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
            <LogOut className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Visitor Check-Out</h1>
          </div>
          <p className="text-muted-foreground">
            Use RFID scan or guest pass to record visitor exit time
          </p>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="text-center">Check-Out Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* RFID Input */}
            <div className="space-y-2">
              <Label htmlFor="rfid-input" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                RFID Check-Out
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
                  disabled={!rfidInput.trim() || checkOutMutation.isPending}
                >
                  Check Out
                </Button>
              </div>
            </div>

            {/* QR Scanner */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
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
          <h3 className="font-medium mb-2">Check-Out Methods:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm">RFID Check-Out:</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>
                  Scan the visitor's RFID card or enter the RFID number manually
                </li>
                <li>Press Enter or click "Check Out" to record exit time</li>
                <li>Return the visitor's ID document</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium text-sm">Guest Pass Check-Out:</h4>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-4">
                <li>Collect the guest pass from the visitor</li>
                <li>Scan the pass QR code or enter the number manually</li>
                <li>The exit time will be automatically recorded</li>
                <li>The guest pass is now available for reuse</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
