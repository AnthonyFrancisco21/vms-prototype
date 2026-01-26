import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Visitor, Employee } from "@shared/schema";
import {
  User,
  Clock,
  QrCode,
  MapPin,
  CheckCircle2,
  ArrowRightLeft, // Changed icon to represent In/Out
  CloudSun,
} from "lucide-react";

// Types
type KioskPerson = (Visitor | Employee) & {
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
    onSuccess: (person: Visitor | Employee) => {
      const isCheckOut = !!person.exitTime;
      const personType = "registrationType" in person ? "visitor" : "employee";

      setViewState({
        status: "success",
        person: { ...person, personType } as KioskPerson,
        timestamp: new Date(),
        isCheckOut: isCheckOut,
        message: isCheckOut
          ? "Goodbye, see you soon."
          : "Welcome, access granted.",
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
      // Auto-process without confirmation
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
        message: "Card not registered in system.",
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
    });
  };

  return (
    // CHANGED: Overall Container - Dark Theme #111111 (zinc-950)
    <div className="h-screen w-full bg-[#0a0a0a] text-white flex items-center justify-center relative overflow-hidden font-sans selection:bg-blue-500/30">
      {/* CHANGED: Background Ambient Blue Glow (Matches new logo color) */}
      <div
        className="absolute right-[-10%] top-[10%] w-[80vh] h-[80vh] rounded-full border-[60px] border-blue-900/20 blur-sm animate-spin-slow pointer-events-none"
        style={{ animationDuration: "60s" }}
      ></div>
      <div className="absolute right-[-5%] top-[15%] w-[60vh] h-[60vh] rounded-full border-[40px] border-blue-800/10 blur-md pointer-events-none"></div>
      <div className="absolute right-[0%] top-[25%] w-[40vh] h-[40vh] rounded-full border-[20px] border-blue-600/5 blur-xl pointer-events-none"></div>

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

      {/* CHANGED: Main Content Container */}
      <div className="w-full max-w-6xl h-[85vh] bg-[#111] rounded-[1rem] shadow-2xl flex flex-col relative overflow-hidden border border-white/5">
        {/* Header Bar */}
        <div className="flex justify-between items-start px-12 py-10 z-10">
          {/* Time & Weather Section */}
          <div className="flex flex-col gap-1">
            <h1 className="text-6xl font-light tracking-tight text-white/90 tabular-nums">
              {/* CHANGED: Added seconds to time display */}
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
              })}
            </h1>
            <div className="flex items-center gap-4 text-zinc-500 font-medium ml-1 mt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>Makati, Metro Manila</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
              <div className="flex items-center gap-2">
                <CloudSun className="w-4 h-4 text-yellow-500/80" />
                <span>28°C</span>
              </div>
            </div>
            <span className="text-zinc-600 font-medium ml-1 text-sm uppercase tracking-widest mt-1">
              {currentTime.toLocaleDateString([], {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* CHANGED: Logo Right - Using Image + Name */}
          <div className="flex flex-col items-end gap-3">
            {/* Replaced generic div with image. Ensure 'favicon.png.jpeg' is accessible in your public folder or adjust path */}
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1">
              {/* Note: Update the src below to the exact path where you stored the uploaded image */}
              <img
                src="/favicon.png"
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-lg font-thin tracking-wide text-zinc-400">
              {buildingName}
            </span>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex flex-col justify-center px-12 pb-12 z-10 transition-all duration-500 ease-in-out">
          {/* STATE: IDLE */}
          {viewState.status === "idle" && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 space-y-10 max-w-xl">
              <div className="space-y-4">
                <p className="text-zinc-400 text-2xl font-light">Welcome To</p>
                <h2 className="text-7xl font-thin text-white tracking-tight">
                  SG Webworks<span className="text-blue-600">.</span>
                </h2>
              </div>

              {/* CHANGED: Combined Check-in/out Pill */}
              <div className="h-20 w-64 rounded-full border border-zinc-700 bg-zinc-800/30 backdrop-blur-sm flex items-center justify-between px-3 pl-8 shadow-inner">
                <span className="text-zinc-300 font-medium text-lg">
                  Check-In / Out
                </span>
                <div className="h-14 w-14 rounded-full bg-blue-600 shadow-lg shadow-blue-900/50 flex items-center justify-center animate-pulse">
                  <ArrowRightLeft className="text-white w-6 h-6" />
                </div>
              </div>

              <div className="pt-4 flex items-center gap-4 opacity-40">
                <QrCode className="w-6 h-6 text-zinc-500" />
                <p className="text-sm text-zinc-500 uppercase tracking-wider">
                  Tap Card or Scan QR Code
                </p>
              </div>
            </div>
          )}

          {/* STATE: PROCESSING */}
          {viewState.status === "processing" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-50">
              <div className="w-20 h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
              <p className="text-2xl text-zinc-300 font-light tracking-wide">
                Verifying Access...
              </p>
            </div>
          )}

          {/* STATE: SUCCESS (The result card) */}
          {viewState.status === "success" && viewState.person && (
            <div className="w-full flex items-center justify-center animate-in zoom-in-95 duration-300">
              <Card className="w-full max-w-4xl bg-[#1a1a1a] border-none shadow-2xl relative overflow-hidden rounded-[2.5rem]">
                {/* Blue/Orange accent strip based on action */}
                <div
                  className={`absolute top-0 left-0 w-3 h-full ${
                    viewState.isCheckOut ? "bg-orange-500" : "bg-blue-600"
                  }`}
                ></div>

                <CardContent className="p-12 flex items-center gap-12">
                  {/* Avatar / Image */}
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-[#252525] shadow-2xl bg-zinc-800 flex items-center justify-center">
                      <User className="w-24 h-24 text-zinc-600" />
                    </div>
                    {/* Status Badge */}
                    <div
                      className={`absolute bottom-2 right-2 p-4 rounded-full border-8 border-[#1a1a1a] ${
                        viewState.isCheckOut ? "bg-orange-500" : "bg-blue-600"
                      }`}
                    >
                      {viewState.isCheckOut ? (
                        <ArrowRightLeft className="w-8 h-8 text-white" />
                      ) : (
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {viewState.person.personType}
                      </h3>
                      <h2 className="text-5xl font-bold text-white mb-2 tracking-tight">
                        {viewState.person.name}
                      </h2>
                      <p
                        className={`text-2xl font-medium ${
                          viewState.isCheckOut
                            ? "text-orange-400"
                            : "text-blue-400"
                        }`}
                      >
                        {viewState.message}
                      </p>
                    </div>

                    {/* Time Grid */}
                    <div className="grid grid-cols-2 gap-6 mt-8 bg-[#111] p-6 rounded-2xl border border-white/5">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                          Time In
                        </span>
                        <span className="text-2xl font-mono text-white tracking-tight">
                          {formatTime(viewState.person.entryTime || new Date())}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 border-l border-white/5 pl-6">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                          Time Out
                        </span>
                        <span
                          className={`text-2xl font-mono ${
                            viewState.isCheckOut
                              ? "text-white"
                              : "text-zinc-700"
                          }`}
                        >
                          {viewState.isCheckOut
                            ? formatTime(new Date())
                            : "--:--:--"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* STATE: ERROR */}
          {viewState.status === "error" && (
            <div className="w-full flex items-center justify-center animate-in shake duration-300">
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-10 text-center max-w-lg backdrop-blur-md">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-3xl font-bold text-red-400 mb-2">
                  Access Denied
                </h2>
                <p className="text-xl text-zinc-300 font-light">
                  {viewState.message}
                </p>
                <div className="mt-8 pt-6 border-t border-red-500/10">
                  <p className="text-sm text-zinc-500 uppercase tracking-widest">
                    Please contact security
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Simplified based on request */}
        <div className="px-12 py-8 flex justify-center items-center border-t border-white/5 bg-[#151515]">
          <p className="text-xs text-zinc-600 tracking-widest uppercase">
            Powered by{" "}
            <span className="text-zinc-400 font-bold ml-1">{buildingName}</span>{" "}
            • Secure Access System
          </p>
        </div>
      </div>
    </div>
  );
}
