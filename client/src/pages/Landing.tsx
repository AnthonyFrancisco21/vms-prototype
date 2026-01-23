import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WebcamCapture } from "@/components/WebcamCapture";
import { IDScanner } from "@/components/IDScanner";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Destination, Visitor } from "@shared/schema";
import { visitPurposes } from "@shared/schema";
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  CreditCard,
  Camera,
  ClipboardList,
  User,
  MapPin,
  Target,
  Loader2,
} from "lucide-react";

const steps = [
  { id: 0, title: "Registration Type", icon: User },
  { id: 1, title: "Select Destination", icon: MapPin },
  { id: 2, title: "Visitor Details", icon: User },
  { id: 3, title: "Take Photo", icon: Camera },
  { id: 4, title: "Scan RFID", icon: CreditCard },
  { id: 5, title: "Confirm & Submit", icon: ClipboardList },
];

export default function Landing() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    registrationType: "visitor",
    name: "",
    destinations: [] as string[], // array of destination IDs
    destinationName: "", // for display
    personToVisit: "",
    purpose: "",
    idScanImage: "",
    idOcrText: "",
    photoImage: "",
    rfid: "",
  });
  const [registeredVisitor, setRegisteredVisitor] = useState<Visitor | null>(
    null,
  );
  const rfidInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus RFID input when step 4 is reached
  useEffect(() => {
    if (currentStep === 4 && rfidInputRef.current) {
      rfidInputRef.current.focus();
      // Clear any existing value when focusing
      setFormData((prev) => ({ ...prev, rfid: "" }));
    }
  }, [currentStep]);

  // Handle RFID input with Enter key detection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        currentStep === 4 &&
        e.key === "Enter" &&
        formData.rfid.trim() !== ""
      ) {
        e.preventDefault();
        handleNext();
      }
    };

    if (currentStep === 4) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [currentStep, formData.rfid]);

  const { data: destinations = [], isLoading: loadingDestinations } = useQuery<
    Destination[]
  >({
    queryKey: ["/api/destinations"],
  });

  const { data: settings } = useQuery<{ key: string; value: string }[]>({
    queryKey: ["/api/settings"],
  });

  const buildingName =
    settings?.find((s) => s.key === "building_name")?.value ||
    "Welcome to Our Building";

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        destinations: JSON.stringify(data.destinations), // send as JSON string
      };
      const res = await apiRequest("POST", "/api/visitors", payload);
      return res.json();
    },
    onSuccess: (visitor: Visitor) => {
      setRegisteredVisitor(visitor);
      toast({
        title: "Registration Successful",
        description: `RFID ${visitor.rfid} has been registered for check-in/check-out.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    registerMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      registrationType: "visitor",
      name: "",
      destinations: [],
      destinationName: "",
      personToVisit: "",
      purpose: "",
      idScanImage: "",
      idOcrText: "",
      photoImage: "",
      rfid: "",
    });
    setCurrentStep(0);
    setRegisteredVisitor(null);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.registrationType === "visitor";
      case 1:
        return formData.destinations.length > 0;
      case 2:
        return (
          formData.name !== "" &&
          formData.personToVisit !== "" &&
          formData.purpose !== ""
        );
      case 3:
        return formData.photoImage !== "";
      case 4:
        return formData.rfid !== "";
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (registeredVisitor) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-semibold mb-2">
                Registration Complete
              </h2>
              <p className="text-muted-foreground mb-6">
                Your guest pass has been issued. Please proceed to the reception
                desk.
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Your Guest Pass Number
                </p>
                <p
                  className="text-5xl font-mono font-bold text-foreground"
                  data-testid="text-pass-number"
                >
                  {registeredVisitor.passNumber || "N/A"}
                </p>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                <p className="text-xs text-muted-foreground">Welcome</p>
                <p
                  className="font-medium text-lg"
                  data-testid="text-visitor-name"
                >
                  {registeredVisitor.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Destination</p>
                  <p className="font-medium" data-testid="text-destination">
                    {registeredVisitor.destinationName}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Person to Visit
                  </p>
                  <p className="font-medium" data-testid="text-person">
                    {registeredVisitor.personToVisit}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Purpose</p>
                  <p className="font-medium" data-testid="text-purpose">
                    {registeredVisitor.purpose}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-medium" data-testid="text-status">
                    Registered - Ready for Check-in
                  </p>
                </div>
              </div>

              <Button
                onClick={resetForm}
                size="lg"
                className="w-full"
                data-testid="button-new-visitor"
              >
                Register New Visitor
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold" data-testid="text-building-name">
              {buildingName}
            </h1>
          </div>
          <p className="text-muted-foreground">Visitor Management System</p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep > step.id
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <step.icon className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm font-medium">
                    {step.title}
                  </span>
                  <span className="sm:hidden text-sm font-medium">
                    {step.id}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep].icon;
                return <StepIcon className="h-5 w-5" />;
              })()}
              Step {currentStep + 1}: {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <User className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please select the registration type
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <Label htmlFor="registrationType">Registration Type</Label>
                  <Select
                    value={formData.registrationType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, registrationType: value })
                    }
                  >
                    <SelectTrigger id="registrationType" className="h-12 mt-2">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visitor">Visitor</SelectItem>
                      <SelectItem value="employee">Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 1 && formData.registrationType === "visitor" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Target className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please select your destinations from the list below
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <Label className="text-sm font-medium">Destinations</Label>
                  <div className="mt-2 space-y-3">
                    {loadingDestinations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">
                          Loading destinations...
                        </span>
                      </div>
                    ) : destinations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No destinations available
                      </div>
                    ) : (
                      destinations
                        .filter((d) => d.isActive)
                        .map((dest) => (
                          <div
                            key={dest.id}
                            className="flex items-center space-x-3 p-3 rounded-lg border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                          >
                            <input
                              type="checkbox"
                              id={dest.id}
                              checked={formData.destinations.includes(dest.id)}
                              onChange={(e) => {
                                const newDestinations = e.target.checked
                                  ? [...formData.destinations, dest.id]
                                  : formData.destinations.filter(
                                      (id) => id !== dest.id,
                                    );
                                setFormData({
                                  ...formData,
                                  destinations: newDestinations,
                                  destinationName: destinations
                                    .filter((d) =>
                                      newDestinations.includes(d.id),
                                    )
                                    .map((d) => d.name)
                                    .join(", "),
                                });
                              }}
                              className="h-4 w-4 text-primary border-input rounded focus:ring-primary focus:ring-2"
                            />
                            <Label
                              htmlFor={dest.id}
                              className="flex-1 cursor-pointer text-sm font-normal"
                            >
                              <div className="font-medium">{dest.name}</div>
                              {dest.floor && (
                                <div className="text-xs text-muted-foreground">
                                  Floor {dest.floor}
                                </div>
                              )}
                            </Label>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && formData.registrationType === "visitor" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <User className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please provide your details and scan your ID
                  </p>
                </div>
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <Label htmlFor="visitorName">Your Name</Label>
                    <Input
                      id="visitorName"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter your full name"
                      className="h-12 mt-2"
                      data-testid="input-visitor-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="personToVisit">Person to Visit</Label>
                    <Input
                      id="personToVisit"
                      value={formData.personToVisit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          personToVisit: e.target.value,
                        })
                      }
                      placeholder="Enter name of person you're visiting"
                      className="h-12 mt-2"
                      data-testid="input-person-to-visit"
                    />
                  </div>
                  <div>
                    <Label htmlFor="purpose">Purpose of Visit</Label>
                    <Select
                      value={formData.purpose}
                      onValueChange={(value) =>
                        setFormData({ ...formData, purpose: value })
                      }
                    >
                      <SelectTrigger
                        id="purpose"
                        className="h-12 mt-2"
                        data-testid="select-purpose"
                      >
                        <SelectValue placeholder="Select purpose..." />
                      </SelectTrigger>
                      <SelectContent>
                        {visitPurposes.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>
                            {purpose}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Scan ID</Label>
                    <div className="mt-2">
                      <IDScanner
                        onScan={(image, text) =>
                          setFormData({
                            ...formData,
                            idScanImage: image,
                            idOcrText: text,
                            name: text || formData.name,
                          })
                        }
                        scannedImage={formData.idScanImage}
                        scannedText={formData.idOcrText}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && formData.registrationType === "visitor" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <Camera className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please look at the camera for your visitor photo.
                  </p>
                </div>
                <div className="flex justify-center">
                  <WebcamCapture
                    onCapture={(image) =>
                      setFormData({ ...formData, photoImage: image })
                    }
                    capturedImage={formData.photoImage}
                  />
                </div>
              </div>
            )}

            {currentStep === 4 && formData.registrationType === "visitor" && (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <CreditCard className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please tap your RFID card on the reader.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    The system will automatically detect and proceed.
                  </p>
                </div>
                <div className="max-w-md mx-auto">
                  <Label htmlFor="rfid" className="text-sm font-medium">
                    RFID Number
                  </Label>
                  <Input
                    ref={rfidInputRef}
                    id="rfid"
                    value={formData.rfid}
                    onChange={(e) =>
                      setFormData({ ...formData, rfid: e.target.value.trim() })
                    }
                    placeholder="Tap RFID card here..."
                    className="h-12 mt-2 text-center text-lg font-mono bg-muted border-2 border-dashed border-muted-foreground/50 focus:border-primary transition-colors"
                    autoComplete="off"
                  />
                  {formData.rfid && (
                    <p className="text-sm text-green-600 mt-2 text-center">
                      RFID detected: {formData.rfid}
                    </p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 5 && formData.registrationType === "visitor" && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-2" />
                  <p className="text-muted-foreground">
                    Please review your information before submitting.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Visitor Name
                      </p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Destinations
                      </p>
                      <p className="font-medium">{formData.destinationName}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Person to Visit
                      </p>
                      <p className="font-medium">{formData.personToVisit}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Purpose
                      </p>
                      <p className="font-medium">{formData.purpose}</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">RFID</p>
                      <p className="font-medium">{formData.rfid}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {formData.idScanImage && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          ID Scan
                        </p>
                        <img
                          src={formData.idScanImage}
                          alt="ID Scan"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    )}
                    {formData.photoImage && (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">
                          Photo
                        </p>
                        <img
                          src={formData.photoImage}
                          alt="Visitor Photo"
                          className="w-24 h-24 object-cover rounded mx-auto"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="gap-2"
                data-testid="button-previous"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentStep < 5 ? (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="gap-2"
                  data-testid="button-next"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={registerMutation.isPending}
                  className="gap-2"
                  data-testid="button-submit-registration"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Complete Registration
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
