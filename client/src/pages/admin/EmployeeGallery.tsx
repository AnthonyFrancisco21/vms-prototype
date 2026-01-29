import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import type { Employee, AttendanceLog } from "@shared/schema";
import {
  Users,
  Search,
  User,
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  TrendingUp,
} from "lucide-react";

export default function EmployeeGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  const [showAttendance, setShowAttendance] = useState(false);

  const { data: employees = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
    queryFn: async () => {
      const response = await fetch("/api/employees");
      if (!response.ok) throw new Error("Failed to fetch employees");
      return response.json();
    },
  });

  const { data: attendanceLogs = [], isLoading: isLoadingAttendance } =
    useQuery<AttendanceLog[]>({
      queryKey: ["/api/employees", selectedEmployee?.id, "attendance"],
      queryFn: async () => {
        if (!selectedEmployee?.id) return [];
        const response = await fetch(
          `/api/employees/${selectedEmployee.id}/attendance`,
        );
        if (!response.ok) throw new Error("Failed to fetch attendance logs");
        return response.json();
      },
      enabled: !!selectedEmployee?.id && showAttendance,
    });

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.rfid?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && employee.isActive) ||
      (statusFilter === "inactive" && !employee.isActive);

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

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">
        <XCircle className="h-3 w-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Employee Gallery</h1>
        </div>

        <Card className="border-card-border mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name or RFID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger
                  className="w-full sm:w-40"
                  data-testid="select-status-filter"
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
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
                Employees ({filteredEmployees.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>RFID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-10 w-10 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No employees found</p>
                <p className="text-sm">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : "Employees will appear here after registration"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Avatar</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>RFID</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedEmployee(employee)}
                      data-testid={`employee-row-${employee.id}`}
                    >
                      <TableCell>
                        <Avatar className="h-10 w-10">
                          {employee.photoImage ? (
                            <AvatarImage
                              src={`${window.location.origin}${employee.photoImage}`}
                              alt={employee.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {getInitials(employee.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell
                        className="font-medium"
                        data-testid="text-employee-name"
                      >
                        {employee.name}
                      </TableCell>
                      <TableCell className="font-mono">
                        {employee.rfid}
                      </TableCell>
                      <TableCell>{getStatusBadge(employee.isActive)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedEmployee}
          onOpenChange={() => setSelectedEmployee(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>
            {selectedEmployee && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-24 w-24">
                    {selectedEmployee.photoImage ? (
                      <AvatarImage
                        src={`${window.location.origin}${selectedEmployee.photoImage}`}
                        alt={selectedEmployee.name}
                      />
                    ) : null}
                    <AvatarFallback className="text-2xl">
                      {getInitials(selectedEmployee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedEmployee.name}
                    </h3>
                    <div className="mt-1">
                      {getStatusBadge(selectedEmployee.isActive)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-xs">RFID</span>
                    </div>
                    <p className="font-medium font-mono">
                      {selectedEmployee.rfid}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAttendance(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Check Attendance
                </Button>

                {selectedEmployee.idScanImage && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">
                      ID Scan
                    </p>
                    <img
                      src={`${window.location.origin}${selectedEmployee.idScanImage}`}
                      alt="ID Scan"
                      className="w-full max-h-32 object-contain rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Attendance Modal */}
        <Dialog open={showAttendance} onOpenChange={setShowAttendance}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attendance History - {selectedEmployee?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh]">
              {isLoadingAttendance ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="p-4 border rounded-lg">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <div className="flex gap-4">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : attendanceLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    No attendance records found
                  </p>
                  <p className="text-sm">
                    Attendance logs will appear here once the employee starts
                    using the system
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {attendanceLogs.map((log) => (
                    <Card key={log.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Calendar className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(log.date).toLocaleDateString(
                                undefined,
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {log.status === "completed"
                                ? "Completed Session"
                                : "Active Session"}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            log.status === "completed" ? "default" : "secondary"
                          }
                        >
                          {log.status === "completed" ? "Completed" : "Active"}
                        </Badge>
                      </div>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Time In
                            </p>
                            <p className="font-medium text-green-700 dark:text-green-300">
                              {new Date(log.timeIn).toLocaleTimeString(
                                undefined,
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                        </div>
                        {log.timeOut && (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Time Out
                              </p>
                              <p className="font-medium text-blue-700 dark:text-blue-300">
                                {new Date(log.timeOut).toLocaleTimeString(
                                  undefined,
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {log.timeOut && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              Duration:
                            </span>
                            <span className="font-medium">
                              {(() => {
                                const duration =
                                  new Date(log.timeOut).getTime() -
                                  new Date(log.timeIn).getTime();
                                const hours = Math.floor(
                                  duration / (1000 * 60 * 60),
                                );
                                const minutes = Math.floor(
                                  (duration % (1000 * 60 * 60)) / (1000 * 60),
                                );
                                return `${hours}h ${minutes}m`;
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
