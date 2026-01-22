import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envSet = !!process.env.DATABASE_URL;
    let dbOk = false;
    let count = null;
    let errorMsg = null;

    try {
      // Try dynamic import and a simple query to count reports
      const mod = await import('@/lib/actions/reports');
      const results = await mod.getAllReports();
      dbOk = Array.isArray(results);
      count = dbOk ? results.length : null;
    } catch (err: any) {
      errorMsg = err?.message || String(err);
    }

    return NextResponse.json({ ok: true, env: { DATABASE_URL: envSet }, dbOk, count, error: errorMsg });
  } catch (error: any) {
    console.error('Diagnose error', error);
    return NextResponse.json({ ok: false, error: error?.message || String(error) }, { status: 500 });
  }
}
