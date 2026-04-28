import { NextResponse } from 'next/server';
import { db } from '@urb/shared';

export async function GET() {
  try {
    const places = await db.place.findMany({
      orderBy: { last_updated: 'desc' }
    });
    return NextResponse.json({ places });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
