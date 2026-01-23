import { useRef, useCallback, useState } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, RotateCcw, Check } from "lucide-react";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  capturedImage?: string | null;
}

export function WebcamCapture({ onCapture, capturedImage }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setIsCapturing(true);
        onCapture(imageSrc);
        setTimeout(() => setIsCapturing(false), 300);
      }
    }
  }, [onCapture]);

  const retake = () => {
    onCapture("");
  };

  const videoConstraints = {
    width: 320,
    height: 320,
    facingMode: "user",
  };

  return (
    <Card className="border-card-border">
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-4">
          {capturedImage ? (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured visitor photo"
                className="w-64 h-64 object-cover rounded-lg"
                data-testid="img-captured-photo"
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
                className={`rounded-lg ${isCapturing ? "animate-pulse" : ""}`}
                data-testid="webcam-preview"
              />
              <div className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-lg pointer-events-none" />
            </div>
          )}

          <div className="flex gap-2">
            {capturedImage ? (
              <Button
                variant="outline"
                onClick={retake}
                className="gap-2"
                data-testid="button-retake-photo"
              >
                <RotateCcw className="h-4 w-4" />
                Retake Photo
              </Button>
            ) : (
              <Button
                onClick={capture}
                className="gap-2"
                data-testid="button-capture-photo"
              >
                <Camera className="h-4 w-4" />
                Capture Photo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
