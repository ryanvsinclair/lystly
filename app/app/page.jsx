import { ProjectsBoard } from "@/components/ProjectsBoard";
import { createClient } from "@/lib/supabase/server";
import { projectCardData } from "@/lib/project-preview.js";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("projects")
    .select("id, title, updated_at, listing, studio")
    .order("updated_at", { ascending: false });

  return (
    <div className="projects-page">
      <ProjectsBoard projects={(rows || []).map(projectCardData)} />
    </div>
  );
}
