import type { NextRequest } from "next/server"
import { executeQuery } from "@/lib/database"

export async function GET(request: NextRequest) {
  // This would typically be handled by a separate WebSocket server
  // For demo purposes, we'll return a Server-Sent Events stream

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = async () => {
        try {
          // Get latest readings
          const latestReadings = await executeQuery(`
            SELECT * FROM meter_readings 
            WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
            ORDER BY timestamp DESC
            LIMIT 10
          `)

          const message = {
            type: "meter_reading",
            data: latestReadings,
            timestamp: new Date().toISOString(),
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`))
        } catch (error) {
          console.error("Error fetching real-time data:", error)
        }
      }

      // Send initial data
      sendUpdate()

      // Set up interval for real-time updates
      const interval = setInterval(sendUpdate, 5000) // Every 5 seconds

      // Cleanup function
      return () => {
        clearInterval(interval)
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
