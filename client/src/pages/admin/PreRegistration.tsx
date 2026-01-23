import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Calendar, Trash2, Check, X, Clock, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ScheduledVisit, Destination } from "@shared/schema";
import { visitPurposes } from "@shared/schema";

const formSchema = z.object({
  visitorName: z.string().min(1, "Visitor name is required"),
  visitorEmail: z.string().email().optional().or(z.literal("")),
  visitorPhone: z.string().optional(),
  destinationId: z.string().min(1, "Destination is required"),
  hostName: z.string().min(1, "Host name is required"),
  purpose: z.string().min(1, "Purpose is required"),
  expectedDate: z.string().min(1, "Expected date is required"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function PreRegistration() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { data: visits = [], isLoading } = useQuery<ScheduledVisit[]>({
    queryKey: ["/api/scheduled-visits"],
  });

  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      visitorName: "",
      visitorEmail: "",
      visitorPhone: "",
      destinationId: "",
      hostName: "",
      purpose: "",
      expectedDate: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiRequest("POST", "/api/scheduled-visits", {
        ...data,
        visitorEmail: data.visitorEmail || null,
        visitorPhone: data.visitorPhone || null,
        notes: data.notes || null,
        expectedDate: new Date(data.expectedDate).toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-visits"] });
      toast({ title: "Pre-registration created successfully" });
      setOpen(false);
      form.reset();
    },
    onError: () => {
      toast({ title: "Failed to create pre-registration", variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest("PATCH", `/api/scheduled-visits/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-visits"] });
      toast({ title: "Status updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/scheduled-visits/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scheduled-visits"] });
      toast({ title: "Pre-registration deleted" });
    },
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "confirmed":
        return <Badge className="bg-green-600"><Check className="w-3 h-3 mr-1" />Confirmed</Badge>;
      case "cancelled":
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case "arrived":
        return <Badge className="bg-blue-600"><User className="w-3 h-3 mr-1" />Arrived</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const pendingVisits = visits.filter(v => v.status === "pending" || v.status === "confirmed");
  const todayVisits = pendingVisits.filter(v => {
    const visitDate = new Date(v.expectedDate);
    const today = new Date();
    return visitDate.toDateString() === today.toDateString();
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Pre-Registration</h1>
          <p className="text-muted-foreground">Schedule and manage expected visitors</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-preregistration">
              <Plus className="w-4 h-4 mr-2" />
              Add Pre-Registration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Pre-Register Visitor</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="visitorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visitor Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-visitor-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="visitorEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-visitor-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visitorPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-visitor-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="destinationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-destination">
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {destinations.filter(d => d.isActive).map((dest) => (
                            <SelectItem key={dest.id} value={dest.id}>
                              {dest.name} {dest.floor ? `(${dest.floor})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hostName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Host Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-host-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-purpose">
                            <SelectValue placeholder="Select purpose" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {visitPurposes.map((purpose) => (
                            <SelectItem key={purpose} value={purpose}>
                              {purpose}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-expected-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (optional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit">
                  {createMutation.isPending ? "Creating..." : "Create Pre-Registration"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Expected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-today-count">{todayVisits.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-pending-count">
              {visits.filter(v => v.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-confirmed-count">
              {visits.filter(v => v.status === "confirmed").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Scheduled Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : visits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No scheduled visits yet. Add a pre-registration to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <div
                  key={visit.id}
                  className="flex items-center justify-between gap-4 p-4 border rounded-lg flex-wrap"
                  data-testid={`card-visit-${visit.id}`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium" data-testid={`text-visitor-name-${visit.id}`}>
                        {visit.visitorName}
                      </span>
                      {getStatusBadge(visit.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>Host: {visit.hostName}</span>
                      <span className="mx-2">|</span>
                      <span>{visit.destinationName || "No destination"}</span>
                      <span className="mx-2">|</span>
                      <span>{visit.purpose}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Expected: {format(new Date(visit.expectedDate), "PPP p")}
                    </div>
                    {visit.notes && (
                      <div className="text-sm text-muted-foreground italic">
                        Notes: {visit.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {visit.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: visit.id, status: "confirmed" })}
                        data-testid={`button-confirm-${visit.id}`}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                    )}
                    {(visit.status === "pending" || visit.status === "confirmed") && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateStatusMutation.mutate({ id: visit.id, status: "cancelled" })}
                        data-testid={`button-cancel-${visit.id}`}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(visit.id)}
                      data-testid={`button-delete-${visit.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
