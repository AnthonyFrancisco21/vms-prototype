import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Building2, Shield, Users, FileText, MessageSquare, QrCode, Camera } from "lucide-react";

const faqItems = [
  {
    question: "How do I register a new visitor?",
    answer: "From the main landing page, follow the step-by-step registration process: Select the destination office, enter visitor details (name, person to visit, purpose), scan the visitor's ID, take a photo, and submit the registration. The system will assign a guest pass automatically.",
  },
  {
    question: "How does the guest pass system work?",
    answer: "Guest passes are pre-made cards with unique numbers and QR codes. When a visitor registers, a pass is assigned to them. Upon entry, scan the pass to record check-in time. When the visitor leaves, scan the returned pass to record exit time and make the pass available again.",
  },
  {
    question: "How do I check in a visitor using the QR scanner?",
    answer: "Go to the 'Check In' page from the sidebar. Position the guest pass QR code in front of the camera or enter the pass number manually. The system will automatically record the entry time.",
  },
  {
    question: "How do I check out a visitor?",
    answer: "Go to the 'Check Out' page, scan the returned guest pass, and the system will record the exit time. Don't forget to return the visitor's ID document.",
  },
  {
    question: "How do I notify staff about a visitor?",
    answer: "Use the 'Send Notification' page. Select the staff member to notify and the visitor, then send the message. The notification will be sent via SMS to the staff member's registered mobile number.",
  },
  {
    question: "How do I add or edit destinations?",
    answer: "Go to Admin > Destinations. Click 'Add Destination' to create new offices or click the edit icon next to existing destinations to modify them. You can set destinations as active or inactive.",
  },
  {
    question: "How do I manage staff contacts?",
    answer: "Go to Admin > Staff Contacts. Add new contacts with their name, department, mobile number, and email. These contacts will appear in the notification dropdown for visitor announcements.",
  },
  {
    question: "How do I generate guest passes?",
    answer: "Go to Admin > Guest Passes. Click 'Generate 10 Passes' for bulk creation, or 'Add Pass' to create individual passes with custom numbers. Passes are reusable after visitors check out.",
  },
  {
    question: "How do I view visitor reports?",
    answer: "Go to Admin > Reports. Select a date range and click 'Apply Filter' to view visitor logs. You can search within results and export the data to CSV for further analysis.",
  },
  {
    question: "What if the QR scanner doesn't work?",
    answer: "If the camera scanner has issues, you can always use the 'Manual Entry' option to type in the pass number directly. Make sure camera permissions are enabled in your browser.",
  },
];

export default function About() {
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">About & FAQ</h1>
          </div>
          <p className="text-muted-foreground">
            Everything you need to know about the Visitor Management System
          </p>
        </div>

        <Card className="border-card-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              About This System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The Visitor Management System (VMS) is a comprehensive solution for reception desks to 
              efficiently manage visitor registration, tracking, and security. It provides a streamlined 
              process for visitor check-in and check-out while maintaining detailed logs for reporting.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Security Features</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>ID scanning with OCR</li>
                  <li>Visitor photo capture</li>
                  <li>QR-coded guest passes</li>
                  <li>Entry/exit time tracking</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-medium">Admin Features</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Destination management</li>
                  <li>Staff contact directory</li>
                  <li>Guest pass inventory</li>
                  <li>Visitor log reports</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <QrCode className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">QR Code Scanning</h3>
                <p className="text-sm text-muted-foreground">Quick check-in/out with QR-coded guest passes</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Photo & ID Capture</h3>
                <p className="text-sm text-muted-foreground">Webcam photos and ID scanning with OCR</p>
              </div>
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-medium mb-1">Instant Notifications</h3>
                <p className="text-sm text-muted-foreground">SMS alerts to staff about incoming visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-trigger-${index}`}>
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-muted rounded-lg text-center">
          <h3 className="font-medium mb-2">Need More Help?</h3>
          <p className="text-muted-foreground text-sm">
            Contact your system administrator for additional support or training.
          </p>
        </div>
      </div>
    </div>
  );
}
