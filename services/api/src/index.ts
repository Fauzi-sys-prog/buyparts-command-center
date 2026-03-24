import { closePool } from "./db/client.js";
import { getEnv } from "./config/env.js";
import { buildServer } from "./server.js";

async function main() {
  const app = buildServer();
  const { apiPort } = getEnv();

  try {
    await app.listen({
      port: apiPort,
      host: "0.0.0.0"
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await closePool();
    process.exit(0);
  });
}

void main();
