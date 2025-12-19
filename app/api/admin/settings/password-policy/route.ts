import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const FILE = path.join(DATA_DIR, 'password-policy.json')

export async function GET() {
  try {
    const content = await fs.readFile(FILE, 'utf-8')
    const data = JSON.parse(content)
    return NextResponse.json(data)
  } catch (err) {
    // if file not found, return default
    return NextResponse.json({ minLength: 8 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const minLength = Number(body.minLength) || 8
    // ensure data dir exists
    await fs.mkdir(DATA_DIR, { recursive: true })
    const payload = { minLength }
    await fs.writeFile(FILE, JSON.stringify(payload, null, 2), 'utf-8')
    return NextResponse.json({ ok: true, ...payload })
  } catch (err) {
    return new NextResponse(JSON.stringify({ ok: false, error: 'Failed to save' }), { status: 500 })
  }
}
