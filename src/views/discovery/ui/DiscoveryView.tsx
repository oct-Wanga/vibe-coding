import Link from "next/link";

import { routes } from "@/shared/config/routes";
import { Button } from "@/shared/ui";
import { DashboardLayout } from "@/widgets/dashboard-layout";
import { DiscoveryList } from "@/widgets/discovery-list";

export function DiscoveryView() {
  return (
    <DashboardLayout
      title="Discovery"
      actions={
        <Button variant="outline" asChild>
          <Link href={routes.home}>메인으로</Link>
        </Button>
      }
    >
      <DiscoveryList />
    </DashboardLayout>
  );
}
