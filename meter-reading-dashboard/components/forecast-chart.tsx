"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, Download } from "lucide-react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ForecastData {
  date: string
  predicted_power: number
  confidence_level: number
  predicted_energy: number
  trend: string
}

export function ForecastChart() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [meterId, setMeterId] = useState("MTR-001")
  const [days, setDays] = useState("7")

  const fetchForecast = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics/forecast?meterId=${meterId}&days=${days}`)
      const data = await response.json()
      if (data.forecast) {
        setForecastData(data.forecast)
      }
    } catch (error) {
      console.error("Failed to fetch forecast:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecast()
  }, [meterId, days])

  const chartConfig = {
    predicted_power: {
      label: "Predicted Power (kW)",
      color: "hsl(var(--chart-1))",
    },
    confidence_level: {
      label: "Confidence Level",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <Card className="meter-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Power Consumption Forecast
            </CardTitle>
            <CardDescription>AI-powered predictive analytics</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 days</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="14">14 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={fetchForecast} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="loading-orb"></div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[300px] chart-glow">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                <XAxis
                  dataKey="date"
                  stroke="rgba(0,255,255,0.6)"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="rgba(0,255,255,0.6)" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="predicted_power"
                  stroke="var(--color-predicted_power)"
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={{ fill: "var(--color-predicted_power)", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}

        {forecastData.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Trend Direction</div>
              <div className="font-medium capitalize">{forecastData[0]?.trend}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
              <div className="font-medium">
                {((forecastData.reduce((sum, d) => sum + d.confidence_level, 0) / forecastData.length) * 100).toFixed(
                  0,
                )}
                %
              </div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Peak Forecast</div>
              <div className="font-medium">{Math.max(...forecastData.map((d) => d.predicted_power)).toFixed(1)} kW</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
