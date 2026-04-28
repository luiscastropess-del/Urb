import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { action, ids, data } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: 'Ids must be provided' }, { status: 400 });
    }

    if (action === 'delete') {
      await db.place.deleteMany({
        where: { id: { in: ids } }
      });
      return NextResponse.json({ success: true, message: `${ids.length} locais excluídos com sucesso.` });
    }

    if (action === 'update' && data) {
      await db.place.updateMany({
        where: { id: { in: ids } },
        data // update fields (e.g. category)
      });
      return NextResponse.json({ success: true, message: `${ids.length} locais atualizados com sucesso.` });
    }

    return NextResponse.json({ success: false, error: 'Ação inválida.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
