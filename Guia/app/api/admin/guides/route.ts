import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// Endpoint para integração com o painel admin externo (adm-urbano.onrender.com)
// Permite listar perfis de guias locais (destacando assinatura gratuita)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiSecret = request.headers.get('x-api-secret');
    
    // Opcional: Adicionar proteção via token/API Key. 
    // if (apiSecret !== process.env.ADMIN_API_SECRET) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const status = searchParams.get('status');
    
    const filters: any = {};
    if (status) {
      filters.status = status;
    }

    const guides = await db.guideProfile.findMany({
      where: filters,
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        subscriptions: {
          where: { status: 'active' },
          include: { plan: true },
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatar resposta para facilitar a IA do Painel Admin
    const formattedGuides = guides.map(g => {
      const isFree = g.subscriptions.length === 0 || g.subscriptions[0].plan.name.toLowerCase() === 'free';
      return {
        id: g.id,
        userId: g.userId,
        name: g.user.name,
        email: g.user.email,
        status: g.status,
        plan: isFree ? 'free' : g.subscriptions[0].plan.name,
        isFreeTier: isFree,
        languages: g.languages,
        createdAt: g.createdAt,
      };
    });

    return NextResponse.json({ 
      success: true, 
      guides: formattedGuides 
    }, { 
      headers: {
        'Access-Control-Allow-Origin': 'https://adm-urbano.onrender.com', // Permitir CORS para o painel admin
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-secret',
      } 
    });

  } catch (error) {
    console.error("Admin Integration Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Opções HTTP para lidar com preflight requests de CORS
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': 'https://adm-urbano.onrender.com',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-secret',
    },
  });
}
