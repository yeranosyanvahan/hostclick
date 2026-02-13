import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";

const app = express();

app.get("/sse", async (req, res) => {
    // New server instance per connection to avoid "Already connected" error
    const server = new Server(
        { name: "mcp-brain", version: "1.0.0" },
        { capabilities: { tools: {} } }
    );

    // Register a test tool
    server.tool("hello-brain", {}, async () => ({
        content: [{ type: "text", text: "Brain is online and containerized!" }]
    }));

    const transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);

    req.on("close", async () => {
        await server.close();
    });
});

app.post("/messages", async (req, res) => {
    // The transport handles this internally via the sessionId
});

app.listen(3000, "0.0.0.0", () => {
    console.log("🧠 MCP Brain Container Ready on port 3000");
});