import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meterId = searchParams.get("meterId") || "MTR-001"
    const days = Number.parseInt(searchParams.get("days") || "7")

    // Get historical data for trend analysis
    const historicalData = (await executeQuery(
      `
      SELECT 
        DATE(timestamp) as date,
        AVG(kwt) as avg_power,
        MAX(kwt) as peak_power,
        AVG(kwh) as avg_energy,
        COUNT(*) as reading_count
      FROM meter_readings 
      WHERE meter_id = ? 
        AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(timestamp)
      ORDER BY date
    `,
      [meterId],
    )) as any[]

    if (historicalData.length < 7) {
      return NextResponse.json({ error: "Insufficient historical data for forecasting" }, { status: 400 })
    }

    // Simple linear regression for forecasting
    const forecast = []
    const recentData = historicalData.slice(-14) // Last 14 days for trend

    // Calculate trend
    const xValues = recentData.map((_, index) => index)
    const yValues = recentData.map((d) => d.avg_power)

    const n = recentData.length
    const sumX = xValues.reduce((a, b) => a + b, 0)
    const sumY = yValues.reduce((a, b) => a + b, 0)
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
    const sumXX = xValues.reduce((sum, x) => sum + x * x, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Generate forecast for next 'days' days
    for (let i = 1; i <= days; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i)

      const predictedPower = intercept + slope * (n + i - 1)
      const confidence = Math.max(0.6, 1 - i * 0.05) // Decreasing confidence over time

      forecast.push({
        date: futureDate.toISOString().split("T")[0],
        predicted_power: Math.max(0, predictedPower),
        confidence_level: confidence,
        predicted_energy: Math.max(0, predictedPower * 24), // Assuming 24 hours
        trend: slope > 0 ? "increasing" : slope < 0 ? "decreasing" : "stable",
      })
    }

    return NextResponse.json({
      meter_id: meterId,
      forecast_period: `${days} days`,
      historical_data_points: historicalData.length,
      trend_slope: slope,
      forecast,
    })
  } catch (error) {
    console.error("Forecast error:", error)
    return NextResponse.json({ error: "Failed to generate forecast" }, { status: 500 })
  }
}
