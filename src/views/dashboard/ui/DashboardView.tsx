import {Button} from "@/shared/ui/Button";
import {AppShell} from "@/widgets/app-shell";
import {DashboardLayout} from "@/widgets/dashboard-layout";


export function DashboardView() {
  return (
    <AppShell>
      <DashboardLayout title="Dashboard" actions={<Button variant="ghost">Refresh</Button>}>
        <div className="rounded border p-4 text-sm">
          This is a view-level composition example.
        </div>
      </DashboardLayout>
    </AppShell>
  );
}
