import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Visitor } from "@shared/schema";
import {
  FileText,
  Download,
  Search,
  Loader2,
  Calendar,
  User,
  MapPin,
  Clock,
  LogIn,
  LogOut,
  FileDown,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reports() {
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: visitors = [],
    isLoading,
    refetch,
  } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(
        `/api/visitors?startDate=${startDate}&endDate=${endDate}`,
      );
      if (!res.ok) throw new Error("Failed to fetch visitors");
      return res.json();
    },
  });

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.personToVisit?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false) ||
      v.destinationName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const exportCSV = () => {
    const headers = [
      "Entry Date",
      "Entry Time",
      "Exit Time",
      "Visitor Name",
      "Destination",
      "Person to Visit",
      "Purpose",
      "Pass Number",
      "Status",
    ];
    const rows = filteredVisitors
      .filter((v) => v.entryTime)
      .map((v) => [
        format(new Date(v.entryTime!), "yyyy-MM-dd"),
        format(new Date(v.entryTime!), "HH:mm:ss"),
        v.exitTime ? format(new Date(v.exitTime), "HH:mm:ss") : "-",
        v.name,
        v.destinationName || "-",
        v.personToVisit,
        v.purpose,
        v.passNumber || "-",
        v.status,
      ]);
    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `visitors-log-${startDate}-to-${endDate}.csv`;
    a.click();
  };

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const formatDateString = (dateStr: string) => {
      const [year, month, day] = dateStr.split("-");
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    };

    doc.setFontSize(18);
    doc.text("Visitor Log Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(
      `Date Range: ${formatDateString(startDate)} - ${formatDateString(endDate)}`,
      14,
      30,
    );
    doc.text(`Generated: ${format(new Date(), "MMM dd, yyyy HH:mm")}`, 14, 36);
    doc.text(`Total Records: ${filteredVisitors.length}`, 14, 42);

    const tableData = filteredVisitors
      .filter((v) => v.entryTime)
      .map((v) => [
        format(new Date(v.entryTime!), "MMM dd, yyyy"),
        format(new Date(v.entryTime!), "HH:mm"),
        v.exitTime ? format(new Date(v.exitTime), "HH:mm") : "-",
        v.name,
        v.destinationName || "-",
        v.personToVisit,
        v.purpose,
        v.passNumber || "-",
        v.status === "checked_in"
          ? "Checked In"
          : v.status === "checked_out"
            ? "Checked Out"
            : v.status,
      ]);

    autoTable(doc, {
      startY: 50,
      head: [
        [
          "Date",
          "Entry",
          "Exit",
          "Visitor",
          "Destination",
          "Person Visited",
          "Purpose",
          "Pass #",
          "Status",
        ],
      ],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15 },
        2: { cellWidth: 15 },
        3: { cellWidth: 35 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30 },
        6: { cellWidth: 25 },
        7: { cellWidth: 20 },
        8: { cellWidth: 22 },
      },
    });

    doc.save(`visitors-log-${startDate}-to-${endDate}.pdf`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "checked_in":
        return (
          <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 gap-1">
            <LogIn className="h-3 w-3" />
            Checked In
          </Badge>
        );
      case "checked_out":
        return (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
            <LogOut className="h-3 w-3" />
            Checked Out
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Visitor Log Reports</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="gap-2"
              disabled={filteredVisitors.length === 0}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={exportPDF}
              className="gap-2"
              disabled={filteredVisitors.length === 0}
              data-testid="button-export-pdf"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <Card className="border-card-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filter by Date Range
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end flex-wrap">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-48"
                  data-testid="input-start-date"
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-1 w-48"
                  data-testid="input-end-date"
                />
              </div>
              <Button
                onClick={() => refetch()}
                className="gap-2"
                data-testid="button-apply-filter"
              >
                <Search className="h-4 w-4" />
                Apply Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>
                Visitors Log ({filteredVisitors.length} records)
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search visitors..."
                  className="pl-9"
                  data-testid="input-search-visitors"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVisitors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No visitor records found for the selected date range.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead>Entry</TableHead>
                      <TableHead>Exit</TableHead>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Person to Visit</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Pass</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVisitors
                      .filter((visitor) => visitor.entryTime)
                      .map((visitor) => (
                        <TableRow
                          key={visitor.id}
                          data-testid={`row-visitor-${visitor.id}`}
                        >
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(
                                new Date(visitor.entryTime!),
                                "MMM dd, yyyy",
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="h-3 w-3 text-green-600" />
                              {format(new Date(visitor.entryTime!), "HH:mm")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {visitor.exitTime ? (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-3 w-3 text-blue-600" />
                                {format(new Date(visitor.exitTime), "HH:mm")}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="font-medium">
                                {visitor.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {visitor.destinationName || "-"}
                            </div>
                          </TableCell>
                          <TableCell>{visitor.personToVisit}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{visitor.purpose}</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {visitor.passNumber || "-"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(visitor.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
