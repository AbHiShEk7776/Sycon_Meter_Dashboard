import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    // Check for various alert conditions
    const alerts = []

    // Low power factor alert
    const lowPowerFactorReadings = await executeQuery(`
      SELECT meter_id, pf1, pf2, pf3, timestamp
      FROM meter_readings mr1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM meter_readings mr2 
        WHERE mr2.meter_id = mr1.meter_id
      )
      AND (pf1 < 0.85 OR pf2 < 0.85 OR pf3 < 0.85)
    `)

    for (const reading of lowPowerFactorReadings as any[]) {
      alerts.push({
        id: `pf_${reading.meter_id}`,
        type: "warning",
        title: "Low Power Factor",
        message: `Power factor below 0.85 on meter ${reading.meter_id}`,
        meter_id: reading.meter_id,
        value: `PF1: ${reading.pf1?.toFixed(2)}, PF2: ${reading.pf2?.toFixed(2)}, PF3: ${reading.pf3?.toFixed(2)}`,
        timestamp: reading.timestamp,
        status: "active",
      })
    }

    // High power consumption alert
    const highPowerReadings = await executeQuery(`
      SELECT meter_id, kwt, timestamp
      FROM meter_readings mr1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM meter_readings mr2 
        WHERE mr2.meter_id = mr1.meter_id
      )
      AND kwt > 50000
    `)

    for (const reading of highPowerReadings as any[]) {
      alerts.push({
        id: `power_${reading.meter_id}`,
        type: "critical",
        title: "High Power Consumption",
        message: `Power consumption exceeds 50kW on meter ${reading.meter_id}`,
        meter_id: reading.meter_id,
        value: `${reading.kwt?.toFixed(1)} kW`,
        timestamp: reading.timestamp,
        status: "active",
      })
    }

    // Voltage imbalance alert
    const voltageImbalanceReadings = await executeQuery(`
      SELECT meter_id, v1, v2, v3, timestamp
      FROM meter_readings mr1
      WHERE timestamp = (
        SELECT MAX(timestamp) 
        FROM meter_readings mr2 
        WHERE mr2.meter_id = mr1.meter_id
      )
      AND (
        ABS(v1 - v2) > 10 OR 
        ABS(v2 - v3) > 10 OR 
        ABS(v1 - v3) > 10
      )
    `)

    for (const reading of voltageImbalanceReadings as any[]) {
      alerts.push({
        id: `voltage_${reading.meter_id}`,
        type: "warning",
        title: "Voltage Imbalance",
        message: `Voltage imbalance detected on meter ${reading.meter_id}`,
        meter_id: reading.meter_id,
        value: `V1: ${reading.v1?.toFixed(1)}V, V2: ${reading.v2?.toFixed(1)}V, V3: ${reading.v3?.toFixed(1)}V`,
        timestamp: reading.timestamp,
        status: "active",
      })
    }

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
