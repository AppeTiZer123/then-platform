import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Dynamic import to avoid module import-time errors when DATABASE_URL is missing
    const mod = await import('@/lib/actions/reports');
    const data = await mod.getAllReports();
    return NextResponse.json({ ok: true, data });
  } catch (error: any) {
    console.error('API error fetching reports', error);
    const message = error?.message || String(error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch reports', message }, { status: 500 });
  }
}
