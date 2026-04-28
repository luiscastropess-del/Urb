import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

// PUT: Atualiza as configurações de um Guia/Usuário
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params; // O ID deve ser o ID do GuideProfile
    const body = await request.json();

    // CORS & Auth check here if needed

    // Atualiza o perfil do guia e, opcionalmente, o usuário ligado
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.bio) updateData.bio = body.bio;
    if (body.languages) updateData.languages = body.languages;
    if (body.rating !== undefined) updateData.rating = body.rating;
    
    // Se quiser alterar o plano, adicionamos ou atualizamos a Subscription
    if (body.plan) {
      // Find the plan ID
      let plan = await db.plan.findFirst({
        where: { name: { equals: body.plan, mode: 'insensitive' } }
      });
      
      if (!plan && body.plan.toLowerCase() !== 'free') {
         // Generate plan on the fly if it doesn't exist
         plan = await db.plan.create({
            data: {
               name: body.plan,
               description: `Plan ${body.plan}`,
               price: 0,
               interval: "monthly",
            }
         });
      }

      if (plan) {
        await db.subscription.upsert({
          where: { guideId: id },
          create: {
            guideId: id,
            planId: plan.id,
            currentPeriodEnd: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            status: "active"
          },
          update: {
            planId: plan.id,
            status: "active"
          }
        });
      } else if (body.plan.toLowerCase() === 'free') {
        // Remove active subscriptions if moving to free
        await db.subscription.deleteMany({
           where: { guideId: id }
        });
      }
    }

    const updatedProfile = await db.guideProfile.update({
      where: { id },
      data: updateData,
    });

    if (body.userName) {
      await db.user.update({
        where: { id: updatedProfile.userId },
        data: { name: body.userName }
      });
    }

    return NextResponse.json({ 
      success: true, 
      profile: updatedProfile 
    }, { 
      headers: {
        'Access-Control-Allow-Origin': 'https://adm-urbano.onrender.com',
      } 
    });

  } catch (error) {
    console.error("Admin Update Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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
