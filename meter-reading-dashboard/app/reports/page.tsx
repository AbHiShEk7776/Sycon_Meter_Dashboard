"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Download, Calendar, Filter, TrendingUp, Activity, DollarSign } from "lucide-react"
import { Line, LineChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("last30days")
  const [selectedMeters, setSelectedMeters] = useState("MTR-001")
  const [granularity, setGranularity] = useState("daily")
  const [comparisonMode, setComparisonMode] = useState(false)
  const [consumptionData, setConsumptionData] = useState<any[]>([])
  const [comparisonData, setComparisonData] = useState<any[]>([])
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReportData()
  }, [selectedMeters, granularity, dateRange])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      // Fetch consumption data
      const consumptionResponse = await fetch(
        `/api/reports/consumption?meterId=${selectedMeters}&period=${granularity}&days=30`,
      )
      const consumption = await consumptionResponse.json()
      setConsumptionData(Array.isArray(consumption) ? consumption : [])

      // Fetch comparison data
      const comparisonResponse = await fetch(`/api/reports/comparison?meterId=${selectedMeters}&period=${granularity}`)
      const comparison = await comparisonResponse.json()
      setComparisonData(Array.isArray(comparison) ? comparison : [])

      // Fetch summary data
      const summaryResponse = await fetch(`/api/reports/summary?meterId=${selectedMeters}&days=30`)
      const summary = await summaryResponse.json()
      setSummaryData(summary)
    } catch (error) {
      console.error("Failed to fetch report data:", error)
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      })
      // Set empty arrays on error
      setConsumptionData([])
      setComparisonData([])
      setSummaryData(null)
    } finally {
      setLoading(false)
    }
  }

  const chartConfig = {
    avg_power: {
      label: "Average Power (kW)",
      color: "hsl(var(--chart-1))",
    },
    peak_power: {
      label: "Peak Power (kW)",
      color: "hsl(var(--chart-2))",
    },
    current_power: {
      label: "Current Period",
      color: "hsl(var(--chart-1))",
    },
    previous_power: {
      label: "Previous Period",
      color: "hsl(var(--chart-2))",
    },
  }

  const handleExportPDF = () => {
    toast({
      title: "Export Started",
      description: "Your PDF report is being generated...",
    })
  }

  const handleExportCSV = async () => {
    try {
      const params = new URLSearchParams({
        meterId: selectedMeters,
        startDate: "2025-07-25",
        endDate: "2025-07-25",
      })

      const response = await fetch(`/api/export/csv?${params}`)
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `meter_data_${selectedMeters}_${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export Complete",
        description: "Your CSV file has been downloaded.",
      })
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="loading-orb"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Reports & Analysis</h1>
            <p className="text-muted-foreground">Deep-dive analytics and data export capabilities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleExportPDF} className="electric-pulse">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="meter-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Report Filters
            </CardTitle>
            <CardDescription>Configure your analysis parameters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="dateRange">Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7days">Last 7 Days</SelectItem>
                    <SelectItem value="last30days">Last 30 Days</SelectItem>
                    <SelectItem value="last90days">Last 90 Days</SelectItem>
                    <SelectItem value="lastyear">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meters">Meters</Label>
                <Select value={selectedMeters} onValueChange={setSelectedMeters}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTR-001">MTR-001 (Main Building)</SelectItem>
                    <SelectItem value="all">All Meters</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="granularity">Data Granularity</Label>
                <Select value={granularity} onValueChange={setGranularity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison">Comparison Mode</Label>
                <Button
                  variant={comparisonMode ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setComparisonMode(!comparisonMode)}
                >
                  {comparisonMode ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {summaryData && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="meter-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Consumption</CardTitle>
                <Activity className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{summaryData.avg_energy?.toFixed(1)} kWh</div>
                <p className="text-xs text-muted-foreground">Peak: {summaryData.peak_power?.toFixed(1)} kW</p>
              </CardContent>
            </Card>

            <Card className="meter-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">${summaryData.total_bill}</div>
                <p className="text-xs text-muted-foreground">
                  Energy: ${summaryData.total_cost} + Demand: ${summaryData.peak_demand_charge}
                </p>
              </CardContent>
            </Card>

            <Card className="meter-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Power Factor</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{summaryData.avg_power_factor?.toFixed(3)}</div>
                <p className="text-xs text-muted-foreground">Efficiency: {summaryData.efficiency_rating}</p>
              </CardContent>
            </Card>

            <Card className="meter-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{summaryData.total_readings}</div>
                <p className="text-xs text-muted-foreground">Readings available</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Consumption Trend */}
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Power Consumption Trend
              </CardTitle>
              <CardDescription>
                {granularity.charAt(0).toUpperCase() + granularity.slice(1)} power consumption analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] chart-glow">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={Array.isArray(consumptionData) ? consumptionData : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                    <XAxis
                      dataKey="formatted_period"
                      stroke="rgba(0,255,255,0.6)"
                      tickFormatter={(value) => {
                        if (granularity === "hourly") return new Date(value).toLocaleTimeString()
                        return new Date(value).toLocaleDateString()
                      }}
                    />
                    <YAxis stroke="rgba(0,255,255,0.6)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="avg_power"
                      stroke="var(--color-avg_power)"
                      strokeWidth={3}
                      dot={{ fill: "var(--color-avg_power)", strokeWidth: 2, r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="peak_power"
                      stroke="var(--color-peak_power)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "var(--color-peak_power)", strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Period Comparison */}
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Period Comparison
              </CardTitle>
              <CardDescription>Current vs historical performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Array.isArray(comparisonData) ? comparisonData.slice(0, 10) : []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                    <XAxis
                      dataKey="period"
                      stroke="rgba(0,255,255,0.6)"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis stroke="rgba(0,255,255,0.6)" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current_power" fill="var(--color-current_power)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="previous_power" fill="var(--color-previous_power)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis */}
        <Card className="meter-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Detailed Performance Analysis
            </CardTitle>
            <CardDescription>Key performance indicators and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(consumptionData) && consumptionData.length > 0 ? (
                consumptionData.slice(0, 10).map((reading: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{new Date(reading.formatted_period).toLocaleDateString()}</h4>
                        <p className="text-sm text-muted-foreground">
                          Avg: {reading.avg_power?.toFixed(1)} kW | Peak: {reading.peak_power?.toFixed(1)} kW
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{reading.avg_energy?.toFixed(1)} kWh</div>
                      <Badge variant={reading.avg_power_factor > 0.9 ? "default" : "secondary"}>
                        PF: {reading.avg_power_factor?.toFixed(2)}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  No consumption data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
