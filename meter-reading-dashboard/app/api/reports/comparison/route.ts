import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const meterId = searchParams.get("meterId") || "MTR-001"
    const period = searchParams.get("period") || "daily"

    // Get data grouped by time periods for comparison
    const comparisonData = await executeQuery(
      `
      SELECT 
        DATE_FORMAT(timestamp, '%Y-%m-%d') as date,
        HOUR(timestamp) as hour,
        AVG(kwt) as avg_power,
        AVG(kwh) as avg_energy,
        AVG((COALESCE(pf1, 0) + COALESCE(pf2, 0) + COALESCE(pf3, 0)) / 3) as avg_power_factor,
        COUNT(*) as reading_count
      FROM meter_readings 
      WHERE meter_id = ?
      GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d'), HOUR(timestamp)
      ORDER BY date DESC, hour DESC
      LIMIT 100
    `,
      [meterId],
    )

    // Process data for comparison (current vs previous periods)
    const processedData = comparisonData.reduce((acc: any[], reading: any, index: number) => {
      if (index < 50) {
        // Current period
        const existingEntry = acc.find((entry) => entry.period === reading.date)
        if (existingEntry) {
          existingEntry.current_power += reading.avg_power || 0
          existingEntry.current_energy += reading.avg_energy || 0
          existingEntry.current_count += 1
        } else {
          acc.push({
            period: reading.date,
            current_power: reading.avg_power || 0,
            current_energy: reading.avg_energy || 0,
            previous_power: 0,
            previous_energy: 0,
            current_count: 1,
            previous_count: 0,
          })
        }
      } else {
        // Previous period
        const existingEntry = acc.find((entry) => entry.period === reading.date)
        if (existingEntry) {
          existingEntry.previous_power += reading.avg_power || 0
          existingEntry.previous_energy += reading.avg_energy || 0
          existingEntry.previous_count += 1
        }
      }
      return acc
    }, [])

    // Calculate averages and savings
    const finalData = processedData
      .map((entry) => ({
        ...entry,
        current_power: entry.current_count > 0 ? entry.current_power / entry.current_count : 0,
        current_energy: entry.current_count > 0 ? entry.current_energy / entry.current_count : 0,
        previous_power:
          entry.previous_count > 0 ? entry.previous_power / entry.previous_count : entry.current_power * 1.1,
        previous_energy:
          entry.previous_count > 0 ? entry.previous_energy / entry.previous_count : entry.current_energy * 1.1,
        savings: 0,
      }))
      .map((entry) => ({
        ...entry,
        savings: (entry.previous_energy - entry.current_energy) * 0.15, // $0.15 per kWh
      }))

    return NextResponse.json(finalData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch comparison data" }, { status: 500 })
  }
}
