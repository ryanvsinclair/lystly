import Link from "next/link";
import { signOut } from "@/app/app/actions";

export function AppBar({ children }) {
  return (
    <header className="listly-bar">
      <Link className="listly-bar-brand" href="/app">
        Lystly
      </Link>
      <div className="listly-bar-actions">
        {children}
        <Link className="ghost" href="/app">
          Projects
        </Link>
        <form action={signOut}>
          <button className="ghost" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
