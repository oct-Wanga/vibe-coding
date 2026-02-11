import Link from "next/link";
import React from "react";
import { type RowComponentProps } from "react-window";

import type { Project } from "@/entities/project";
import { Badge } from "@/shared/ui";

export function Item({
  data,
  index,
  style,
}: RowComponentProps<{
  data: Project[];
}>) {
  return (
    <div className="flex items-center justify-between py-2" style={style}>
      <div className="space-y-1">
        <div className="text-sm font-medium">{data[index].name}</div>
        <Badge>{data[index].status}</Badge>
      </div>

      <Link className="text-sm underline" href={`/projects/${data[index].id}`}>
        Open
      </Link>
    </div>
  );
}
