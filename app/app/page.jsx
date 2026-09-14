import { createClient } from "@/lib/supabase/server";
import { AppBar } from "@/components/AppBar";
import { createProject, deleteProject } from "./actions";

export const dynamic = "force-dynamic";

function formatUpdated(value) {
  if (!value) return "Not saved yet";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <AppBar />
      <main className="dashboard">
        <div className="dashboard-head">
          <div>
            <h1>Projects</h1>
            <p>Open a listing or start a new one.</p>
          </div>
          <form action={createProject}>
            <button className="btn-primary" type="submit">
              New listing
            </button>
          </form>
        </div>

        {!projects?.length ? (
          <p className="empty-projects">No saved listings yet.</p>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div>
                  <h2>{project.title || "Untitled listing"}</h2>
                  <time dateTime={project.updated_at}>{formatUpdated(project.updated_at)}</time>
                </div>
                <div className="project-card-actions">
                  <a className="btn-primary" href={`/app/${project.id}`}>
                    Open
                  </a>
                  <form action={deleteProject}>
                    <input type="hidden" name="id" value={project.id} />
                    <button className="btn-danger" type="submit">
                      Delete
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
