import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);
const app = express();
app.use(express.json());

// Store transports to link the SSE stream with POST messages
const transports = new Map<string, SSEServerTransport>();

const server = new McpServer({
    name: "komonal-shell-brain",
    version: "1.0.0"
});

/**
 * Tool: run_command
 * Purpose: Allows the AI to execute terminal commands inside the pod.
 */
server.tool(
    "run_command",
    "Executes a shell command in the container and returns stdout/stderr.",
    {
        command: z.string().describe("The full shell command to execute"),
        timeout: z.number().optional().default(30000).describe("Timeout in milliseconds")
    },
    async ({ command, timeout }) => {
        console.log(`🛠️ Executing: ${command}`);
        try {
            const { stdout, stderr } = await execPromise(command, { timeout });
            return {
                content: [
                    { type: "text", text: `STDOUT:\n${stdout}` },
                    { type: "text", text: `STDERR:\n${stderr}` }
                ].filter(c => c.text.length > 8) // Only return if there's actual content
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true
            };
        }
    }
);

// --- SSE INFRASTRUCTURE ---

app.get("/sse", async (req, res) => {
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);
    
    await server.connect(transport);
    console.log(`📡 Session started: ${transport.sessionId}`);

    req.on("close", () => {
        transports.delete(transport.sessionId);
        console.log(`🔌 Session closed: ${transport.sessionId}`);
    });
});

app.post("/messages", async (req, res) => {
    const sessionId = req.query.sessionId as string;
    const transport = transports.get(sessionId);

    if (transport) {
        await transport.handlePostMessage(req, res);
    } else {
        res.status(404).send("Session not found");
    }
});

app.listen(3000, "0.0.0.0", () => {
    console.log("🧠 Shell MCP Server listening on port 3000");
});