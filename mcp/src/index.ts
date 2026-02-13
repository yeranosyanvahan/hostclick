import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const app = express();
app.use(express.json());

const transports = new Map<string, SSEServerTransport>();

// --- MOVE THE LOGIC INSIDE THE ROUTE ---
app.get("/sse", async (req, res) => {
    console.log("📡 New SSE Connection Request");

    // 1. Create a NEW server for THIS specific request
    const server = new McpServer({
        name: "komonal-shell-brain",
        version: "1.0.0"
    });

    // 2. Register tools to THIS server instance
    server.tool(
        "run_command",
        "Executes a shell command",
        { command: z.string().describe("The command to run") },
        async ({ command }) => {
            const { stdout, stderr } = await execPromise(command);
            return { content: [{ type: "text", text: stdout || stderr }] };
        }
    );

    // 3. Create the transport
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);
    
    // 4. Connect THIS server to THIS transport
    await server.connect(transport);

    req.on("close", async () => {
        console.log(`🔌 Cleaning up session ${transport.sessionId}`);
        transports.delete(transport.sessionId);
        await server.close(); // Crucial: close the server when client leaves
    });
});

app.post("/messages", async (req, res) => {
    const transport = transports.get(req.query.sessionId as string);
    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(404).send("Session not found");
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("🧠 MCP Server fixed and listening on port 3000");
});