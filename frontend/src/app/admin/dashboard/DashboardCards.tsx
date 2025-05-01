'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Music, CreditCard, PlayCircle, TrendingUp, TrendingDown } from "lucide-react"
import { formatNumber, formatCurrency } from "@/lib/utils"

// Mock data for demonstration
const stats = [
  {
    title: "Total Users",
    value: 15824,
    change: 12.5,
    icon: Users,
    positive: true,
  },
  {
    title: "Total Tracks",
    value: 6482,
    change: 8.2,
    icon: Music,
    positive: true,
  },
  {
    title: "Total Revenue",
    value: 48293.45,
    change: -2.5,
    icon: CreditCard,
    positive: false,
    isCurrency: true,
  },
  {
    title: "Total Plays",
    value: 1243567,
    change: 18.3,
    icon: PlayCircle,
    positive: true,
  },
]

export function DashboardCards() {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.isCurrency 
                ? formatCurrency(stat.value) 
                : formatNumber(stat.value)
              }
            </div>
            <p className="text-xs flex items-center pt-1">
              {stat.positive ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
              )}
              <span
                className={
                  stat.positive ? "text-green-600" : "text-red-600"
                }
              >
                {stat.positive ? "+" : ""}
                {stat.change}%
              </span>{" "}
              <span className="text-muted-foreground ml-1">from last month</span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}