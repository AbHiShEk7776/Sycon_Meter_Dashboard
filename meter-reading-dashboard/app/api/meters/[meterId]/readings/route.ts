import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"
import type { MeterReading } from "@/lib/database"

export async function GET(request: Request, { params }: { params: { meterId: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get("limit") || "100"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = `
      SELECT * FROM meter_readings 
      WHERE meter_id = ?
    `
    const queryParams: any[] = [params.meterId]

    if (startDate && endDate) {
      query += ` AND timestamp BETWEEN ? AND ?`
      queryParams.push(startDate, endDate)
    }

    query += ` ORDER BY timestamp DESC LIMIT ?`
    queryParams.push(Number.parseInt(limit))

    const readings = (await executeQuery(query, queryParams)) as MeterReading[]

    return NextResponse.json(readings)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch readings" }, { status: 500 })
  }
}
