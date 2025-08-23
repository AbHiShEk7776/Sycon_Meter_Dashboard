"use client"

import { useState, useEffect } from "react"
import type { MeterReading, Meter } from "@/lib/database"

export function useMeters() {
  const [meters, setMeters] = useState<Meter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMeters() {
      try {
        const response = await fetch("/api/meters")
        if (!response.ok) throw new Error("Failed to fetch meters")
        const data = await response.json()
        setMeters(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchMeters()
  }, [])

  return { meters, loading, error }
}

export function useMeterReadings(
  meterId: string,
  options?: {
    limit?: number
    startDate?: string
    endDate?: string
  },
) {
  const [readings, setReadings] = useState<MeterReading[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!meterId) return

    async function fetchReadings() {
      try {
        const params = new URLSearchParams()
        if (options?.limit) params.append("limit", options.limit.toString())
        if (options?.startDate) params.append("startDate", options.startDate)
        if (options?.endDate) params.append("endDate", options.endDate)

        const response = await fetch(`/api/meters/${meterId.toLowerCase()}/readings?${params}`)
        if (!response.ok) throw new Error("Failed to fetch readings")
        const data = await response.json()
        setReadings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchReadings()
  }, [meterId, options?.limit, options?.startDate, options?.endDate])

  return { readings, loading, error }
}

export function useLatestReading(meterId: string) {
  const [reading, setReading] = useState<MeterReading | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!meterId) return

    async function fetchLatestReading() {
      try {
        const response = await fetch(`/api/meters/${meterId.toLowerCase()}/latest`)
        if (!response.ok) throw new Error("Failed to fetch latest reading")
        const data = await response.json()
        setReading(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchLatestReading()
  }, [meterId])

  return { reading, loading, error }
}

export function useDashboardStats() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/dashboard/stats")
        if (!response.ok) throw new Error("Failed to fetch dashboard stats")
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}
