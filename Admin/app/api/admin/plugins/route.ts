import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const plugins = await db.plugin.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' }
    });
    return NextResponse.json({ success: true, plugins });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
