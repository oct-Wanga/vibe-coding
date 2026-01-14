import {formatProjectLabel, type Project} from "@/entities/project";
import {Button} from "@/shared/ui/Button";
import {AppShell} from "@/widgets/app-shell";
import {DashboardLayout} from "@/widgets/dashboard-layout";


const mockProjects: Project[] = [
  {id: "p1", name: "Alpha", status: "active", ownerId: "u1"},
  {id: "p2", name: "Beta", status: "archived", ownerId: "u1"},
];

export function ProjectListView() {
  return (
    <AppShell>
      <DashboardLayout title="Projects" actions={<Button>Create</Button>}>
        <ul className="space-y-2">
          {mockProjects.map((p) => (
            <li key={p.id} className="rounded border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">{formatProjectLabel(p)}</span>
                <span className="text-gray-500">{p.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </DashboardLayout>
    </AppShell>
  );
}
