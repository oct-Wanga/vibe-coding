import Link from "next/link";
import { notFound } from "next/navigation";

import { getDiscoveryItemById } from "@/entities/discovery";
import { routes } from "@/shared/config/routes";
import { Badge, Card, CardContent, CardHeader } from "@/shared/ui";

export function DiscoveryDetailView({ id }: { id: string }) {
  const item = getDiscoveryItemById(id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link className="text-sm underline" href={routes.discovery}>
        Back
      </Link>

      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">{item.title}</h1>
          <div className="text-sm text-gray-500">ID: {item.id}</div>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <div className="text-sm">Category</div>
          <Badge>{item.category}</Badge>
        </CardContent>
        <CardContent>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </CardContent>
      </Card>
    </div>
  );
}
