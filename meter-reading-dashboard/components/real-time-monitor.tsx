"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Database, Zap } from "lucide-react"
import { useDashboardStats } from "@/hooks/use-meter-data"

export function RealTimeMonitor() {
  const { stats, loading } = useDashboardStats()

  return (
    <Card className="meter-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Database Monitor
          <Badge variant="default" className="ml-auto">
            <Database className="h-3 w-3 mr-1" />
            Static Data
          </Badge>
        </CardTitle>
        <CardDescription>Historical meter readings from database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-muted-foreground py-8">Loading meter data...</div>
          ) : stats?.latestReadings?.length > 0 ? (
            stats.latestReadings.map((reading: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium">{reading.meter_id}</div>
                    <div className="text-xs text-muted-foreground">{new Date(reading.timestamp).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary">{reading.kwt?.toFixed(1)} kW</div>
                  <div className="text-xs text-muted-foreground">
                    PF: {((reading.pf1 + reading.pf2 + reading.pf3) / 3).toFixed(2)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">No meter data available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
