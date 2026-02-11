"use client";

import { List } from "react-window";

import { discoveryItems } from "@/entities/discovery";

import { DiscoveryItemRow } from "./DiscoveryItemRow";

export function DiscoveryList() {
  return (
    <div className="overflow-auto" style={{ height: "520px" }}>
      <List
        rowCount={discoveryItems.length}
        rowHeight={140}
        rowProps={{ data: discoveryItems }}
        rowComponent={DiscoveryItemRow}
      />
    </div>
  );
}
