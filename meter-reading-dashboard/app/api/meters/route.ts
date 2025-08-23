import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET() {
  try {
    // Get all unique meters from readings table with their latest data
    const meters = await executeQuery(`
      SELECT DISTINCT 
        mr.meter_id,
        'Active' as status,
        CASE 
          WHEN mr.meter_id = 'MTR-001' THEN 'Main Building Meter'
          ELSE CONCAT('Meter ', mr.meter_id)
        END as name,
        'Production Facility' as location,
        'Primary electrical feed' as description,
        MAX(mr.timestamp) as last_reading
      FROM meter_readings mr
      GROUP BY mr.meter_id
      ORDER BY mr.meter_id
    `)

    return NextResponse.json(meters)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch meters" }, { status: 500 })
  }
}
