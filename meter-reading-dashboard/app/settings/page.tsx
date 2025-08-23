"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Database, Shield, Save } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [theme, setTheme] = useState("dark")
  const [currency, setCurrency] = useState("USD")
  const [energyRate, setEnergyRate] = useState("0.15")
  const [demandRate, setDemandRate] = useState("12.50")
  const { toast } = useToast()

  const handleSaveSettings = () => {
    // Save settings to localStorage or API
    localStorage.setItem(
      "settings",
      JSON.stringify({
        notifications,
        autoRefresh,
        refreshInterval,
        theme,
        currency,
        energyRate,
        demandRate,
      }),
    )

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application preferences</p>
          </div>
          <Button onClick={handleSaveSettings} className="electric-pulse">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  General Settings
                </CardTitle>
                <CardDescription>Configure your application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh dashboard data</p>
                  </div>
                  <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>

                {autoRefresh && (
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for system events</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Power Factor Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when power factor drops below 0.9</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>High Demand Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert when power demand exceeds threshold</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Voltage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Alert for voltage imbalance or out-of-range conditions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  Billing Configuration
                </CardTitle>
                <CardDescription>Configure energy rates and billing parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="energyRate">Energy Rate ($/kWh)</Label>
                    <Input
                      id="energyRate"
                      type="number"
                      step="0.01"
                      value={energyRate}
                      onChange={(e) => setEnergyRate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demandRate">Demand Rate ($/kW)</Label>
                    <Input
                      id="demandRate"
                      type="number"
                      step="0.01"
                      value={demandRate}
                      onChange={(e) => setDemandRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-2">Current Billing Structure</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Energy Charge: ${energyRate} per kWh</p>
                    <p>Demand Charge: ${demandRate} per kW</p>
                    <p>Power Factor Penalty: Applied if PF &lt; 0.9</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage your account security and access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>

                <Button variant="outline">Update Password</Button>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
