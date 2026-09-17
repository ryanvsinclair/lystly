import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="projects-page">
      <main className="dashboard">
        <div className="dashboard-head">
          <div>
            <h1>Listing not found</h1>
            <p>That project is missing or you do not have access.</p>
          </div>
          <Link className="btn-primary" href="/app">
            Back to projects
          </Link>
        </div>
      </main>
    </div>
  );
}
