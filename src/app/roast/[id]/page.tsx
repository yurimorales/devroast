import { Suspense } from "react";
import {
  LoadingFallback,
  RoastResultContent,
} from "@/components/roast-result-content";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoastResultPage({ params }: PageProps) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RoastResultInner params={params} />
    </Suspense>
  );
}

async function RoastResultInner({ params }: PageProps) {
  const { id } = await params;
  return <RoastResultContent id={id} />;
}
