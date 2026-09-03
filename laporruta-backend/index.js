require("dotenv").config();

const http = require("http");
const app = require("./src/app");
const socketManager = require("./src/config/socket");
const { closePool } = require("./src/config/database");

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

socketManager.init(server);

server.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] Health: http://localhost:${PORT}/health`);
  console.log(
    `[Server] WebSocket: ws://localhost:${PORT}${process.env.WS_PATH || "/ws"}`,
  );
});

let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) {
    console.log("[Server] Shutdown already in progress...");
    return;
  }

  isShuttingDown = true;

  console.log(`\n[Server] ${signal} received. Shutting down...`);

  try {
    // 1. Close Socket.io
    socketManager.close();

    // 2. Stop accepting new HTTP connections
    await new Promise((resolve) => {
      server.close((err) => {
        if (err) {
          console.error("[Server] HTTP close error:", err);
        } else {
          console.log("[Server] HTTP closed");
        }

        resolve();
      });

      // Close idle keep-alive connections
      if (typeof server.closeIdleConnections === "function") {
        server.closeIdleConnections();
      }
    });

    // 3. Close PostgreSQL pool
    await closePool();

    console.log("[Server] Shutdown complete");

    process.exit(0);
  } catch (error) {
    console.error("[Server] Shutdown error:", error);

    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("[Process] Uncaught:", err);

  shutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason) => {
  console.error("[Process] Rejection:", reason);
});
