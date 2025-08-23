"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertTriangle, Bell, Plus, Settings, Activity } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [showAlertForm, setShowAlertForm] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const response = await fetch("/api/alerts")
        const data = await response.json()
        setAlerts(data)
      } catch (error) {
        console.error("Failed to fetch alerts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getAlertBadge = (type: string) => {
    switch (type) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return <Badge variant="secondary">Warning</Badge>
      case "info":
        return <Badge variant="default">Info</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "acknowledged":
        return <Badge variant="secondary">Acknowledged</Badge>
      case "resolved":
        return <Badge variant="default">Resolved</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  const handleCreateAlert = () => {
    toast({
      title: "Custom Alert Created",
      description: "Your custom alert has been configured successfully.",
    })
    setShowAlertForm(false)
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (activeTab === "active") return alert.status === "active"
    if (activeTab === "acknowledged") return alert.status === "acknowledged"
    if (activeTab === "resolved") return alert.status === "resolved"
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Notification Center</h1>
            <p className="text-muted-foreground">Monitor alerts, anomalies, and system notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowAlertForm(true)} className="electric-pulse">
              <Plus className="h-4 w-4 mr-2" />
              Custom Alert
            </Button>
          </div>
        </div>

        {/* Alert Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {alerts.filter((a) => a.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acknowledged</CardTitle>
              <Bell className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">
                {alerts.filter((a) => a.status === "acknowledged").length}
              </div>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {alerts.filter((a) => a.status === "resolved").length}
              </div>
            </CardContent>
          </Card>

          <Card className="meter-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium">Custom Alerts</CardTitle>
              <Settings className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">0</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="custom">Custom Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Active Alerts
                </CardTitle>
                <CardDescription>Alerts requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border-l-4 border-l-red-500"
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            {getAlertBadge(alert.type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Meter: {alert.meter}</span>
                            <span>Value: {alert.value}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                        <Button size="sm">Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acknowledged" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-yellow-500" />
                  Acknowledged Alerts
                </CardTitle>
                <CardDescription>Alerts that have been acknowledged but not resolved</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border-l-4 border-l-yellow-500"
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            {getAlertBadge(alert.type)}
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Meter: {alert.meter}</span>
                            <span>Value: {alert.value}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm">Resolve</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Resolved Alerts
                </CardTitle>
                <CardDescription>Recently resolved alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-start justify-between p-4 rounded-lg bg-muted/50 border-l-4 border-l-green-500"
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{alert.title}</h4>
                            {getAlertBadge(alert.type)}
                            {getStatusBadge(alert.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Meter: {alert.meter}</span>
                            <span>Value: {alert.value}</span>
                            <span>{alert.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      Custom Alert Rules
                    </CardTitle>
                    <CardDescription>Configure custom monitoring conditions</CardDescription>
                  </div>
                  <Button onClick={() => setShowAlertForm(true)} className="electric-pulse">
                    <Plus className="h-4 w-4 mr-2" />
                    New Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAlertForm && (
                  <Card className="mb-6 electric-glow">
                    <CardHeader>
                      <CardTitle>Create Custom Alert</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="alertName">Alert Name</Label>
                          <Input id="alertName" placeholder="Enter alert name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="meter">Meter</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select meter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ALL_METERS">All Meters</SelectItem>
                              <SelectItem value="MAIN_BUILDING">Main Building</SelectItem>
                              <SelectItem value="PROD_LINE_A">Production Line A</SelectItem>
                              <SelectItem value="HVAC_SYSTEM">HVAC System</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="parameter">Parameter</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select parameter" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kwt">Power (kW)</SelectItem>
                              <SelectItem value="kwh">Energy (kWh)</SelectItem>
                              <SelectItem value="pf">Power Factor</SelectItem>
                              <SelectItem value="voltage">Voltage</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="condition">Condition</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="gt">Greater than</SelectItem>
                              <SelectItem value="lt">Less than</SelectItem>
                              <SelectItem value="eq">Equal to</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="threshold">Threshold</Label>
                          <Input id="threshold" type="number" placeholder="Enter value" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateAlert}>Create Alert</Button>
                        <Button variant="outline" onClick={() => setShowAlertForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">{/* Custom alerts data will be fetched from the database */}</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
