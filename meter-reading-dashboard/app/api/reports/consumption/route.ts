import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const meterId = searchParams.get("meterId") || "MTR-001"
    const period = searchParams.get("period") || "daily"
    const days = searchParams.get("days") || "30"

    let dateFormat = "%Y-%m-%d"
    let groupBy = "DATE(timestamp)"

    if (period === "hourly") {
      dateFormat = "%Y-%m-%d %H:00:00"
      groupBy = "DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')"
    } else if (period === "monthly") {
      dateFormat = "%Y-%m"
      groupBy = "DATE_FORMAT(timestamp, '%Y-%m')"
    }

    const consumptionData = await executeQuery(
      `
      SELECT 
        ${groupBy} as period,
        DATE_FORMAT(timestamp, '${dateFormat}') as formatted_period,
        AVG(kwt) as avg_power,
        MAX(kwt) as peak_power,
        MIN(kwt) as min_power,
        AVG(kwh) as avg_energy,
        MAX(kwh) as max_energy,
        AVG((COALESCE(pf1, 0) + COALESCE(pf2, 0) + COALESCE(pf3, 0)) / 3) as avg_power_factor,
        AVG((COALESCE(v1, 0) + COALESCE(v2, 0) + COALESCE(v3, 0)) / 3) as avg_voltage,
        COUNT(*) as reading_count
      FROM meter_readings 
      WHERE meter_id = ?
      GROUP BY ${groupBy}
      ORDER BY period DESC
      LIMIT 50
    `,
      [meterId],
    )

    return NextResponse.json(consumptionData)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch consumption data" }, { status: 500 })
  }
}
