import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Keyboard, Camera, StopCircle } from "lucide-react";

interface QRScannerProps {
  onScan: (code: string) => void;
  placeholder?: string;
}

export function QRScanner({ onScan, placeholder = "Enter pass number manually" }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!containerRef.current) return;

    try {
      scannerRef.current = new Html5Qrcode("qr-reader");
      setIsScanning(true);

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          setScanSuccess(true);
          setTimeout(() => {
            setScanSuccess(false);
            onScan(decodedText);
            stopScanning();
          }, 500);
        },
        () => {}
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      setIsScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
    }
    setIsScanning(false);
  };

  const handleManualSubmit = () => {
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <Card className="border-card-border">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          <div
            id="qr-reader"
            ref={containerRef}
            className={`w-72 h-72 bg-muted rounded-lg flex items-center justify-center relative overflow-hidden ${
              scanSuccess ? "ring-4 ring-green-500" : ""
            }`}
          >
            {!isScanning && (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <QrCode className="h-16 w-16" />
                <span className="text-sm">Click to start scanning</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 flex-wrap justify-center">
            {isScanning ? (
              <Button
                variant="destructive"
                onClick={stopScanning}
                className="gap-2"
                data-testid="button-stop-scan"
              >
                <StopCircle className="h-4 w-4" />
                Stop Scanning
              </Button>
            ) : (
              <Button
                onClick={startScanning}
                className="gap-2"
                data-testid="button-start-scan"
              >
                <Camera className="h-4 w-4" />
                Start Scanning
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setShowManualInput(!showManualInput)}
              className="gap-2"
              data-testid="button-manual-entry"
            >
              <Keyboard className="h-4 w-4" />
              Manual Entry
            </Button>
          </div>

          {showManualInput && (
            <div className="flex gap-2 w-full max-w-sm">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={placeholder}
                onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                data-testid="input-manual-pass"
              />
              <Button onClick={handleManualSubmit} data-testid="button-submit-manual">
                Submit
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
