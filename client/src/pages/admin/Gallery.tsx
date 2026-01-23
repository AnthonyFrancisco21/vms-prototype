import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Visitor } from "@shared/schema";
import {
  Image,
  Search,
  User,
  MapPin,
  Clock,
  Target,
  CreditCard,
  Calendar,
} from "lucide-react";

export default function Gallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  const getDateRange = (filter: string) => {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (filter) {
      case "today":
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "month":
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "year":
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return {};
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    };
  };

  const { data: visitors = [], isLoading } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors", dateFilter],
    queryFn: async () => {
      const params = getDateRange(dateFilter);
      const url = new URL("/api/visitors", window.location.origin);
      if (params.startDate) url.searchParams.set("startDate", params.startDate);
      if (params.endDate) url.searchParams.set("endDate", params.endDate);

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch visitors");
      return response.json();
    },
  });

  const filteredVisitors = visitors.filter((visitor) => {
    const matchesSearch =
      visitor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visitor.personToVisit
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ??
        false) ||
      visitor.destinationName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || visitor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Checked In
          </Badge>
        );
      case "checked_out":
        return <Badge variant="secondary">Checked Out</Badge>;
      case "registered":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Registered
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Image className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Visitor List</h1>
        </div>

        <Card className="border-card-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by visitor name, person visited, or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  data-testid="select-date-filter"
                >
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  data-testid="select-status-filter"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="checked_in">Checked In</SelectItem>
                  <SelectItem value="checked_out">Checked Out</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Visitors ({filteredVisitors.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="p-4 bg-muted rounded-lg">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-3" />
                    <Skeleton className="h-4 w-24 mx-auto mb-2" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No visitors found</p>
                <p className="text-sm">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Visitors will appear here after registration"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredVisitors.map((visitor) => (
                  <div
                    key={visitor.id}
                    className="p-4 bg-muted rounded-lg text-center cursor-pointer hover-elevate transition-transform"
                    onClick={() => setSelectedVisitor(visitor)}
                    data-testid={`visitor-card-${visitor.id}`}
                  >
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      {visitor.photoImage ? (
                        <AvatarImage
                          src={`${window.location.origin}${visitor.photoImage}`}
                          alt={visitor.name}
                        />
                      ) : null}
                      <AvatarFallback className="text-xl">
                        {getInitials(visitor.name)}
                      </AvatarFallback>
                    </Avatar>
                    <p
                      className="font-medium truncate"
                      data-testid="text-visitor-name"
                    >
                      {visitor.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {visitor.destinationName}
                    </p>
                    <div className="mt-2">{getStatusBadge(visitor.status)}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedVisitor}
          onOpenChange={() => setSelectedVisitor(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Visitor Details</DialogTitle>
            </DialogHeader>
            {selectedVisitor && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    {selectedVisitor.photoImage ? (
                      <AvatarImage
                        src={`${window.location.origin}${selectedVisitor.photoImage}`}
                        alt={selectedVisitor.name}
                      />
                    ) : null}

                    <AvatarFallback className="text-2xl">
                      {getInitials(selectedVisitor.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedVisitor.name}
                    </h3>
                    <div className="mt-1">
                      {getStatusBadge(selectedVisitor.status)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs">Destination</span>
                    </div>
                    <p className="font-medium">
                      {selectedVisitor.destinationName}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Target className="h-4 w-4" />
                      <span className="text-xs">Person Visited</span>
                    </div>
                    <p className="font-medium">
                      {selectedVisitor.personToVisit}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">Pass Number</span>
                    </div>
                    <p className="font-medium font-mono">
                      {selectedVisitor.passNumber || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-xs">Purpose</span>
                    </div>
                    <p className="font-medium">{selectedVisitor.purpose}</p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs">Visit Timeline</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Entry</p>
                      <p className="font-medium">
                        {selectedVisitor.entryTime ? (
                          <>
                            {formatDate(selectedVisitor.entryTime)} at{" "}
                            {formatTime(selectedVisitor.entryTime)}
                          </>
                        ) : (
                          "Not checked in"
                        )}
                      </p>
                    </div>
                    {selectedVisitor.exitTime && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Exit</p>
                        <p className="font-medium">
                          {formatDate(selectedVisitor.exitTime)} at{" "}
                          {formatTime(selectedVisitor.exitTime)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedVisitor.idScanImage && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      ID Scan
                    </p>
                    <img
                      src={`${window.location.origin}${selectedVisitor.idScanImage}`}
                      alt="ID Scan"
                      className="w-full max-h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
