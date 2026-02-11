import Link from "next/link";
import { type RowComponentProps } from "react-window";

import type { DiscoveryItem } from "@/entities/discovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

export function DiscoveryItemRow({
  data,
  index,
  style,
}: RowComponentProps<{
  data: DiscoveryItem[];
}>) {
  const item = data[index];

  return (
    <div className="pb-4" style={style}>
      <Link href={`/discovery/${item.id}`}>
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {item.category}
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
