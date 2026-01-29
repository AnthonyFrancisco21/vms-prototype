import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Visitor, Employee } from "@shared/schema";
import {
  User,
  QrCode,
  MapPin,
  Check,
  ArrowRight,
  ArrowLeft,
  CloudSun,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Types
type KioskPerson = (
  | Visitor
  | (Employee & { entryTime?: Date; exitTime?: Date; isCheckIn?: boolean })
) & {
  personType: "visitor" | "employee";
};

type DisplayState = {
  status: "idle" | "processing" | "success" | "error";
  person?: KioskPerson | null;
  message?: string;
  timestamp?: Date;
  isCheckOut?: boolean;
};

export default function Kiosk() {
  const { toast } = useToast();

  // State
  const [viewState, setViewState] = useState<DisplayState>({ status: "idle" });
  const [rfidInput, setRfidInput] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [temperature, setTemperature] = useState("Loading...");

  // Refs
  const rfidInputRef = useRef<HTMLInputElement>(null);
  const rfidTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetScreenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get building settings
  const { data: settings } = useQuery<{ key: string; value: string }[]>({
    queryKey: ["/api/settings"],
  });

  const buildingName =
    settings?.find((s) => s.key === "building_name")?.value || "SG Webworks";

  // Clock update (Every second)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-focus RFID input
  useEffect(() => {
    const focusInterval = setInterval(() => {
      if (rfidInputRef.current) {
        rfidInputRef.current.focus();
      }
    }, 1000);
    return () => clearInterval(focusInterval);
  }, []);

  // Fetch weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
        const location = "Makati,PH";

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`,
        );

        if (!response.ok) throw new Error("Weather fetch failed");
        const data = await response.json();
        setTemperature(`${Math.round(data.main.temp)}°C`);
      } catch (error) {
        console.error("Error fetching weather data:", error);
      }
    };
    fetchWeather();
  }, []);

  // Reset Screen Logic
  const scheduleReset = () => {
    if (resetScreenTimeoutRef.current)
      clearTimeout(resetScreenTimeoutRef.current);

    resetScreenTimeoutRef.current = setTimeout(() => {
      setViewState({ status: "idle" });
    }, 4000);
  };

  // --- MUTATIONS ---

  const processMutation = useMutation({
    mutationFn: async (rfid: string) => {
      const res = await apiRequest("POST", "/api/visitors/kiosk", { rfid });
      return res.json();
    },
    onSuccess: (
      person:
        | Visitor
        | (Employee & {
            entryTime?: Date;
            exitTime?: Date;
            isCheckIn?: boolean;
          }),
    ) => {
      const isCheckOut = !!person.exitTime;
      const personType = "registrationType" in person ? "visitor" : "employee";

      // For employees, use the isCheckIn flag if available, otherwise fall back to exitTime check
      const isEmployeeCheckIn =
        personType === "employee" && "isCheckIn" in person
          ? (person as any).isCheckIn
          : !isCheckOut;

      const finalIsCheckOut =
        personType === "employee" ? !isEmployeeCheckIn : isCheckOut;
      const finalMessage = (
        personType === "employee" ? isEmployeeCheckIn : !isCheckOut
      )
        ? "Welcome In"
        : "See you soon";

      setViewState({
        status: "success",
        person: { ...person, personType } as KioskPerson,
        timestamp: new Date(),
        isCheckOut: finalIsCheckOut,
        message: finalMessage,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      scheduleReset();
    },
    onError: (error: Error) => {
      setViewState({
        status: "error",
        message: error.message || "Processing Failed",
      });
      scheduleReset();
    },
  });

  const scanMutation = useMutation({
    mutationFn: async (rfid: string) => {
      // 1. Try Visitor
      try {
        const res = await apiRequest("GET", `/api/visitors/rfid/${rfid}`);
        if (res.ok) return { ...(await res.json()), personType: "visitor" };
      } catch (e) {}

      // 2. Try Employee
      try {
        const res = await apiRequest("GET", `/api/employees/rfid/${rfid}`);
        if (res.ok) return { ...(await res.json()), personType: "employee" };
      } catch (e) {}

      throw new Error("Card not recognized");
    },
    onSuccess: (person: KioskPerson) => {
      setViewState({ status: "processing", person: person });
      if (person.rfid) {
        processMutation.mutate(person.rfid);
      } else {
        setViewState({
          status: "error",
          message: "Invalid RFID data.",
        });
        scheduleReset();
      }
    },
    onError: () => {
      setViewState({
        status: "error",
        message: "Card not recognized",
      });
      scheduleReset();
    },
  });

  // --- INPUT HANDLING ---

  const triggerScan = (value: string) => {
    if (value.trim().length >= 3) {
      if (resetScreenTimeoutRef.current)
        clearTimeout(resetScreenTimeoutRef.current);

      setViewState({ status: "processing" });
      scanMutation.mutate(value.trim());
    }
    setRfidInput("");
  };

  const handleRfidInput = (value: string) => {
    setRfidInput(value);
    if (rfidTimeoutRef.current) clearTimeout(rfidTimeoutRef.current);

    if (value.trim().length > 0) {
      rfidTimeoutRef.current = setTimeout(() => triggerScan(value), 300);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && rfidInput.trim() !== "") {
      e.preventDefault();
      if (rfidTimeoutRef.current) clearTimeout(rfidTimeoutRef.current);
      triggerScan(rfidInput);
    }
  };

  // Helper to format dates cleanly
  const formatTime = (dateStr?: string | Date | null) => {
    if (!dateStr) return "--:--:--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden font-sans transition-colors duration-500">
      {/* Hidden Input for RFID Reader */}
      <Input
        ref={rfidInputRef}
        value={rfidInput}
        onChange={(e) => handleRfidInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        autoComplete="off"
        autoFocus
      />

      {/* Main Container */}
      <div className="w-full max-w-5xl h-[85vh] bg-card border border-border rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
        {/* Header: Minimal & Clean */}
        <div className="flex justify-between items-start px-10 py-8 z-10">
          <div>
            <h1 className="text-5xl font-thin tracking-tighter tabular-nums">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground mt-2 text-sm">
              <span className="flex items-center gap-1.5 uppercase tracking-wider font-medium text-xs">
                <MapPin className="w-3 h-3" /> Makati
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5 font-light">
                <CloudSun className="w-3 h-3" /> {temperature}
              </span>
              <span className="text-border">|</span>
              <span className="uppercase tracking-widest text-xs font-medium">
                {currentTime.toLocaleDateString([], {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
              <img
                src="/favicon.png"
                alt="Logo"
                className="w-8 h-8 object-contain opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center px-10 z-10">
          {/* STATE: IDLE */}
          {viewState.status === "idle" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 flex flex-col items-center text-center space-y-8">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-[0.2em]">
                  Welcome to
                </p>
                <h2 className="text-6xl font-thin tracking-tight">
                  {buildingName}
                </h2>
              </div>

              <div className="w-full max-w-xs h-px bg-border my-4" />

              <div className="flex flex-col items-center gap-3 opacity-60 animate-pulse">
                <QrCode className="w-8 h-8 stroke-[1]" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
                  Tap Card to Enter
                </p>
              </div>
            </div>
          )}

          {/* STATE: PROCESSING */}
          {viewState.status === "processing" && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
              <Loader2 className="w-12 h-12 animate-spin text-primary stroke-[1]" />
              <p className="mt-6 text-lg font-light tracking-wide text-muted-foreground">
                Verifying...
              </p>
            </div>
          )}

          {/* STATE: SUCCESS */}
          {viewState.status === "success" && viewState.person && (
            <div className="w-full flex items-center justify-center animate-in zoom-in-95 duration-500">
              <Card className="w-full max-w-2xl border-0 shadow-none bg-transparent">
                <CardContent className="p-0 flex flex-col items-center text-center">
                  {/* Status Ring */}
                  <div
                    className={`mb-8 p-1 rounded-full border-2 ${
                      viewState.isCheckOut
                        ? "border-orange-500/20"
                        : "border-primary/20"
                    }`}
                  >
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center shadow-sm ${
                        viewState.isCheckOut
                          ? "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {viewState.isCheckOut ? (
                        <ArrowLeft className="w-12 h-12 stroke-[1.5]" />
                      ) : (
                        <Check className="w-12 h-12 stroke-[1.5]" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">
                    {viewState.person.personType}
                  </h3>
                  <h2 className="text-5xl font-light tracking-tight mb-2">
                    {viewState.person.name}
                  </h2>
                  <p
                    className={`text-xl font-light mb-10 ${
                      viewState.isCheckOut ? "text-orange-500" : "text-primary"
                    }`}
                  >
                    {viewState.message}
                  </p>

                  {/* Minimal Time Grid */}
                  <div className="grid grid-cols-2 gap-12 w-full max-w-md border-t border-border pt-1">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        In
                      </span>
                      <span className="text-2xl font-light tabular-nums">
                        {formatTime(viewState.person.entryTime || new Date())}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Out
                      </span>
                      <span
                        className={`text-2xl font-light tabular-nums ${viewState.isCheckOut ? "text-foreground" : "text-muted-foreground/30"}`}
                      >
                        {viewState.isCheckOut
                          ? formatTime(viewState.person.exitTime)
                          : "--:--:--"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STATE: ERROR */}
          {viewState.status === "error" && (
            <div className="w-full flex items-center justify-center animate-in shake duration-300">
              <div className="flex flex-col items-center text-center max-w-md">
                <div className="w-20 h-20 bg-destructive/5 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-destructive stroke-[1.5]" />
                </div>
                <h2 className="text-3xl font-light text-foreground mb-2">
                  Not Recognized
                </h2>
                <p className="text-muted-foreground font-light text-lg mb-8">
                  {viewState.message}
                </p>
                <div className="px-4 py-2 bg-muted/50 rounded-full">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                    Please see reception
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 flex justify-center border-t border-border bg-muted/20">
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
            Secure Access • {buildingName}
          </p>
        </div>
      </div>
    </div>
  );
}
