import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import pool from '@/app/lib/Database/db';
// import { Cashier } from '@/app/lib/Interface/interface';
// import { User } from '@/app/lib/Interface/interface';
interface CashierResult {
    id: number
    name: string
    email: string
    user_type: string
    last_login: string
    address:string
    active:number
    gender:string
    contact_number:string
    total_hours_worked: number
    total_earnings: number
    cashier_lane_id: number
}
import { FieldPacket } from 'mysql2';
export async function GET(req: NextRequest) {
  if (req.method === 'GET') {
    let connection;
    // const { startDate, endDate } = await req.json()
    try {
      connection = await pool.getConnection();
      // Query to get all cashier names
        const [rows]: [CashierResult[],FieldPacket[]] = await connection.query(
            `
            SELECT 
                u.name,
                u.last_login,
                u.active,
                u.address,
                u.gender,
                u.contact_number,
                c.id,
                COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.time_in, a.time_out) / 60), 0) AS total_hours_worked,
                COALESCE(SUM(TIMESTAMPDIFF(MINUTE, a.time_in, a.time_out) / 60) * c.rate, 0) AS total_earnings,
                cl.id AS cashier_lane_id
            FROM Cashier c
            JOIN User u ON c.user_id = u.id
            LEFT JOIN Attendance a ON c.id = a.cashier_id
            LEFT JOIN CashierLane cl 
                ON c.id = cl.cashier1_id OR c.id = cl.cashier2_id OR c.id = cl.cashier3_id
            WHERE u.user_type = 'cashier'
            GROUP BY u.id
            ORDER BY u.name ASC
            `
        ) as [CashierResult[],FieldPacket[]];
        // Extract just the names from the result
        const data = rows.map((row: CashierResult) => ({
            key: String(row.id),
            id: row.id,
            name: row.name,
            last_login: row.last_login,
            address: row.address,
            active: row.active,
            gender: row.gender,
            contact_number: row.contact_number,
            total_hours_worked: row.total_hours_worked,
            total_earnings: row.total_earnings,
            cashier_lane_id: row.cashier_lane_id 
        }));
        
        return NextResponse.json(
            { data },
            { status: 200 }
        );
    } catch (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cashiers' },
        { status: 500 }
      );
    } finally {
      if (connection) connection.release();
    }
  }
  
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}