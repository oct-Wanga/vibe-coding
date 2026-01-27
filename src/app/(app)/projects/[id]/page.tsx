import { ProjectDetailClient } from "@/views/projects";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return <ProjectDetailClient id={id} />;
}
