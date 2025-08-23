import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    // Get latest readings for dashboard stats
    const latestReadings = (await executeQuery(`
      SELECT 
        meter_id,
        kwt,
        kwh,
        pf1, pf2, pf3,
        v1, v2, v3,
        i1, i2, i3,
        timestamp
      FROM meter_readings mr1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM meter_readings mr2 
        WHERE mr2.meter_id = mr1.meter_id
      )
      ORDER BY meter_id
    `)) as any[]

    // Calculate aggregated stats
    const totalPower = latestReadings.reduce((sum: number, reading: any) => sum + (reading.kwt || 0), 0)
    const totalEnergy = latestReadings.reduce((sum: number, reading: any) => sum + (reading.kwh || 0), 0)
    const avgPowerFactor =
      latestReadings.length > 0
        ? latestReadings.reduce((sum: number, reading: any) => {
            const avgPf = ((reading.pf1 || 0) + (reading.pf2 || 0) + (reading.pf3 || 0)) / 3
            return sum + avgPf
          }, 0) / latestReadings.length
        : 0

    // Get historical data for trends (last available data)
    const historicalData = (await executeQuery(`
      SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as hour,
        AVG(kwt) as avg_power,
        SUM(kwh) as total_energy,
        COUNT(*) as reading_count
      FROM meter_readings 
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
      ORDER BY hour
      LIMIT 24
    `)) as any[]

    // Create top meters data from latest readings
    const topMeters = latestReadings.map((reading: any) => ({
      name: reading.meter_id === "MTR-001" ? "Main Building" : `Meter ${reading.meter_id}`,
      kwt: reading.kwt || 0,
    }))

    const stats = {
      totalPower: Math.round(totalPower * 100) / 100,
      totalEnergy: Math.round(totalEnergy * 100) / 100,
      avgPowerFactor: Math.round(avgPowerFactor * 1000) / 1000,
      meterCount: latestReadings.length,
      historicalData,
      latestReadings,
      topMeters,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
