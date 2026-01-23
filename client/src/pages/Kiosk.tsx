import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Visitor } from "@shared/schema";
import {
  Monitor,
  CheckCircle2,
  User,
  CreditCard,
  LogIn,
  LogOut,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Kiosk() {
  const { toast } = useToast();
  const [processedVisitor, setProcessedVisitor] = useState<Visitor | null>(
    null,
  );
  const [scannedVisitor, setScannedVisitor] = useState<Visitor | null>(null);
  const [rfidInput, setRfidInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  // Refs
  const rfidInputRef = useRef<HTMLInputElement>(null);
  const rfidTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get building settings for branding
  const { data: settings } = useQuery<{ key: string; value: string }[]>({
    queryKey: ["/api/settings"],
  });

  const buildingName =
    settings?.find((s) => s.key === "building_name")?.value ||
    "Visitor Management System";

  // Auto-focus RFID input
  useEffect(() => {
    if (!scannedVisitor && !processedVisitor) {
      setTimeout(() => {
        if (rfidInputRef.current) {
          rfidInputRef.current.focus();
        }
      }, 100);
    }
  }, [scannedVisitor, processedVisitor]);

  const scanMutation = useMutation({
    mutationFn: async (rfid: string) => {
      // CHANGE: Added specific error handling for 404 to prevent generic errors
      const res = await apiRequest("GET", `/api/visitors/rfid/${rfid}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Scan failed");
      }
      return res.json();
    },
    onSuccess: (visitor: Visitor) => {
      setScannedVisitor(visitor);
      setRfidInput("");
      setIsScanning(false);
    },
    onError: (error: Error) => {
      // CHANGE: Specific handling to ensure we don't alert "Scan Failed" on legitimate 404s
      const isNotFound = error.message.toLowerCase().includes("not found");

      toast({
        title: isNotFound ? "Card Not Recognized" : "Scan Failed",
        description: isNotFound
          ? "This RFID card is not registered."
          : "Unable to scan the card. Please try again.",
        variant: "destructive",
      });

      setRfidInput("");
      setIsScanning(false);

      if (rfidInputRef.current) {
        rfidInputRef.current.focus();
      }
    },
  });

  const processMutation = useMutation({
    mutationFn: async (rfid: string) => {
      const res = await apiRequest("POST", "/api/visitors/kiosk", { rfid });
      return res.json();
    },
    onSuccess: (visitor: Visitor) => {
      setProcessedVisitor(visitor);
      setScannedVisitor(null);
      const isCheckOut = visitor.exitTime !== null;
      toast({
        title: isCheckOut ? "Check-Out Successful" : "Check-In Successful",
        description: `Visitor ${visitor.name} has been ${isCheckOut ? "checked out" : "checked in"}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Process Failed",
        description: error.message,
        variant: "destructive",
      });
      setScannedVisitor(null);
      if (rfidInputRef.current) {
        rfidInputRef.current.focus();
      }
    },
  });

  // CHANGE: Centralized scan trigger to avoid code duplication
  const triggerScan = (value: string) => {
    if (value.trim().length >= 3 && !isScanning && !scanMutation.isPending) {
      setIsScanning(true);
      scanMutation.mutate(value.trim());
    }
  };

  const handleRfidInput = (value: string) => {
    setRfidInput(value);

    // Clear existing timeout
    if (rfidTimeoutRef.current) {
      clearTimeout(rfidTimeoutRef.current);
    }

    // Debounce for manual typing
    if (value.trim().length > 0) {
      rfidTimeoutRef.current = setTimeout(() => {
        triggerScan(value);
      }, 500);
    }
  };

  // CHANGE: The critical fix is in this useEffect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && rfidInput.trim() !== "") {
        e.preventDefault();

        // CRITICAL FIX: Kill the debounce timer immediately!
        // This prevents the double-fetch when scanner hits Enter.
        if (rfidTimeoutRef.current) {
          clearTimeout(rfidTimeoutRef.current);
        }

        triggerScan(rfidInput);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [rfidInput, isScanning, scanMutation.isPending]); // Dependencies are important

  const handleConfirmProcess = () => {
    if (scannedVisitor && scannedVisitor.rfid) {
      processMutation.mutate(scannedVisitor.rfid);
    }
  };

  const handleCancelScan = () => {
    setScannedVisitor(null);
    setRfidInput("");
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  };

  const resetKiosk = () => {
    setProcessedVisitor(null);
    setScannedVisitor(null);
    setRfidInput("");
    if (rfidInputRef.current) {
      rfidInputRef.current.focus();
    }
  };

  // --- RENDER LOGIC (Kept same as your original, just summarized for brevity) ---

  if (scannedVisitor) {
    const willCheckIn = !scannedVisitor.entryTime;
    const willCheckOut = scannedVisitor.entryTime && !scannedVisitor.exitTime;

    return (
      <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <div className="flex-shrink-0 text-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Building2 className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {buildingName}
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Visitor Kiosk
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6">
          <div className="w-full max-w-2xl">
            <Card className="border-2 border-primary/20 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Visitor Identified</CardTitle>
                <p className="text-muted-foreground">
                  Please confirm to {willCheckIn ? "check in" : "check out"}
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Name</p>
                    <p className="font-semibold text-lg">
                      {scannedVisitor.name}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">RFID</p>
                    <p className="font-mono font-semibold text-lg">
                      {scannedVisitor.rfid}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-primary/5 rounded-lg border-2 border-primary/20">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {willCheckIn ? (
                      <LogIn className="h-6 w-6 text-green-600" />
                    ) : (
                      <LogOut className="h-6 w-6 text-blue-600" />
                    )}
                    <h3 className="text-xl font-semibold">
                      {willCheckIn ? "Check-In" : "Check-Out"}
                    </h3>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={handleCancelScan}
                    className="flex-1 h-14 text-lg"
                    disabled={processMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirmProcess}
                    className="flex-1 h-14 text-lg"
                    disabled={processMutation.isPending}
                  >
                    {processMutation.isPending ? "Processing..." : "Confirm"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (processedVisitor) {
    const isCheckOut = processedVisitor.exitTime !== null;
    return (
      <div className="h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-6">
          <Card className="border-2 border-green-200 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur w-full max-w-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-green-800">
                {isCheckOut ? "Check-Out Complete" : "Check-In Complete"}
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
                <p className="font-semibold text-lg">{processedVisitor.name}</p>
                <p className="text-muted-foreground">
                  {isCheckOut ? "Checked Out at" : "Checked In at"}{" "}
                  {new Date().toLocaleTimeString()}
                </p>
              </div>
              <Button
                onClick={resetKiosk}
                size="lg"
                className="w-full h-14 text-lg"
              >
                Ready for Next Visitor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col overflow-hidden">
      <div className="flex-shrink-0 text-center pt-12 pb-8">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Building2 className="h-16 w-16 text-primary" />
          <div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {buildingName}
            </h1>
            <p className="text-2xl text-gray-600 dark:text-gray-300">
              Visitor Kiosk
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          <Card className="border-4 border-primary/30 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur h-full max-h-[500px]">
            <CardContent className="p-8 h-full flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Tap RFID Card</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Place your RFID card on the reader
                </p>
              </div>

              <div className="max-w-md mx-auto mb-8">
                <Input
                  ref={rfidInputRef}
                  type="text"
                  value={rfidInput}
                  onChange={(e) => handleRfidInput(e.target.value)}
                  className="h-16 text-center text-2xl font-mono border-4 border-dashed border-primary/50 focus:border-primary bg-primary/5"
                  placeholder="Scanning..."
                  autoComplete="off"
                  // Keep opacity 0 but make it clickable/selectable just in case
                  style={{
                    opacity: 0,
                    position: "absolute",
                    pointerEvents: "none",
                  }}
                />
              </div>

              {scanMutation.isPending && (
                <div className="text-center">
                  <span className="text-lg font-medium animate-pulse">
                    Scanning RFID...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
