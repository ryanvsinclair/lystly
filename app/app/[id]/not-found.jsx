import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Listing not found</h1>
        <p>That project is missing or you do not have access.</p>
        <Link className="btn-primary" href="/app">
          Back to projects
        </Link>
      </div>
    </div>
  );
}
