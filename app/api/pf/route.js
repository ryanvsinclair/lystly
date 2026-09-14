import { scrapeListing } from "@/server/scrape.js";

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const listing = await scrapeListing(url);
    return Response.json({ ok: true, listing });
  } catch (err) {
    return Response.json(
      { ok: false, error: err.message || "Scrape failed." },
      { status: 400 }
    );
  }
}
