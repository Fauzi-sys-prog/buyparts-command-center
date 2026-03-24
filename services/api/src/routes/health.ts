import type { FastifyPluginAsync } from "fastify";

import { isPostgresConfigured } from "../config/env.js";

export const healthRoute: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => {
    return {
      status: "ok",
      service: "buyparts-api",
      postgresConfigured: isPostgresConfigured(),
      timestamp: new Date().toISOString()
    };
  });
};
