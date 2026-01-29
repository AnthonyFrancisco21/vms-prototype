import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { Visitor, Employee } from "@shared/schema";

type PersonInBuilding =
  | (Visitor & { personType: "visitor" })
  | (Employee & {
      entryTime: Date;
      personType: "employee";
      destinationName: string;
    });
import {
  Users,
  Building2,
  Clock,
  RefreshCw,
  UserCheck,
  MapPin,
  Target,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    data: activeVisitors = [],
    isLoading: isLoadingVisitors,
    refetch: refetchVisitors,
    isFetching: isFetchingVisitors,
  } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors/active"],
    refetchInterval: 30000,
  });

  const {
    data: activeEmployees = [],
    isLoading: isLoadingEmployees,
    refetch: refetchEmployees,
    isFetching: isFetchingEmployees,
  } = useQuery<Employee[]>({
    queryKey: ["/api/employees/active"],
    refetchInterval: 30000,
  });

  const isLoading = isLoadingVisitors || isLoadingEmployees;
  const isFetching = isFetchingVisitors || isFetchingEmployees;

  // Combine visitors and employees into people in building
  const peopleInBuilding = [
    ...activeVisitors.map((v) => ({ ...v, personType: "visitor" as const })),
    ...activeEmployees.map((e) => ({
      ...e,
      personType: "employee" as const,
      destinationName: "N/A",
      entryTime: new Date(),
    })),
  ];

  useEffect(() => {
    if (!isFetching) {
      setLastRefresh(new Date());
    }
  }, [isFetching]);

  const handleRefresh = () => {
    refetchVisitors();
    refetchEmployees();
  };

  const getTimeInBuilding = (entryTime: Date | null) => {
    if (!entryTime) return "0m";
    const now = new Date();
    const entry = new Date(entryTime);
    const diffMs = now.getTime() - entry.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const uniqueDestinations = [
    ...new Set(
      peopleInBuilding
        .filter((p) => p.personType === "visitor")
        .map((p) => p.destinationName),
    ),
  ].filter(Boolean);

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Real-Time Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="gap-2"
            data-testid="button-refresh"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-card-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current People
                  </p>
                  <p
                    className="text-3xl font-bold"
                    data-testid="text-visitor-count"
                  >
                    {isLoading ? "-" : peopleInBuilding.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Checked In Today
                  </p>
                  <p
                    className="text-3xl font-bold"
                    data-testid="text-checked-in"
                  >
                    {isLoading ? "-" : activeVisitors.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-card-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Destinations
                  </p>
                  <p
                    className="text-3xl font-bold"
                    data-testid="text-destinations"
                  >
                    {isLoading ? "-" : uniqueDestinations.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current People in Building
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                  >
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
            ) : peopleInBuilding.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  No one currently in building
                </p>
                <p className="text-sm">
                  People will appear here when they check in
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {peopleInBuilding
                  .filter((person) => person.entryTime)
                  .map((person) => {
                    const isVisitor = person.personType === "visitor";
                    return (
                      <div
                        key={person.id}
                        className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                        data-testid={`person-card-${person.id}`}
                      >
                        <Avatar className="h-12 w-12">
                          {person.photoImage ? (
                            <AvatarImage
                              src={person.photoImage}
                              alt={person.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(person.name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              className="font-medium truncate"
                              data-testid="text-person-name"
                            >
                              {person.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {isVisitor ? "Visitor" : "Employee"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {isVisitor ? (
                              <>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {person.destinationName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  {person.personToVisit}
                                </span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Employee
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="gap-1">
                            <Timer className="h-3 w-3" />
                            {getTimeInBuilding(person.entryTime)}
                          </Badge>
                          {person.entryTime && (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(person.entryTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {uniqueDestinations.length > 0 && (
          <Card className="border-card-border mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                People by Destination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uniqueDestinations.map((dest) => {
                  const count = peopleInBuilding.filter(
                    (p) => p.destinationName === dest,
                  ).length;
                  return (
                    <div
                      key={dest}
                      className="p-4 bg-muted rounded-lg text-center"
                      data-testid={`destination-stat-${dest}`}
                    >
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {dest}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
