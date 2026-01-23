import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { StaffContact, Visitor } from "@shared/schema";
import { MessageSquare, Send, User, Phone, CheckCircle2, Loader2 } from "lucide-react";

export default function Notify() {
  const { toast } = useToast();
  const [selectedContact, setSelectedContact] = useState("");
  const [selectedVisitor, setSelectedVisitor] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  const { data: contacts = [], isLoading: loadingContacts } = useQuery<StaffContact[]>({
    queryKey: ["/api/staff-contacts"],
  });

  const { data: activeVisitors = [], isLoading: loadingVisitors } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors/active"],
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { contactId: string; visitorId: string; message: string }) => {
      const res = await apiRequest("POST", "/api/notifications/send", data);
      return res.json();
    },
    onSuccess: () => {
      setMessageSent(true);
      toast({
        title: "Notification Sent",
        description: "The staff member has been notified of the visitor.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectedContactData = contacts.find((c) => c.id === selectedContact);
  const selectedVisitorData = activeVisitors.find((v) => v.id === selectedVisitor);

  const getDefaultMessage = () => {
    if (selectedVisitorData && selectedContactData) {
      return `Hello ${selectedContactData.name}, you have a visitor: ${selectedVisitorData.name} for ${selectedVisitorData.purpose}. Please come to the reception desk.`;
    }
    return "";
  };

  const handleSend = () => {
    if (!selectedContact || !selectedVisitor) {
      toast({
        title: "Missing Information",
        description: "Please select both a staff member and a visitor.",
        variant: "destructive",
      });
      return;
    }

    const message = customMessage || getDefaultMessage();
    sendNotificationMutation.mutate({
      contactId: selectedContact,
      visitorId: selectedVisitor,
      message,
    });
  };

  const resetForm = () => {
    setSelectedContact("");
    setSelectedVisitor("");
    setCustomMessage("");
    setMessageSent(false);
  };

  if (messageSent) {
    return (
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <Card className="border-card-border">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>

              <h2 className="text-2xl font-semibold mb-2">Notification Sent</h2>
              <p className="text-muted-foreground mb-6">
                {selectedContactData?.name} has been notified about the visitor.
              </p>

              <div className="grid grid-cols-2 gap-4 text-left mb-6">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Staff Member</p>
                  <p className="font-medium">{selectedContactData?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedContactData?.mobileNumber}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Visitor</p>
                  <p className="font-medium">{selectedVisitorData?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVisitorData?.purpose}</p>
                </div>
              </div>

              <Button onClick={resetForm} size="lg" className="w-full" data-testid="button-send-another">
                Send Another Notification
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
            <MessageSquare className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Send Notification</h1>
          </div>
          <p className="text-muted-foreground">
            Notify staff members about incoming visitors via SMS
          </p>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="contact">Select Staff Member</Label>
              <Select value={selectedContact} onValueChange={setSelectedContact}>
                <SelectTrigger id="contact" className="h-12 mt-2" data-testid="select-contact">
                  <SelectValue placeholder="Choose staff member to notify..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingContacts ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : contacts.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No contacts available
                    </SelectItem>
                  ) : (
                    contacts.filter(c => c.isActive).map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{contact.name}</span>
                          <span className="text-muted-foreground">- {contact.mobileNumber}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visitor">Select Visitor</Label>
              <Select value={selectedVisitor} onValueChange={setSelectedVisitor}>
                <SelectTrigger id="visitor" className="h-12 mt-2" data-testid="select-visitor">
                  <SelectValue placeholder="Choose visitor to announce..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingVisitors ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : activeVisitors.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No active visitors
                    </SelectItem>
                  ) : (
                    activeVisitors.map((visitor) => (
                      <SelectItem key={visitor.id} value={visitor.id}>
                        <div className="flex items-center gap-2">
                          <span>{visitor.name}</span>
                          <span className="text-muted-foreground">- {visitor.purpose}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedContact && selectedVisitor && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Message will be sent to: {selectedContactData?.mobileNumber}
                  </span>
                </div>
                <p className="text-sm italic">"{getDefaultMessage()}"</p>
              </div>
            )}

            <div>
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Leave empty to use default message..."
                className="mt-2 min-h-24"
                data-testid="textarea-message"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customMessage.length}/500 characters
              </p>
            </div>

            <Button
              onClick={handleSend}
              disabled={!selectedContact || !selectedVisitor || sendNotificationMutation.isPending}
              size="lg"
              className="w-full gap-2"
              data-testid="button-send-notification"
            >
              {sendNotificationMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Note:</h3>
          <p className="text-sm text-muted-foreground">
            Notifications are sent via SMS to the staff member's registered mobile number. 
            For WhatsApp, Viber, or Messenger notifications, ensure the number is registered 
            with those services.
          </p>
        </div>
      </div>
    </div>
  );
}
