import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);
dotenv.config({ path: "../.env" });

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    let shuttingDown = false;

    async function shutdown() {
      if (shuttingDown) return;
      shuttingDown = true;

      console.log("Shutting down...");

      server.close(async () => {
        try {
          await mongoose.disconnect();
          process.exitCode = 0;
        } catch (error) {
          console.error("Database shutdown failed:", error.message);
          process.exitCode = 1;
        }
      });
    }

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("Application startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
