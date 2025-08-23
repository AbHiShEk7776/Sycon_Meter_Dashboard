import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "cocacola",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

let connection: mysql.Connection | null = null

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig)
  }
  return connection
}

export async function executeQuery(query: string, params: any[] = []) {
  const conn = await getConnection()
  const [results] = await conn.execute(query, params)
  return results
}

// Database interfaces based on the schema
export interface MeterReading {
  id: number
  meter_id: string
  v1?: number
  v2?: number
  v3?: number
  i1?: number
  i2?: number
  i3?: number
  pf1?: number
  pf2?: number
  pf3?: number
  kva1?: number
  kva2?: number
  kva3?: number
  kvat?: number
  kw1?: number
  kw2?: number
  kw3?: number
  kwt?: number
  kvar1?: number
  kvar2?: number
  kvar3?: number
  kvart?: number
  kvah?: number
  kwh?: number
  kvarh?: number
  timestamp?: Date
}

export interface Meter {
  meter_id: string
  name?: string
  location?: string
  description?: string
  status?: "active" | "inactive"
}
