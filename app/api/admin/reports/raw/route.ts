import { NextResponse } from 'next/server';
import postgres from 'postgres';

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: 'DATABASE_URL not set' }, { status: 500 });
  }

  const sql = postgres(process.env.DATABASE_URL, { prepare: false });
  try {
    // Return full rows (all columns) from both tables for inspection
    const reportsRows = await sql`
      SELECT * FROM then_app.reports
      LIMIT 500
    `;

    const fraudRows = await sql`
      SELECT * FROM then_app.fraud_reports
      LIMIT 500
    `;

    try { await sql.end(); } catch (_) {}
    return NextResponse.json({ ok: true, reports: reportsRows, fraud_reports: fraudRows });
  } catch (err: any) {
    try { await sql.end(); } catch (_) {}
    console.error('Raw reports error', err);
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}
