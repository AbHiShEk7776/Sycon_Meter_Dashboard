"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Zap, Shield, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [enable2FA, setEnable2FA] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      if (email === "admin@electric.com") {
        localStorage.setItem("userRole", "admin")
        localStorage.setItem("userId", "admin-001")
        router.push("/dashboard")
      } else if (email === "user@company.com") {
        localStorage.setItem("userRole", "user")
        localStorage.setItem("userId", "user-001")
        localStorage.setItem("customerId", "COMP001")
        router.push("/dashboard")
      } else {
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials. Try admin@electric.com or user@company.com",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="lightning-effect absolute inset-0 opacity-20"></div>

      <Card className="w-full max-w-md electric-glow">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-primary/20 electric-pulse">
              <Zap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl electric-text">ElectricPulse</CardTitle>
          <CardDescription>Advanced Meter Reading Analytics Platform</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@electric.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="electric-glow"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="electric-glow pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="2fa" checked={enable2FA} onCheckedChange={setEnable2FA} />
              <Label htmlFor="2fa" className="text-sm flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Enable Two-Factor Authentication
              </Label>
            </div>

            <Button type="submit" className="w-full electric-pulse" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="loading-orb w-4 h-4"></div>
                  Authenticating...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo Credentials:</p>
            <p>Admin: admin@electric.com</p>
            <p>User: user@company.com</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
