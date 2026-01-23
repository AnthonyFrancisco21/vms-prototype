import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Visitor } from "@shared/schema";
import {
  BarChart3,
  Calendar,
  Clock,
  MapPin,
  Target,
  Users,
  TrendingUp,
  Search,
  Loader2,
} from "lucide-react";
import {
  format,
  getHours,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
} from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "hsl(210, 70%, 50%)",
  "hsl(150, 60%, 45%)",
  "hsl(30, 80%, 55%)",
  "hsl(280, 60%, 55%)",
  "hsl(0, 70%, 55%)",
  "hsl(180, 50%, 45%)",
];

export default function Analytics() {
  const today = new Date();
  const monthStart = startOfMonth(today).toISOString().split("T")[0];
  const monthEnd = endOfMonth(today).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(monthStart);
  const [endDate, setEndDate] = useState(monthEnd);

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

  const totalVisitors = visitors.length;
  const checkedIn = visitors.filter((v) => v.status === "checked_in").length;
  const checkedOut = visitors.filter((v) => v.status === "checked_out").length;

  const avgDurationMinutes =
    visitors
      .filter((v) => v.exitTime && v.entryTime)
      .reduce((acc, v) => {
        const entry = new Date(v.entryTime!).getTime();
        const exit = new Date(v.exitTime!).getTime();
        return acc + (exit - entry) / 60000;
      }, 0) /
    Math.max(visitors.filter((v) => v.exitTime && v.entryTime).length, 1);

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const count = visitors.filter(
      (v) => v.entryTime && getHours(new Date(v.entryTime)) === hour,
    ).length;
    return { hour: `${hour.toString().padStart(2, "0")}:00`, count };
  }).filter(
    (d) => d.count > 0 || (parseInt(d.hour) >= 8 && parseInt(d.hour) <= 18),
  );

  const purposeData = Object.entries(
    visitors.reduce(
      (acc, v) => {
        acc[v.purpose] = (acc[v.purpose] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const destinationData = Object.entries(
    visitors.reduce(
      (acc, v) => {
        const dest = v.destinationName || "Unknown";
        acc[dest] = (acc[dest] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ),
  )
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const dailyTrend = (() => {
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const days = eachDayOfInterval({ start, end });
      return days.map((day) => {
        const dayStr = format(day, "MMM dd");
        const count = visitors.filter((v) => {
          if (!v.entryTime) return false;
          const entryDate = new Date(v.entryTime);
          return format(entryDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd");
        }).length;
        return { date: dayStr, visitors: count };
      });
    } catch {
      return [];
    }
  })();

  const peakHour = hourlyData.reduce(
    (max, curr) => (curr.count > max.count ? curr : max),
    { hour: "N/A", count: 0 },
  );

  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Visitor Analytics</h1>
          </div>
        </div>

        <Card className="border-card-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date Range
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
                  data-testid="input-analytics-start-date"
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
                  data-testid="input-analytics-end-date"
                />
              </div>
              <Button
                onClick={() => refetch()}
                className="gap-2"
                data-testid="button-analytics-apply"
              >
                <Search className="h-4 w-4" />
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border-card-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Visitors
                      </p>
                      <p
                        className="text-2xl font-bold"
                        data-testid="text-total-visitors"
                      >
                        {totalVisitors}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Currently In
                      </p>
                      <p
                        className="text-2xl font-bold"
                        data-testid="text-checked-in"
                      >
                        {checkedIn}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peak Hour</p>
                      <p
                        className="text-2xl font-bold"
                        data-testid="text-peak-hour"
                      >
                        {peakHour.hour}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Avg Visit (min)
                      </p>
                      <p
                        className="text-2xl font-bold"
                        data-testid="text-avg-duration"
                      >
                        {Math.round(avgDurationMinutes) || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Visitors by Hour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hourlyData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={hourlyData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="hsl(210, 70%, 50%)"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Visit Purpose Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purposeData.length > 0 ? (
                    <div className="h-64 flex items-center">
                      <ResponsiveContainer width="50%" height="100%">
                        <PieChart>
                          <Pie
                            data={purposeData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={false}
                          >
                            {purposeData.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex-1 space-y-2">
                        {purposeData.map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className="w-3 h-3 rounded-sm"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                            <span className="truncate flex-1">{item.name}</span>
                            <span className="font-medium">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Visitor Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyTrend.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={dailyTrend}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            className="fill-muted-foreground"
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="visitors"
                            stroke="hsl(150, 60%, 45%)"
                            strokeWidth={2}
                            dot={{ fill: "hsl(150, 60%, 45%)" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-card-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Top Destinations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {destinationData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={destinationData} layout="vertical">
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis
                            type="number"
                            tick={{ fontSize: 11 }}
                            className="fill-muted-foreground"
                          />
                          <YAxis
                            dataKey="name"
                            type="category"
                            tick={{ fontSize: 11 }}
                            width={100}
                            className="fill-muted-foreground"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                            }}
                          />
                          <Bar
                            dataKey="value"
                            fill="hsl(30, 80%, 55%)"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      No data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
