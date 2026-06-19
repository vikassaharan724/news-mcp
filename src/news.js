/**
 * Tech news via Hacker News Algolia API (free, no API key).
 * https://hn.algolia.com/api
 */

export async function searchTechNews(query, limit = 5) {
  const q = String(query ?? "").trim();
  if (!q) throw new Error("query is required");

  const url = new URL("https://hn.algolia.com/api/v1/search");
  url.searchParams.set("query", q);
  url.searchParams.set("tags", "story");
  url.searchParams.set("hitsPerPage", String(Math.min(limit, 10)));

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HN search failed: ${res.status}`);
  const data = await res.json();

  const hits = data.hits ?? [];
  if (!hits.length) return `No Hacker News stories found for "${q}".`;

  const lines = hits.map((h, i) => {
    const title = h.title ?? h.story_title ?? "(no title)";
    const points = h.points ?? 0;
    const link = h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`;
    return `${i + 1}. ${title}\n   ${points} points | ${link}`;
  });

  return [`Search: "${q}" (${hits.length} stories)`, ...lines, "(Source: Hacker News Algolia API)"].join("\n");
}

export async function getTopStories(limit = 5) {
  const url = new URL("https://hacker-news.firebaseio.com/v0/topstories.json");
  const idsRes = await fetch(url);
  if (!idsRes.ok) throw new Error(`HN top stories failed: ${idsRes.status}`);
  const ids = (await idsRes.json()).slice(0, Math.min(limit, 10));

  const items = await Promise.all(
    ids.map(async (id) => {
      const r = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      return r.json();
    })
  );

  const lines = items.map((item, i) => {
    const title = item.title ?? "(no title)";
    const link = item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
    return `${i + 1}. ${title}\n   ${item.score ?? 0} points | ${link}`;
  });

  return [`Top ${items.length} Hacker News stories`, ...lines, "(Source: Hacker News Firebase API)"].join("\n");
}
