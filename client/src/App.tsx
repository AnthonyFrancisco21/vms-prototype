import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Kiosk from "@/pages/Kiosk";
import Notify from "@/pages/Notify";
import Destinations from "@/pages/admin/Destinations";
import Contacts from "@/pages/admin/Contacts";
import Reports from "@/pages/admin/Reports";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import Gallery from "@/pages/admin/Gallery";
import EmployeeGallery from "@/pages/admin/EmployeeGallery";
import Analytics from "@/pages/admin/Analytics";
import PreRegistration from "@/pages/admin/PreRegistration";
import VisitorApproval from "@/pages/VisitorApproval";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/kiosk" component={Kiosk} />
      <Route path="/notify" component={Notify} />
      <Route path="/approve/:token" component={VisitorApproval} />
      <Route path="/admin/destinations" component={Destinations} />
      <Route path="/admin/contacts" component={Contacts} />
      <Route path="/admin/reports" component={Reports} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin/gallery" component={Gallery} />
      <Route path="/admin/employee-gallery" component={EmployeeGallery} />
      <Route path="/admin/analytics" component={Analytics} />
      <Route path="/admin/pre-registration" component={PreRegistration} />
      <Route path="/about" component={About} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();

  // Define paths that should NOT show the sidebar/header
  const isKioskMode = location === "/kiosk" || location.startsWith("/approve/");

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={sidebarStyle as React.CSSProperties}>
          <div className="flex h-screen w-full overflow-hidden">
            {/* 1. Conditionally hide Sidebar */}
            {!isKioskMode && <AppSidebar />}

            <div className="flex flex-col flex-1 min-w-0">
              {/* 2. Conditionally hide Header */}
              {!isKioskMode && (
                <header className="flex items-center justify-between gap-4 p-3 border-b border-border bg-background sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
              )}

              <main className="flex-1 overflow-auto bg-background">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
