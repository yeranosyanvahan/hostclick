import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const app = express();

// Track transports in a map
const transports = new Map<string, SSEServerTransport>();

app.get("/sse", async (req, res) => {
    const server = new McpServer({
        name: "komonal-shell-brain",
        version: "1.0.0"
    });

    server.tool(
        "run_command",
        "Executes a shell command",
        { command: z.string().describe("The command to run") },
        async ({ command }) => {
            const { stdout, stderr } = await execPromise(command);
            return { content: [{ type: "text", text: stdout || stderr }] };
        }
    );

    // No need for a custom endpoint string here, the SDK handles session routing
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);
    
    await server.connect(transport);

    req.on("close", async () => {
        transports.delete(transport.sessionId);
        await server.close();
    });
});

// IMPORTANT: No express.json() middleware. Let the SDK read the stream.
app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (transport) {
        // Here, we let the SDK read the raw request stream
        await transport.handlePostMessage(req, res);
    } else {
        res.status(404).send("Session not found");
    }
});

const server = app.listen(3000, "0.0.0.0", () => {
    console.log("🧠 MCP Brain Online at port 3000");
});

// Handle SIGTERM gracefully to avoid npm errors
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});