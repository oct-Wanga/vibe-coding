import { DiscoveryDetailView } from "@/views/discovery";

export default async function DiscoveryDetailPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <DiscoveryDetailView id={id} />;
}
