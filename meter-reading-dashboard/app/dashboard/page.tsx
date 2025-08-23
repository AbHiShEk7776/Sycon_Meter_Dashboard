"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Zap,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Activity,
  Gauge,
  BarChart3,
  Bell,
  AlertTriangle,
} from "lucide-react"
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import DashboardLayout from "@/components/dashboard-layout"
import { useDashboardStats, useLatestReading } from "@/hooks/use-meter-data"
import { RealTimeMonitor } from "@/components/real-time-monitor"

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("")
  const [customerId, setCustomerId] = useState<string>("")
  const [summaryData, setSummaryData] = useState<any>(null)

  const { stats, loading: statsLoading, error: statsError } = useDashboardStats()
  const { reading: latestReading, loading: readingLoading } = useLatestReading("MTR-001")

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole") || "")
    setCustomerId(localStorage.getItem("customerId") || "")

    // Fetch additional summary data for better cost calculations
    fetchSummaryData()
  }, [])

  const fetchSummaryData = async () => {
    try {
      const response = await fetch("/api/reports/summary?meterId=MTR-001&days=30")
      const data = await response.json()
      setSummaryData(data)
    } catch (error) {
      console.error("Failed to fetch summary data:", error)
    }
  }

  const chartConfig = {
    kwh: {
      label: "Energy (kWh)",
      color: "hsl(var(--chart-1))",
    },
    cost: {
      label: "Cost ($)",
      color: "hsl(var(--chart-2))",
    },
    kwt: {
      label: "Power (kW)",
      color: "hsl(var(--chart-1))",
    },
  }

  const consumptionData =
    stats?.historicalData?.map((item: any, index: number) => ({
      date: item.hour,
      kwh: Math.round(item.total_energy || 0),
      cost: Math.round((item.total_energy || 0) * 0.15),
    })) || []

  // Calculate efficiency metrics
  const powerFactorStatus = stats?.avgPowerFactor > 0.9 ? "Excellent" : stats?.avgPowerFactor > 0.8 ? "Good" : "Poor"
  const powerFactorColor =
    stats?.avgPowerFactor > 0.9 ? "text-green-500" : stats?.avgPowerFactor > 0.8 ? "text-yellow-500" : "text-red-500"

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-orb"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (statsError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-red-500">Error loading dashboard: {statsError}</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Energy Dashboard</h1>
            <p className="text-muted-foreground">
              {userRole === "admin" ? "System Overview" : `Company: ${customerId}`}
            </p>
          </div>
          <Button className="electric-pulse">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Bill Estimate</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                ${summaryData ? summaryData.total_bill : Math.round((stats?.totalEnergy || 0) * 0.15)}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingDown className="inline h-3 w-3 mr-1" />
                Energy: ${summaryData ? summaryData.total_cost : Math.round((stats?.totalEnergy || 0) * 0.15)} + Demand:
                ${summaryData ? summaryData.peak_demand_charge : "12.50"}
              </p>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Demand</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {stats ? `${stats.totalPower.toFixed(1)} kW` : "0 kW"}
              </div>
              <p className="text-xs text-muted-foreground">
                <Activity className="inline h-3 w-3 mr-1" />
                Peak: {summaryData ? `${summaryData.peak_power?.toFixed(1)} kW` : "N/A"}
              </p>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Power Factor</CardTitle>
              <Gauge className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${powerFactorColor}`}>
                {stats ? stats.avgPowerFactor.toFixed(3) : "0.000"}
              </div>
              <Progress value={stats ? Number.parseFloat(stats.avgPowerFactor.toFixed(2)) * 100 : 0} className="mt-2" />
              <p className={`text-xs mt-1 ${powerFactorColor}`}>{powerFactorStatus}</p>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
              <Zap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summaryData ? `${summaryData.power_factor_efficiency}%` : "85%"}
              </div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                {summaryData ? summaryData.efficiency_rating : "Good"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Real-Time Monitor */}
        <RealTimeMonitor />

        {/* Main Charts */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Consumption Chart */}
          <Card className="meter-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Energy Consumption & Cost Trend
              </CardTitle>
              <CardDescription>Historical energy consumption with cost analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] chart-glow">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={consumptionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                    <XAxis
                      dataKey="date"
                      stroke="rgba(0,255,255,0.6)"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="rgba(0,255,255,0.6)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="kwh"
                      stroke="var(--color-kwh)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-kwh)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      stroke="var(--color-cost)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-cost)", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Top Meters */}
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Meter Overview
              </CardTitle>
              <CardDescription>Current power consumption by meter</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.topMeters && stats.topMeters.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topMeters} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                      <XAxis type="number" stroke="rgba(0,255,255,0.6)" />
                      <YAxis type="category" dataKey="name" stroke="rgba(0,255,255,0.6)" width={100} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="kwt" fill="var(--color-kwt)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No meter data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Reading Details */}
        {latestReading && (
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Latest Meter Reading (MTR-001)
              </CardTitle>
              <CardDescription>
                Last updated:{" "}
                {latestReading.timestamp
                  ? new Date(latestReading.timestamp).toLocaleString()
                  : "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Power</div>
                  <div className="text-xl font-bold text-primary">{latestReading.kwt?.toFixed(1)} kW</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Energy</div>
                  <div className="text-xl font-bold text-primary">{latestReading.kwh?.toFixed(1)} kWh</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Avg Voltage</div>
                  <div className="text-xl font-bold text-primary">
                    {(((latestReading.v1 || 0) + (latestReading.v2 || 0) + (latestReading.v3 || 0)) / 3).toFixed(1)}V
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Avg Current</div>
                  <div className="text-xl font-bold text-primary">
                    {(((latestReading.i1 || 0) + (latestReading.i2 || 0) + (latestReading.i3 || 0)) / 3).toFixed(1)}A
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Avg Power Factor</div>
                  <div className={`text-xl font-bold ${powerFactorColor}`}>
                    {(((latestReading.pf1 || 0) + (latestReading.pf2 || 0) + (latestReading.pf3 || 0)) / 3).toFixed(3)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Alerts */}
        <Card className="meter-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              System Status & Alerts
            </CardTitle>
            <CardDescription>Current system health and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.avgPowerFactor < 0.9 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">Low Power Factor Detected</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Power Factor: {stats.avgPowerFactor.toFixed(3)}</span>
                </div>
              )}

              {summaryData?.avg_voltage && (summaryData.avg_voltage < 220 || summaryData.avg_voltage > 240) && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span className="text-sm">Voltage Out of Range</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Avg Voltage: {summaryData.avg_voltage.toFixed(1)}V
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm">System Operating Normally</span>
                </div>
                <span className="text-xs text-muted-foreground">{stats?.meterCount || 0} meters active</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
