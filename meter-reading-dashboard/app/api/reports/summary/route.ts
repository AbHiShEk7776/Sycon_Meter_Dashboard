import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const meterId = searchParams.get("meterId") || "MTR-001"
    const days = searchParams.get("days") || "30"

    // Get summary statistics
    const summaryData = await executeQuery(
      `
      SELECT 
        COUNT(*) as total_readings,
        AVG(kwt) as avg_power,
        MAX(kwt) as peak_power,
        MIN(kwt) as min_power,
        AVG(kwh) as avg_energy,
        MAX(kwh) as max_energy,
        AVG((COALESCE(pf1, 0) + COALESCE(pf2, 0) + COALESCE(pf3, 0)) / 3) as avg_power_factor,
        MIN((COALESCE(pf1, 0) + COALESCE(pf2, 0) + COALESCE(pf3, 0)) / 3) as min_power_factor,
        AVG((COALESCE(v1, 0) + COALESCE(v2, 0) + COALESCE(v3, 0)) / 3) as avg_voltage,
        MIN(timestamp) as first_reading,
        MAX(timestamp) as last_reading
      FROM meter_readings 
      WHERE meter_id = ?
    `,
      [meterId],
    )

    const summary = summaryData[0] || {}

    // Calculate costs (assuming $0.15 per kWh)
    const totalCost = (summary.avg_energy || 0) * 0.15
    const peakDemandCharge = ((summary.peak_power || 0) * 12.5) / 1000 // $12.5 per kW
    const totalBill = totalCost + peakDemandCharge

    // Calculate efficiency metrics
    const powerFactorEfficiency = (summary.avg_power_factor || 0) * 100
    const voltageStability = summary.avg_voltage > 220 && summary.avg_voltage < 240 ? "Good" : "Needs Attention"

    return NextResponse.json({
      ...summary,
      total_cost: Math.round(totalCost * 100) / 100,
      peak_demand_charge: Math.round(peakDemandCharge * 100) / 100,
      total_bill: Math.round(totalBill * 100) / 100,
      power_factor_efficiency: Math.round(powerFactorEfficiency * 100) / 100,
      voltage_stability: voltageStability,
      efficiency_rating: powerFactorEfficiency > 90 ? "Excellent" : powerFactorEfficiency > 80 ? "Good" : "Poor",
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch summary data" }, { status: 500 })
  }
}
