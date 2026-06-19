/**
 * Stateless MCP server — no SSE sessions (works Render service → service).
 * @see MCP SDK simpleStatelessStreamableHttp example
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { registerNewsTools } from "./registerTools.js";

const PORT = Number(process.env.PORT ?? 3003);

function createServer() {
  const server = new McpServer({ name: "news-mcp", version: "1.0.0" });
  registerNewsTools(server);
  return server;
}

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "news-mcp",
    mode: "stateless",
    tools: ["search_tech_news", "get_top_stories"],
  });
});

app.post("/mcp", async (req, res) => {
  const server = createServer();
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
    res.on("close", () => {
      transport.close();
      server.close();
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: err.message },
        id: null,
      });
    }
  }
});

app.get("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed. Use POST." },
    id: null,
  });
});

app.delete("/mcp", (_req, res) => {
  res.status(405).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Method not allowed." },
    id: null,
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`News MCP (stateless) on 0.0.0.0:${PORT}`);
});
