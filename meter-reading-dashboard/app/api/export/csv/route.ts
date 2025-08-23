import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meterId = searchParams.get("meterId") || "MTR-001"
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = `
      SELECT 
        meter_id,
        v1, v2, v3,
        i1, i2, i3,
        pf1, pf2, pf3,
        kw1, kw2, kw3, kwt,
        kwh,
        timestamp
      FROM meter_readings 
      WHERE meter_id = ?
    `
    const queryParams: any[] = [meterId]

    if (startDate && endDate) {
      query += ` AND timestamp BETWEEN ? AND ?`
      queryParams.push(startDate, endDate)
    }

    query += ` ORDER BY timestamp DESC LIMIT 10000`

    const readings = (await executeQuery(query, queryParams)) as any[]

    // Generate CSV content
    const headers = [
      "Meter ID",
      "Timestamp",
      "V1 (V)",
      "V2 (V)",
      "V3 (V)",
      "I1 (A)",
      "I2 (A)",
      "I3 (A)",
      "PF1",
      "PF2",
      "PF3",
      "KW1",
      "KW2",
      "KW3",
      "KWT",
      "KWH",
    ]

    let csvContent = headers.join(",") + "\n"

    for (const reading of readings) {
      const row = [
        reading.meter_id,
        reading.timestamp,
        reading.v1?.toFixed(2) || "",
        reading.v2?.toFixed(2) || "",
        reading.v3?.toFixed(2) || "",
        reading.i1?.toFixed(2) || "",
        reading.i2?.toFixed(2) || "",
        reading.i3?.toFixed(2) || "",
        reading.pf1?.toFixed(3) || "",
        reading.pf2?.toFixed(3) || "",
        reading.pf3?.toFixed(3) || "",
        reading.kw1?.toFixed(2) || "",
        reading.kw2?.toFixed(2) || "",
        reading.kw3?.toFixed(2) || "",
        reading.kwt?.toFixed(2) || "",
        reading.kwh?.toFixed(2) || "",
      ]
      csvContent += row.join(",") + "\n"
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="meter_${meterId}_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 })
  }
}
