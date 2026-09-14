import { fetchListingImage } from "@/server/scrape.js";

export async function GET(request) {
  try {
    const url = new URL(request.url).searchParams.get("url");
    const image = await fetchListingImage(url);
    return new Response(image.buffer, {
      headers: {
        "Content-Type": image.contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err.message || "Image failed." },
      { status: 400 }
    );
  }
}
