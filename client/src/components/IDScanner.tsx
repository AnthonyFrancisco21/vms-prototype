import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, RotateCcw, Check, Loader2 } from "lucide-react";

interface IDScannerProps {
  onScan: (imageSrc: string, ocrText: string) => void;
  scannedImage?: string | null;
  scannedText?: string | null;
}

export function IDScanner({ onScan, scannedImage, scannedText }: IDScannerProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const capture = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsProcessing(true);
        try {
          const worker = await createWorker("eng");
          const { data: { text } } = await worker.recognize(imageSrc);
          await worker.terminate();
          onScan(imageSrc, text);
        } catch (error) {
          console.error("OCR Error:", error);
          onScan(imageSrc, "");
        } finally {
          setIsProcessing(false);
        }
      }
    }
  }, [onScan]);

  const retake = () => {
    onScan("", "");
  };

  const videoConstraints = {
    width: 480,
    height: 320,
    facingMode: "environment",
  };

  return (
    <Card className="border-card-border">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          {scannedImage ? (
            <div className="relative">
              <img
                src={scannedImage}
                alt="Scanned ID"
                className="w-full max-w-md h-48 object-cover rounded-lg"
                data-testid="img-scanned-id"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <div className="relative">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="rounded-lg max-w-md"
                data-testid="id-scanner-preview"
              />
              <div className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="bg-background/80 px-3 py-1 rounded text-sm text-muted-foreground">
                  Position ID within frame
                </div>
              </div>
            </div>
          )}

          {scannedText && (
            <div className="w-full max-w-md p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium mb-1 text-foreground">Extracted Text:</p>
              <p className="text-muted-foreground whitespace-pre-wrap line-clamp-3" data-testid="text-ocr-result">
                {scannedText || "No text detected"}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            {scannedImage ? (
              <Button
                variant="outline"
                onClick={retake}
                className="gap-2"
                data-testid="button-rescan-id"
              >
                <RotateCcw className="h-4 w-4" />
                Rescan ID
              </Button>
            ) : (
              <Button
                onClick={capture}
                disabled={isProcessing}
                className="gap-2"
                data-testid="button-scan-id"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Scan ID
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
