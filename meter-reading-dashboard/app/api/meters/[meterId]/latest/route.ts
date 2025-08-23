import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const readings = (await executeQuery(
      `
      SELECT * FROM meter_readings 
      WHERE meter_id = ? 
      ORDER BY timestamp DESC 
      LIMIT 1
    `,
      [params.meterId],
    )) as any[]

    if (readings.length === 0) {
      return NextResponse.json({ error: "No readings found" }, { status: 404 })
    }

    return NextResponse.json(readings[0])
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch latest reading" }, { status: 500 })
  }
}
