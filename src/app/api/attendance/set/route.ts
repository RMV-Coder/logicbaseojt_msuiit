
import { FieldPacket } from "mysql2";
import pool from '@/app/lib/Database/db';
import { NextRequest, NextResponse } from 'next/server';
// import { TransactionValuesState } from '@/app/lib/Interface/interface';
// import { DateTime } from "luxon";
interface AttendanceData {
    time: string,
    name: string
}
export async function POST(req: NextRequest) {
    if (req.method === 'POST') {
        const {time, name, imageSrc} = await req.json();
        console.log("DATA: ", time, name, imageSrc)
        let connection;
        try {
            connection = await pool.getConnection();
            await connection.beginTransaction();
            console.log('Connection established, begin transaction')
            
            const checkQuery = `
            SELECT * FROM Attendance
            WHERE cashier_id = (SELECT c.id FROM Cashier c
                JOIN User u ON c.user_id = u.id
                WHERE u.name = ?) AND DATE(time_in) = CURDATE()
            `;
            const insertQuery = `
            INSERT INTO Attendance (cashier_id, time_in, time_in_image)
            VALUES((SELECT c.id FROM Cashier c
                JOIN User u ON c.user_id = u.id
                WHERE u.name = ?), ?, ?)
            `;
            const updateQuery = `
            UPDATE Attendance
            SET time_out = ?, time_out_image = ?
            WHERE cashier_id = (SELECT c.id FROM Cashier c
                JOIN User u ON c.user_id = u.id
                WHERE u.name = ?)
            AND DATE(time_in) = CURDATE()
            AND time_out IS NULL
            `;

            const existingRecord:[AttendanceData[], FieldPacket[]] = await connection.query(checkQuery, [name]) as [AttendanceData[], FieldPacket[]];
            if(existingRecord[0].length>0){
                console.log("Record found")
                await connection.query(updateQuery, [time, 'hi', name])
            } else {
                console.log("No Record found")
                await connection.query(insertQuery, [name, time, 'hello'])
            }

            await connection.commit();
            return NextResponse.json({ success: true }, { status: 201 });
        } catch (error) {
            if (connection) await connection.rollback();
            console.error('Transaction Error:', error);
            return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
        } finally {
            if (connection) connection.release();
        }
    } else {
        return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
    }
}