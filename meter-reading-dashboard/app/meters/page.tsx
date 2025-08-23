"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Zap, Search, TrendingUp, Activity, Gauge } from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import DashboardLayout from "@/components/dashboard-layout"
import { useMeters, useLatestReading, useMeterReadings } from "@/hooks/use-meter-data"

// Mock sparkline data
const generateSparklineData = () => {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    kwh: Math.random() * 100 + 50,
  }))
}

interface MeterNodeProps {
  meter: any
  level: number
  onSelect: (meter: any) => void
  selectedId: string | null
}

function MeterNode({ meter, level, onSelect, selectedId }: MeterNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const hasChildren = meter.children && meter.children.length > 0
  const sparklineData = generateSparklineData()

  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all meter-card ${
          selectedId === meter.meter_id ? "electric-glow" : ""
        }`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => onSelect(meter)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        )}

        <div className="flex items-center gap-2 flex-1">
          <Zap className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <div className="font-medium">{meter.name}</div>
            <div className="text-xs text-muted-foreground">{meter.description || meter.location}</div>
          </div>

          {/* Sparkline */}
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line type="monotone" dataKey="kwh" stroke="hsl(var(--primary))" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <Badge variant="outline" className="text-xs">
            {meter.status || "Active"}
          </Badge>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="space-y-2">
          {meter.children.map((child: any) => (
            <MeterNode key={child.id} meter={child} level={level + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function MetersPage() {
  const [selectedMeter, setSelectedMeter] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  const { meters, loading: metersLoading } = useMeters()
  const { reading: selectedMeterReading, loading: readingLoading } = useLatestReading(selectedMeter?.meter_id || "")
  const { readings: historicalReadings } = useMeterReadings(selectedMeter?.meter_id || "", { limit: 10 })

  const handleMeterSelect = (meter: any) => {
    setSelectedMeter(meter)
  }

  // Create forecast data from historical readings
  const forecastData = historicalReadings.slice(0, 7).map((reading: any, index: number) => ({
    day: new Date(reading.timestamp).toLocaleDateString("en-US", { weekday: "short" }),
    predicted: reading.kwh || 0,
  }))

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Meter Hierarchy</h1>
            <p className="text-muted-foreground">Interactive meter tree with real-time monitoring</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Meter Tree */}
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Available Meters
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search meters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-[600px] overflow-y-auto">
              {metersLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="loading-orb"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {meters
                    .filter(
                      (meter) =>
                        meter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        meter.meter_id?.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                    .map((meter) => (
                      <div
                        key={meter.meter_id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all meter-card ${
                          selectedMeter?.meter_id === meter.meter_id ? "electric-glow" : ""
                        }`}
                        onClick={() => handleMeterSelect(meter)}
                      >
                        <Zap className="h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">{meter.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ID: {meter.meter_id} • {meter.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {meter.status}
                        </Badge>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meter Details */}
          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                {selectedMeter ? selectedMeter.name : "Select a Meter"}
              </CardTitle>
              {selectedMeter && (
                <CardDescription>
                  {selectedMeter.description || selectedMeter.location} • ID: {selectedMeter.meter_id}
                </CardDescription>
              )}
              {selectedMeter && (
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === "details" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </Button>
                  <Button
                    variant={activeTab === "forecast" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveTab("forecast")}
                  >
                    Historical Data
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!selectedMeter ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  Click on a meter to view details
                </div>
              ) : readingLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="loading-orb"></div>
                </div>
              ) : activeTab === "details" && selectedMeterReading ? (
                <div className="space-y-6">
                  {/* Current Power */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Current Power</div>
                      <div className="text-2xl font-bold text-primary">{selectedMeterReading.kwt?.toFixed(1)} kW</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <div className="text-sm text-muted-foreground">Energy</div>
                      <div className="text-2xl font-bold text-primary">{selectedMeterReading.kwh?.toFixed(1)} kWh</div>
                    </div>
                  </div>

                  {/* Voltage */}
                  <div>
                    <h4 className="font-medium mb-3">Voltage (V)</h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 1</div>
                        <div className="font-medium">{selectedMeterReading.v1?.toFixed(1)}V</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 2</div>
                        <div className="font-medium">{selectedMeterReading.v2?.toFixed(1)}V</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 3</div>
                        <div className="font-medium">{selectedMeterReading.v3?.toFixed(1)}V</div>
                      </div>
                    </div>
                  </div>

                  {/* Current */}
                  <div>
                    <h4 className="font-medium mb-3">Current (A)</h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 1</div>
                        <div className="font-medium">{selectedMeterReading.i1?.toFixed(1)}A</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 2</div>
                        <div className="font-medium">{selectedMeterReading.i2?.toFixed(1)}A</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 3</div>
                        <div className="font-medium">{selectedMeterReading.i3?.toFixed(1)}A</div>
                      </div>
                    </div>
                  </div>

                  {/* Power Factor */}
                  <div>
                    <h4 className="font-medium mb-3">Power Factor</h4>
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 1</div>
                        <div className="font-medium">{selectedMeterReading.pf1?.toFixed(3)}</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 2</div>
                        <div className="font-medium">{selectedMeterReading.pf2?.toFixed(3)}</div>
                      </div>
                      <div className="p-3 rounded bg-muted/30">
                        <div className="text-xs text-muted-foreground">Phase 3</div>
                        <div
                          className={`font-medium ${(selectedMeterReading.pf3 || 0) < 0.9 ? "text-yellow-500" : ""}`}
                        >
                          {selectedMeterReading.pf3?.toFixed(3)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="p-3 rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Last Reading</div>
                    <div className="font-medium">
                      {selectedMeterReading.timestamp
                        ? new Date(selectedMeterReading.timestamp).toLocaleString()
                        : "N/A"}
                    </div>
                  </div>
                </div>
              ) : activeTab === "forecast" && historicalReadings.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Recent Historical Data
                  </div>
                  <div className="space-y-3">
                    {historicalReadings.slice(0, 10).map((reading: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div>
                          <div className="font-medium">{new Date(reading.timestamp).toLocaleDateString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(reading.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{reading.kwt?.toFixed(1)} kW</div>
                          <div className="text-xs text-muted-foreground">{reading.kwh?.toFixed(1)} kWh</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No data available for selected meter
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
