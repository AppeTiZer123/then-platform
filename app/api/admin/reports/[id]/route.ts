import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const mod = await import('@/lib/actions/reports');
    const rpt = await mod.getReportById(id);
    if (!rpt) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true, data: rpt });
  } catch (err: any) {
    console.error('API get report by id error', err);
    return NextResponse.json({ ok: false, message: err?.message || String(err) }, { status: 500 });
  }
}
