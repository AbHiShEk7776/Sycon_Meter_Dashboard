"use client"

import { useEffect, useRef, useState } from "react"

export interface WebSocketMessage {
  type: "meter_reading" | "alert" | "system_status"
  data: any
  timestamp: string
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("disconnected")
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    function connect() {
      try {
        const ws = new WebSocket(url)

        ws.onopen = () => {
          setConnectionStatus("connected")
          setSocket(ws)
          console.log("WebSocket connected")
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            setLastMessage(message)
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error)
          }
        }

        ws.onclose = () => {
          setConnectionStatus("disconnected")
          setSocket(null)

          // Reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionStatus("connecting")
            connect()
          }, 5000)
        }

        ws.onerror = (error) => {
          console.error("WebSocket error:", error)
          setConnectionStatus("disconnected")
        }
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error)
        setConnectionStatus("disconnected")
      }
    }

    setConnectionStatus("connecting")
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close()
      }
    }
  }, [url])

  const sendMessage = (message: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message))
    }
  }

  return { lastMessage, connectionStatus, sendMessage }
}
