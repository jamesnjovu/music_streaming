'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatNumber } from "@/lib/utils"

// Mock data for demonstration
const monthlyData = [
  { name: "Jan", users: 1200, plays: 87000, subscriptions: 145 },
  { name: "Feb", users: 1400, plays: 95000, subscriptions: 182 },
  { name: "Mar", users: 1800, plays: 110000, subscriptions: 210 },
  { name: "Apr", users: 2200, plays: 135000, subscriptions: 252 },
  { name: "May", users: 2600, plays: 162000, subscriptions: 315 },
  { name: "Jun", users: 2900, plays: 182000, subscriptions: 368 },
  { name: "Jul", users: 3150, plays: 201000, subscriptions: 412 },
  { name: "Aug", users: 3400, plays: 223000, subscriptions: 476 },
  { name: "Sep", users: 3700, plays: 248000, subscriptions: 527 },
  { name: "Oct", users: 4100, plays: 279000, subscriptions: 586 },
  { name: "Nov", users: 4450, plays: 308000, subscriptions: 642 },
  { name: "Dec", users: 4800, plays: 328000, subscriptions: 684 },
]

const weeklyData = [
  { name: "Mon", users: 680, plays: 48000, subscriptions: 89 },
  { name: "Tue", users: 720, plays: 52000, subscriptions: 97 },
  { name: "Wed", users: 800, plays: 58000, subscriptions: 105 },
  { name: "Thu", users: 850, plays: 62000, subscriptions: 112 },
  { name: "Fri", users: 920, plays: 68000, subscriptions: 120 },
  { name: "Sat", users: 1050, plays: 75000, subscriptions: 135 },
  { name: "Sun", users: 890, plays: 64000, subscriptions: 110 },
]

const dailyData = Array.from({ length: 24 }, (_, i) => {
  // Generate some hourly data with a pattern
  const hour = i;
  const timeOfDay = i < 12 ? "AM" : "PM";
  const displayHour = i % 12 === 0 ? 12 : i % 12;
  
  // Activity level based on time of day
  const activityFactor = 
    i >= 8 && i <= 11 ? 0.8 :  // Morning peak
    i >= 12 && i <= 14 ? 0.7 : // Lunch hours
    i >= 17 && i <= 22 ? 1.0 : // Evening peak
    i >= 0 && i <= 5 ? 0.2 :   // Overnight low
    0.5;                       // Default level
  
  return {
    name: `${displayHour}${timeOfDay}`,
    users: Math.round(120 * activityFactor + Math.random() * 40),
    plays: Math.round(9000 * activityFactor + Math.random() * 2000),
    subscriptions: Math.round(18 * activityFactor + Math.random() * 5),
  };
});

type ChartMetric = "users" | "plays" | "subscriptions";

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>
          Track platform activity across different metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="plays">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="plays">Plays</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            </TabsList>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" defaultChecked>Monthly</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Plays tab content */}
          <TabsContent value="plays" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => formatNumber(Number(value))}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {/* Users tab content */}
          <TabsContent value="users" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => formatNumber(Number(value))}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          {/* Subscriptions tab content */}
          <TabsContent value="subscriptions" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip 
                  formatter={(value) => formatNumber(Number(value))}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Line
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#d946ef"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}