"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, DollarSign, Activity, Plus, Edit, Trash2, Shield } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"

// Mock data
const users = [
  {
    id: 1,
    name: "John Admin",
    email: "admin@electric.com",
    role: "Admin",
    customerId: "ALL",
    status: "Active",
    lastLogin: "2024-01-15 09:30",
  },
  {
    id: 2,
    name: "Sarah Manager",
    email: "sarah@company1.com",
    role: "User",
    customerId: "COMP001",
    status: "Active",
    lastLogin: "2024-01-15 08:45",
  },
  {
    id: 3,
    name: "Mike Operator",
    email: "mike@company2.com",
    role: "User",
    customerId: "COMP002",
    status: "Inactive",
    lastLogin: "2024-01-10 16:20",
  },
]

const tariffs = [
  { id: 1, name: "Standard Rate", peakRate: 0.15, offPeakRate: 0.1, demandCharge: 12.5, company: "COMP001" },
  { id: 2, name: "Industrial Rate", peakRate: 0.12, offPeakRate: 0.08, demandCharge: 15.0, company: "COMP002" },
]

const auditLogs = [
  {
    id: 1,
    action: "User Login",
    user: "admin@electric.com",
    timestamp: "2024-01-15 09:30:15",
    details: "Successful login from 192.168.1.100",
  },
  {
    id: 2,
    action: "Tariff Update",
    user: "admin@electric.com",
    timestamp: "2024-01-15 09:15:30",
    details: "Updated peak rate for COMP001",
  },
  {
    id: 3,
    action: "User Created",
    user: "admin@electric.com",
    timestamp: "2024-01-14 14:20:45",
    details: "Created new user: mike@company2.com",
  },
]

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("users")
  const [showUserForm, setShowUserForm] = useState(false)
  const [showTariffForm, setShowTariffForm] = useState(false)
  const { toast } = useToast()

  const handleCreateUser = () => {
    toast({
      title: "User Created",
      description: "New user has been successfully created.",
    })
    setShowUserForm(false)
  }

  const handleCreateTariff = () => {
    toast({
      title: "Tariff Created",
      description: "New tariff structure has been saved.",
    })
    setShowTariffForm(false)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold electric-text">Admin Panel</h1>
            <p className="text-muted-foreground">System administration and configuration</p>
          </div>
          <Badge className="electric-pulse">
            <Shield className="h-4 w-4 mr-2" />
            Administrator Access
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="tariffs">Tariff Management</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      User Management
                    </CardTitle>
                    <CardDescription>Create, edit, and manage user accounts</CardDescription>
                  </div>
                  <Button onClick={() => setShowUserForm(true)} className="electric-pulse">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showUserForm && (
                  <Card className="mb-6 electric-glow">
                    <CardHeader>
                      <CardTitle>Create New User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Enter email address" />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="user">User</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer">Customer ID</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select customer" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COMP001">COMP001</SelectItem>
                              <SelectItem value="COMP002">COMP002</SelectItem>
                              <SelectItem value="COMP003">COMP003</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateUser}>Create User</Button>
                        <Button variant="outline" onClick={() => setShowUserForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Customer ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Login</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>{user.customerId}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tariffs" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Tariff Management
                    </CardTitle>
                    <CardDescription>Configure electricity pricing structures</CardDescription>
                  </div>
                  <Button onClick={() => setShowTariffForm(true)} className="electric-pulse">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tariff
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showTariffForm && (
                  <Card className="mb-6 electric-glow">
                    <CardHeader>
                      <CardTitle>Create New Tariff</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="tariffName">Tariff Name</Label>
                          <Input id="tariffName" placeholder="Enter tariff name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select company" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="COMP001">COMP001</SelectItem>
                              <SelectItem value="COMP002">COMP002</SelectItem>
                              <SelectItem value="COMP003">COMP003</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="peakRate">Peak Rate ($/kWh)</Label>
                          <Input id="peakRate" type="number" step="0.01" placeholder="0.15" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="offPeakRate">Off-Peak Rate ($/kWh)</Label>
                          <Input id="offPeakRate" type="number" step="0.01" placeholder="0.10" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="demandCharge">Demand Charge ($/kW)</Label>
                          <Input id="demandCharge" type="number" step="0.01" placeholder="12.50" />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCreateTariff}>Create Tariff</Button>
                        <Button variant="outline" onClick={() => setShowTariffForm(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tariff Name</TableHead>
                      <TableHead>Peak Rate</TableHead>
                      <TableHead>Off-Peak Rate</TableHead>
                      <TableHead>Demand Charge</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tariffs.map((tariff) => (
                      <TableRow key={tariff.id}>
                        <TableCell className="font-medium">{tariff.name}</TableCell>
                        <TableCell>${tariff.peakRate}/kWh</TableCell>
                        <TableCell>${tariff.offPeakRate}/kWh</TableCell>
                        <TableCell>${tariff.demandCharge}/kW</TableCell>
                        <TableCell>{tariff.company}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card className="meter-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Audit Log
                </CardTitle>
                <CardDescription>System activity and security events</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.action}</TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{log.timestamp}</TableCell>
                        <TableCell className="text-sm">{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
