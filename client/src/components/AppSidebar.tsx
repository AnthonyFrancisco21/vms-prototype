import {
  Building2,
  Users,
  FileText,
  HelpCircle,
  LogIn,
  LogOut,
  MessageSquare,
  Home,
  LayoutDashboard,
  Image,
  BarChart3,
  CalendarPlus,
  Monitor,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const receptionItems = [
  {
    title: "Registration",
    url: "/",
    icon: Home,
  },
  {
    title: "Kiosk",
    url: "/kiosk",
    icon: Monitor,
  },
  {
    title: "Send Notification",
    url: "/notify",
    icon: MessageSquare,
  },
  {
    title: "Live Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
];

const adminItems = [
  {
    title: "Destinations",
    url: "/admin/destinations",
    icon: Building2,
  },
  {
    title: "Staff Contacts",
    url: "/admin/contacts",
    icon: Users,
  },
  {
    title: "Visitor Gallery",
    url: "/admin/gallery",
    icon: Image,
  },
  {
    title: "Reports",
    url: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Pre-Registration",
    url: "/admin/pre-registration",
    icon: CalendarPlus,
  },
];

const helpItems = [
  {
    title: "About & FAQ",
    url: "/about",
    icon: HelpCircle,
  },
];

export function AppSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">VMS</h2>
            <p className="text-xs text-muted-foreground">Visitor Management</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Reception</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {receptionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Help</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {helpItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">
          Reception Desk System
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
