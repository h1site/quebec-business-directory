import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')
  const secret = searchParams.get('secret')

  // Simple secret check (use env var in production)
  if (secret !== process.env.REVALIDATE_SECRET && secret !== 'purge2024') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!path) {
    return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
  }

  try {
    revalidatePath(path)
    return NextResponse.json({
      revalidated: true,
      path,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { paths, secret } = body

  if (secret !== process.env.REVALIDATE_SECRET && secret !== 'purge2024') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  if (!paths || !Array.isArray(paths)) {
    return NextResponse.json({ error: 'Missing paths array' }, { status: 400 })
  }

  try {
    const results = paths.map((path: string) => {
      revalidatePath(path)
      return { path, revalidated: true }
    })

    return NextResponse.json({
      revalidated: true,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
