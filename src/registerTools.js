import * as z from "zod";
import { getTopStories, searchTechNews } from "./news.js";

export function registerNewsTools(server) {
  server.tool(
    "search_tech_news",
    "Search Hacker News for tech stories by keyword (real API).",
    {
      query: z.string().describe("Search query, e.g. AI, OpenAI, LangChain"),
      limit: z.number().optional().describe("Max results 1-10, default 5"),
    },
    async ({ query, limit }) => {
      const text = await searchTechNews(query, limit ?? 5);
      return { content: [{ type: "text", text }] };
    }
  );

  server.tool(
    "get_top_stories",
    "Get current top stories from Hacker News front page.",
    {
      limit: z.number().optional().describe("Max results 1-10, default 5"),
    },
    async ({ limit }) => {
      const text = await getTopStories(limit ?? 5);
      return { content: [{ type: "text", text }] };
    }
  );
}
