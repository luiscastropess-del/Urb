import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuideProfileClient from "./GuideProfileClient";

export default async function GuidePublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const guideId = (await params).id;

  const profile = await db.guideProfile.findUnique({
    where: { id: guideId },
    include: {
      user: true,
      routes: {
        where: { status: "ACTIVE" },
        take: 5,
      },
      packages: {
        where: { status: "ACTIVE" },
        take: 5,
      },
      subscriptions: {
        include: { plan: true },
      },
    },
  });

  if (!profile) {
    return notFound();
  }

  // Determine if free plan
  const activeSubscription = profile.subscriptions;
  const planInfo = activeSubscription?.plan;
  const planName = planInfo?.name?.toLowerCase() || "";
  const isUltimate = planName.includes("ultimate");
  const isPro = planName.includes("pro") || isUltimate;
  const isFree = !isPro;

  return (
    <GuideProfileClient
      profile={profile}
      isFree={isFree}
      isUltimate={isUltimate}
      planName={planInfo?.name || "Plano Free"}
    />
  );
}
